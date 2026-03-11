import Link from "next/link";

import { LocalDateTime } from "@/components/local-date-time";
import type { DashboardFeedItem } from "@/lib/data";
import { getSlotState } from "@/lib/date";
import type { Dictionary, Locale } from "@/lib/i18n/shared";

type DashboardFeedProps = {
  items: DashboardFeedItem[];
  locale: Locale;
  dashboardStrings: Dictionary[Locale]["dashboard"];
  slotStrings: Dictionary[Locale]["slot"];
};

const dotStyles: Record<"waiting" | "active" | "archive", string> = {
  waiting: "bg-orange-400",
  active: "bg-emerald-500",
  archive: "bg-slate-400",
};

export function DashboardFeed({ items, locale, dashboardStrings, slotStrings }: DashboardFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border/80 bg-card px-4 py-6 text-sm text-muted-foreground shadow-[0_10px_24px_-20px_rgba(32,29,26,0.45)]">
        {dashboardStrings.emptyFeed}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((slot) => {
        const state = getSlotState(slot.start_at, slot.end_at);

        return (
          <li
            key={slot.id}
            className="rounded-3xl border border-border/80 bg-card px-4 py-3.5 shadow-[0_10px_24px_-20px_rgba(32,29,26,0.5)] transition hover:shadow-[0_14px_28px_-22px_rgba(32,29,26,0.55)]"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                aria-hidden
                className={`inline-block size-2.5 rounded-full ${dotStyles[state]}`}
              />
              <Link href={`/linket/${slot.id}`} className="text-base font-semibold hover:underline">
                {slot.title}
              </Link>
            </div>

            <p className="mt-1 text-xs font-medium text-muted-foreground">{slotStrings[state]}</p>

            <p className="mt-2 rounded-2xl bg-muted/65 px-2.5 py-1 text-xs text-muted-foreground">
              <LocalDateTime iso={slot.start_at} locale={locale} /> -{" "}
              <LocalDateTime iso={slot.end_at} locale={locale} />
            </p>
          </li>
        );
      })}
    </ul>
  );
}
