"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ALLOWED_EMOJIS } from "@/lib/constants";
import { localDateTimeToUtcIso, validateSlotDuration } from "@/lib/date";
import { env, isPushConfigured, requireEnv } from "@/lib/env";
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

async function sendPushAfterCheckIn(payload: { slotId: string; actorId: string; emoji: string }) {
  if (!isPushConfigured) {
    return;
  }

  const endpoint = `${requireEnv("SUPABASE_EDGE_FUNCTION_URL").replace(/\/$/, "")}/send-checkin-push`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireEnv("SUPABASE_SERVICE_ROLE_KEY")}`,
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const startLocal = String(formData.get("start_local") ?? "");
  const endLocal = String(formData.get("end_local") ?? "");
  const offset = Number(formData.get("timezone_offset_minutes") ?? "0");

  if (!title || !startLocal || !endLocal) {
    return { error: "Please fill all required fields" };
  }

  let startAtIso: string;
  let endAtIso: string;

  try {
    startAtIso = localDateTimeToUtcIso(startLocal, offset);
    endAtIso = localDateTimeToUtcIso(endLocal, offset);
    validateSlotDuration(startAtIso, endAtIso);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid time range" };
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
    return { error: error.message };
  }

  redirect(`/slot/${data.id}`);
}

export async function deleteSlotAction(slotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  const { error } = await supabase
    .from("slots")
    .delete()
    .eq("id", slotId)
    .eq("creator_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function checkInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required" };
  }

  const slotId = String(formData.get("slot_id") ?? "");
  const emoji = String(formData.get("emoji") ?? "");

  if (!slotId || !emoji) {
    return { error: "Slot and emoji are required" };
  }

  if (!ALLOWED_EMOJIS.includes(emoji as (typeof ALLOWED_EMOJIS)[number])) {
    return { error: "Unsupported emoji" };
  }

  const { error } = await supabase.from("check_ins").insert({
    slot_id: slotId,
    user_id: user.id,
    emoji,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/slot/${slotId}`);
  revalidatePath("/dashboard");

  await sendPushAfterCheckIn({
    slotId,
    actorId: user.id,
    emoji,
  });

  return defaultActionState;
}
