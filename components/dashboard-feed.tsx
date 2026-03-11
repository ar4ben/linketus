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
    return <p className="text-sm text-muted-foreground">{dashboardStrings.emptyFeed}</p>;
  }

  return (
    <ul className="border-y bg-background">
      {items.map((slot) => {
        const state = getSlotState(slot.start_at, slot.end_at);

        return (
          <li key={slot.id} className="border-b px-1 py-3 last:border-b-0 sm:px-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                aria-hidden
                className={`inline-block size-2 rounded-full ${dotStyles[state]}`}
              />
              <Link href={`/linket/${slot.id}`} className="font-medium hover:underline">
                {slot.title}
              </Link>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">{slotStrings[state]}</p>

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
