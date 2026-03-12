"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ALLOWED_EMOJIS, SLOT_MAX_HOURS, SLOT_MIN_HOURS } from "@/lib/constants";
import { localDateTimeToUtcIso, validateSlotDuration } from "@/lib/date";
import { env, isPushConfigured, requireEnv } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  error: string | null;
};

const defaultActionState: ActionState = {
  error: null,
};

function getBaseUrlFromHeaders(headerStore: Awaited<ReturnType<typeof headers>>) {
  const origin = headerStore.get("origin");
  if (origin) return origin;

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  return env.siteUrl;
}

async function getActionStrings() {
  const locale = await getServerLocale();
  return getDictionary(locale);
}

async function sendPushAfterCheckIn(payload: {
  slotId: string;
  actorId: string;
  emoji: string;
  accessToken?: string | null;
}) {
  if (!isPushConfigured) {
    return;
  }

  const edgeBaseUrl = requireEnv("SUPABASE_EDGE_FUNCTION_URL")
    .replace(/\/$/, "")
    .replace(/\/send-checkin-push$/, "");
  const endpoint = `${edgeBaseUrl}/send-checkin-push`;
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const internalToken = requireEnv("PUSH_INTERNAL_TOKEN").trim();
  const authorizationToken = payload.accessToken?.trim() || requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${authorizationToken}`,
      "x-internal-token": internalToken,
    },
    body: JSON.stringify({
      slot_id: payload.slotId,
      actor_id: payload.actorId,
      emoji: payload.emoji,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Push notification invoke failed", response.status, body);
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headerStore = await headers();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrlFromHeaders(headerStore)}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createSlotAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const strings = await getActionStrings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: strings.createSlot.errorAuthRequired };
  }

  const title = String(formData.get("title") ?? "").trim();
  const dateLocal = String(formData.get("date_local") ?? "");
  const timeLocal = String(formData.get("time_local") ?? "");
  const durationRaw = String(formData.get("duration_hours") ?? "");
  const offset = Number(formData.get("timezone_offset_minutes") ?? "0");
  const durationHours = Number(durationRaw);

  if (!title || !dateLocal || !timeLocal || !durationRaw) {
    return { error: strings.createSlot.errorRequiredFields };
  }

  if (!Number.isFinite(durationHours)) {
    return { error: strings.createSlot.errorDurationNumber };
  }

  if (durationHours > SLOT_MAX_HOURS) {
    return { error: strings.createSlot.durationMaxError };
  }

  if (durationHours < SLOT_MIN_HOURS) {
    return { error: strings.createSlot.errorDurationMin };
  }

  let startAtIso: string;
  let endAtIso: string;

  try {
    const startLocal = `${dateLocal}T${timeLocal}`;
    startAtIso = localDateTimeToUtcIso(startLocal, offset);
    endAtIso = new Date(new Date(startAtIso).getTime() + durationHours * 60 * 60 * 1000).toISOString();
    validateSlotDuration(startAtIso, endAtIso);
  } catch {
    return { error: strings.createSlot.errorInvalidTimeRange };
  }

  const { data, error } = await supabase
    .from("slots")
    .insert({
      creator_id: user.id,
      title,
      start_at: startAtIso,
      end_at: endAtIso,
    })
    .select("id")
    .single();

  if (error) {
    return { error: strings.createSlot.errorCreateFailed };
  }

  redirect(`/linket/${data.id}`);
}

export async function deleteSlotAction(slotId: string) {
  const strings = await getActionStrings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(strings.slot.errorAuthRequired);
  }

  const { error } = await supabase
    .from("slots")
    .delete()
    .eq("id", slotId)
    .eq("creator_id", user.id);

  if (error) {
    throw new Error(strings.slot.errorDeleteFailed);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function checkInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const strings = await getActionStrings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: strings.slot.errorAuthRequired };
  }

  const slotId = String(formData.get("slot_id") ?? "");
  const emoji = String(formData.get("emoji") ?? "");

  if (!slotId || !emoji) {
    return { error: strings.slot.errorLinketEmojiRequired };
  }

  if (!ALLOWED_EMOJIS.includes(emoji as (typeof ALLOWED_EMOJIS)[number])) {
    return { error: strings.slot.errorUnsupportedEmoji };
  }

  const { error } = await supabase.from("check_ins").insert({
    slot_id: slotId,
    user_id: user.id,
    emoji,
  });

  if (error) {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("cooldown active")) {
      return { error: strings.slot.recentCooldown };
    }

    if (errorMessage.includes("only while the linket is active")) {
      return { error: strings.slot.errorActiveWindow };
    }

    return { error: strings.slot.errorCheckInFailed };
  }

  revalidatePath(`/linket/${slotId}`);
  revalidatePath("/dashboard");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  await sendPushAfterCheckIn({
    slotId,
    actorId: user.id,
    emoji,
    accessToken: session?.access_token ?? null,
  });

  return defaultActionState;
}
