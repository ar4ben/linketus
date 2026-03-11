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

export function DashboardFeed({ items, locale, dashboardStrings, slotStrings }: DashboardFeedProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{dashboardStrings.emptyFeed}</p>;
  }

  return (
    <ul className="border-y bg-background">
      {items.map((slot) => {
        const state = getSlotState(slot.start_at, slot.end_at);

        return (
          <li key={slot.id} className="border-b px-1 py-3 last:border-b-0 sm:px-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/slot/${slot.id}`} className="font-medium hover:underline">
                {slot.title}
              </Link>
              {slot.isMine ? (
                <span className="inline-flex items-center rounded-sm bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {dashboardStrings.mineMark}
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {slotStrings[state]} · <LocalDateTime iso={slot.created_at} locale={locale} />
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              <LocalDateTime iso={slot.start_at} locale={locale} /> -{" "}
              <LocalDateTime iso={slot.end_at} locale={locale} />
            </p>
          </li>
        );
      })}
    </ul>
  );
}
