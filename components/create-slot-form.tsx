"use client";

import { useActionState, useRef } from "react";

import { createSlotAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary, Locale } from "@/lib/i18n/shared";

type CreateSlotFormProps = {
  locale: Locale;
  strings: Dictionary[Locale]["createSlot"];
};

export function CreateSlotForm({ locale, strings }: CreateSlotFormProps) {
  const offsetInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, isPending] = useActionState(createSlotAction, { error: null });

  function onSubmit() {
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
        <Input
          id="title"
          name="title"
          placeholder={strings.titlePlaceholder}
          maxLength={120}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_local">{strings.startLabel}</Label>
          <Input
            id="start_local"
            name="start_local"
            type="datetime-local"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_local">{strings.endLabel}</Label>
          <Input
            id="end_local"
            name="end_local"
            type="datetime-local"
            required
          />
        </div>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "..." : strings.submit}
      </Button>
    </form>
  );
}
