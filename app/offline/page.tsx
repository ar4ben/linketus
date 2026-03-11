import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";

export default async function OfflinePage() {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  return (
    <main className="mx-auto max-w-lg rounded-3xl border border-border/80 bg-card p-8 text-card-foreground shadow-[0_10px_24px_-20px_rgba(32,29,26,0.45)]">
      <h1 className="text-2xl font-semibold">{strings.offline.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{strings.offline.description}</p>
    </main>
  );
}
