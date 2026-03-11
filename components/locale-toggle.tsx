"use client";

import { useRouter } from "next/navigation";

import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/shared";

type LocaleToggleProps = {
  locale: Locale;
  label: string;
};

export function LocaleToggle({ locale, label }: LocaleToggleProps) {
  const router = useRouter();

  function onLocaleChange(nextLocale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={locale}
        onChange={(event) => onLocaleChange(event.target.value as Locale)}
        className="rounded-md border bg-background px-2 py-1"
      >
        <option value="en">EN</option>
        <option value="ru">RU</option>
      </select>
    </label>
  );
}
