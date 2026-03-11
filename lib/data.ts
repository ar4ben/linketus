import { cache } from "react";

import type { CheckIn, Slot } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type DashboardFeedItem = Slot & {
  isMine: boolean;
};

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getSlotById = cache(async (slotId: string): Promise<Slot | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slots")
    .select(
      "id, creator_id, title, start_at, end_at, created_at, creator:profiles!slots_creator_id_fkey(id, full_name, avatar_url)",
    )
    .eq("id", slotId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return data as unknown as Slot;
});

export const getCheckInsBySlotId = cache(async (slotId: string): Promise<CheckIn[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("check_ins")
    .select("id, slot_id, user_id, emoji, created_at, profiles(id, full_name, avatar_url)")
    .eq("slot_id", slotId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as CheckIn[];
});

export async function getDashboardSlots(userId: string) {
  const supabase = await createClient();

  const [{ data: mySlots, error: mySlotsError }, { data: participated, error: participatedError }] =
    await Promise.all([
      supabase
        .from("slots")
        .select("id, creator_id, title, start_at, end_at, created_at")
        .eq("creator_id", userId)
        .order("start_at", { ascending: false }),
      supabase.rpc("get_participated_slots", { p_user_id: userId }),
    ]);

  if (mySlotsError) {
    throw new Error(mySlotsError.message);
  }

  if (participatedError) {
    throw new Error(participatedError.message);
  }

  const merged = new Map<string, DashboardFeedItem>();

  for (const slot of (mySlots ?? []) as Slot[]) {
    merged.set(slot.id, {
      ...slot,
      isMine: true,
    });
  }

  for (const slot of (participated ?? []) as Slot[]) {
    const existing = merged.get(slot.id);
    if (existing) {
      continue;
    }

    merged.set(slot.id, {
      ...slot,
      isMine: slot.creator_id === userId,
    });
  }

  const feed = [...merged.values()].sort((a, b) => {
    const createdDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (createdDiff !== 0) {
      return createdDiff;
    }

    return new Date(b.start_at).getTime() - new Date(a.start_at).getTime();
  });

  return {
    mySlots: (mySlots ?? []) as Slot[],
    participated: (participated ?? []) as Slot[],
    feed,
  };
}
