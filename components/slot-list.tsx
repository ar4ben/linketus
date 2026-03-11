import Link from "next/link";

import { LocalDateTime } from "@/components/local-date-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Slot } from "@/lib/db";
import { getSlotState } from "@/lib/date";
import type { Dictionary, Locale } from "@/lib/i18n/shared";

type SlotListProps = {
  slots: Slot[];
  locale: Locale;
  emptyLabel: string;
  openLabel: string;
  slotStrings: Dictionary[Locale]["slot"];
};

const badgeStyles: Record<string, string> = {
  waiting: "bg-amber-100 text-amber-900",
  active: "bg-emerald-100 text-emerald-900",
  archive: "bg-slate-200 text-slate-700",
};

export function SlotList({ slots, locale, emptyLabel, openLabel, slotStrings }: SlotListProps) {
  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => {
        const state = getSlotState(slot.start_at, slot.end_at);
        const stateLabel = slotStrings[state];

        return (
          <article
            key={slot.id}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-medium">{slot.title}</h3>
                <p className="text-xs text-muted-foreground">
                  <LocalDateTime iso={slot.start_at} locale={locale} /> -{" "}
                  <LocalDateTime iso={slot.end_at} locale={locale} />
                </p>
              </div>

              <Badge className={badgeStyles[state]}>{stateLabel}</Badge>
            </div>

            <div className="mt-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/slot/${slot.id}`}>{openLabel}</Link>
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
