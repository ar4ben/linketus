"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { checkInAction } from "@/app/actions";
import { LocalDateTime } from "@/components/local-date-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckIn, Slot } from "@/lib/db";
import { formatDuration, getSlotState, type SlotState } from "@/lib/date";
import type { Dictionary, Locale } from "@/lib/i18n/shared";
import { createClient } from "@/lib/supabase/client";

type SlotClientProps = {
  slot: Slot;
  initialCheckIns: CheckIn[];
  currentUserId: string | null;
  hasJoined: boolean;
  signInUrl: string;
  locale: Locale;
  strings: Dictionary[Locale]["slot"];
};

type IncomingCheckIn = {
  id: string;
  slot_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

const stateStyles: Record<SlotState, string> = {
  waiting: "bg-amber-100 text-amber-900",
  active: "bg-emerald-100 text-emerald-900",
  archive: "bg-slate-200 text-slate-700",
};

export function SlotClient({
  slot,
  initialCheckIns,
  currentUserId,
  hasJoined,
  signInUrl,
  locale,
  strings,
}: SlotClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [now, setNow] = useState(() => new Date(slot.start_at).getTime());
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [canViewParticipants, setCanViewParticipants] = useState(hasJoined);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const state = useMemo(
    () => getSlotState(slot.start_at, slot.end_at, new Date(now)),
    [slot.start_at, slot.end_at, now],
  );

  const countdownText = useMemo(() => {
    if (state === "archive") {
      return null;
    }

    const target = state === "waiting" ? new Date(slot.start_at).getTime() : new Date(slot.end_at).getTime();
    const seconds = Math.max(0, Math.ceil((target - now) / 1000));

    return {
      label: state === "waiting" ? strings.startsIn : strings.endsIn,
      value: formatDuration(seconds),
    };
  }, [state, slot.end_at, slot.start_at, now, strings.endsIn, strings.startsIn]);

  const cooldownSeconds = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;
  const canCheckIn = Boolean(currentUserId) && state === "active" && cooldownSeconds === 0 && !isPending;
  const checkInTitle = currentUserId && canViewParticipants ? strings.joined : strings.checkIn;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setCheckIns(initialCheckIns);
  }, [initialCheckIns]);

  useEffect(() => {
    setCanViewParticipants(hasJoined);
  }, [hasJoined]);

  useEffect(() => {
    if (!canViewParticipants) {
      return;
    }

    const channel = supabase
      .channel(`slot-${slot.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_ins",
          filter: `slot_id=eq.${slot.id}`,
        },
        async (payload) => {
          const incoming = payload.new as IncomingCheckIn;

          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", incoming.user_id)
            .maybeSingle();

          setCheckIns((previous) => {
            if (previous.some((entry) => entry.id === incoming.id)) {
              return previous;
            }

            return [
              {
                ...incoming,
                profiles: profile,
              },
              ...previous,
            ];
          });

          if (incoming.user_id !== currentUserId) {
            const actor = profile?.full_name ?? "Someone";
            toast.info(`${actor} checked in ${incoming.emoji}`);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, slot.id, currentUserId, canViewParticipants]);

  async function onCheckIn(emoji: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("slot_id", slot.id);
      formData.set("emoji", emoji);

      const result = await checkInAction({ error: null }, formData);

      if (result.error) {
        setActionError(result.error);
        toast.error(result.error);
        return;
      }

      setActionError(null);
      setCooldownUntil(Date.now() + 60_000);
      setCanViewParticipants(true);
      router.refresh();
    });
  }

  async function onCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    toast.success(strings.copied);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-[0_10px_24px_-20px_rgba(32,29,26,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge className={stateStyles[state]}>{strings[state]}</Badge>
          <Button type="button" variant="outline" size="sm" onClick={onCopyLink}>
            {strings.copy}
          </Button>
        </div>

        <h1 className="mt-3 text-2xl font-semibold">{slot.title}</h1>

        <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
          <p>
            {strings.startedAt}: <LocalDateTime iso={slot.start_at} locale={locale} />
          </p>
          <p>
            {strings.endedAt}: <LocalDateTime iso={slot.end_at} locale={locale} />
          </p>
        </div>

        {countdownText ? (
          <p className="mt-3 text-sm font-medium">
            {countdownText.label}: {countdownText.value}
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-[0_10px_24px_-20px_rgba(32,29,26,0.45)]">
        <h2 className="text-lg font-medium">{checkInTitle}</h2>

        {!currentUserId ? (
          <div className="mt-2 space-y-3">
            <p className="text-sm text-muted-foreground">{strings.loginToCheckIn}</p>
            <Button asChild size="sm">
              <Link href={signInUrl}>Sign in</Link>
            </Button>
          </div>
        ) : (
          <>
            {cooldownSeconds > 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {strings.recentCooldown} ({cooldownSeconds}s)
              </p>
            ) : null}

            {actionError ? <p className="mt-2 text-sm text-destructive">{actionError}</p> : null}

            <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
              {["😂", "❤️", "🤣", "👍", "😭", "🙏", "😘", "🥰", "😍", "😊", "💔", "🔥", "😎", "💩", "💪", "🙌", "👏", "✅", "👀", "💀", "🎉", "🎶", "🤡"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onCheckIn(emoji)}
                  disabled={!canCheckIn}
                  className="rounded-2xl border border-border/80 bg-background p-2 text-xl transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Check in with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-[0_10px_24px_-20px_rgba(32,29,26,0.45)]">
        <h2 className="text-lg font-medium">{strings.checkins}</h2>

        {!currentUserId ? null : !canViewParticipants ? (
          <p className="mt-2 text-sm text-muted-foreground">{strings.joinToSeeParticipants}</p>
        ) : checkIns.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{strings.emptyCheckins}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {checkIns.map((checkIn) => (
              <li
                key={checkIn.id}
                className="flex items-center justify-between rounded-2xl border border-border/80 bg-background p-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{checkIn.emoji}</span>
                  <span className="text-sm">
                    {checkIn.profiles?.full_name ?? checkIn.user_id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  <LocalDateTime iso={checkIn.created_at} locale={locale} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
