"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { useActionState, useRef, useState, type FormEvent } from "react";

import { createSlotAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SLOT_MAX_HOURS } from "@/lib/constants";
import type { Dictionary, Locale } from "@/lib/i18n/shared";

type CreateSlotFormProps = {
  locale: Locale;
  strings: Dictionary[Locale]["createSlot"];
};

export function CreateSlotForm({ locale, strings }: CreateSlotFormProps) {
  const offsetInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [state, formAction, isPending] = useActionState(createSlotAction, { error: null });

  const durationTooLarge = Number(durationHours) > SLOT_MAX_HOURS;

  function openNativePicker(input: HTMLInputElement | null) {
    if (!input) {
      return;
    }

    if ("showPicker" in input) {
      try {
        (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
        return;
      } catch {
        // Some browsers may block picker calls outside trusted gestures.
      }
    }

    input.focus();
    input.click();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (durationTooLarge) {
      event.preventDefault();
      return;
    }

    if (offsetInputRef.current) {
      offsetInputRef.current.value = String(new Date().getTimezoneOffset());
    }
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-4" lang={locale}>
      <input
        ref={offsetInputRef}
        type="hidden"
        name="timezone_offset_minutes"
        defaultValue="0"
        readOnly
      />

      <div className="space-y-2">
        <Input
          id="title"
          name="title"
          placeholder={strings.titleLabel}
          maxLength={120}
          className="h-9 px-2 py-0"
          required
        />

        <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(220px,1fr)]">
          <div className="relative">
            <button
              type="button"
              onClick={() => openNativePicker(dateInputRef.current)}
              className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CalendarDays className="size-4 text-muted-foreground" />
              <span className={dateValue ? "text-foreground" : "text-muted-foreground"}>
                {dateValue || strings.dateLabel}
              </span>
            </button>
            <input
              ref={dateInputRef}
              id="date_local"
              name="date_local"
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              onKeyDown={(event) => event.preventDefault()}
              className="sr-only"
              required
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => openNativePicker(timeInputRef.current)}
              className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Clock3 className="size-4 text-muted-foreground" />
              <span className={timeValue ? "text-foreground" : "text-muted-foreground"}>
                {timeValue || strings.timeLabel}
              </span>
            </button>
            <input
              ref={timeInputRef}
              id="time_local"
              name="time_local"
              type="time"
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
              onKeyDown={(event) => event.preventDefault()}
              className="sr-only"
              step={60}
              required
            />
          </div>

          <Input
            id="duration_hours"
            name="duration_hours"
            type="number"
            min={1}
            step={1}
            value={durationHours}
            onChange={(event) => setDurationHours(event.target.value)}
            placeholder="Duration (in hours)"
            className="h-9 px-2 py-0"
            aria-invalid={durationTooLarge}
            required
          />
        </div>
      </div>

      <div className="min-h-5">
        {durationTooLarge ? (
          <p className="text-sm text-destructive">{strings.durationMaxError}</p>
        ) : null}
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={isPending || durationTooLarge}>
        {isPending ? "..." : strings.submit}
      </Button>
    </form>
  );
}
