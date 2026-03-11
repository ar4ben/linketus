import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";

export default async function SlotNotFound() {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  return <p className="text-sm text-muted-foreground">{strings.slot.notFound}</p>;
}
