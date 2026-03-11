"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { useActionState, useRef, useState, type FormEvent } from "react";

import { createSlotAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [durationHours, setDurationHours] = useState("1");
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
        <Label htmlFor="title">{strings.titleLabel}</Label>
        <Input id="title" name="title" placeholder={strings.titlePlaceholder} maxLength={120} required />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="date_local">{strings.dateLabel}</Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => openNativePicker(dateInputRef.current)}
              className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CalendarDays className="size-4 text-muted-foreground" />
              {dateValue ? <span className="text-sm">{dateValue}</span> : null}
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
        </div>

        <div className="space-y-1">
          <Label htmlFor="time_local">{strings.timeLabel}</Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => openNativePicker(timeInputRef.current)}
              className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Clock3 className="size-4 text-muted-foreground" />
              {timeValue ? <span className="text-sm">{timeValue}</span> : null}
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
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="duration_hours">{strings.durationLabel}</Label>
        <Input
          id="duration_hours"
          name="duration_hours"
          type="number"
          min={1}
          step={1}
          value={durationHours}
          onChange={(event) => setDurationHours(event.target.value)}
          className="h-9 px-2 py-0"
          aria-invalid={durationTooLarge}
          required
        />
        {durationTooLarge ? <p className="text-sm text-destructive">{strings.durationMaxError}</p> : null}
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={isPending || durationTooLarge}>
        {isPending ? "..." : strings.submit}
      </Button>
    </form>
  );
}
