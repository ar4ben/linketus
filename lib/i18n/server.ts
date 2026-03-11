import { cookies } from "next/headers";

import { LOCALE_COOKIE, normalizeLocale, type Locale } from "@/lib/i18n/shared";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const cookieValue = store.get(LOCALE_COOKIE)?.value;

  return normalizeLocale(cookieValue);
}
