import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  return (
    <section className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{strings.legal.privacyTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{strings.legal.privacyLastUpdated}</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/90">
          <p>{strings.legal.privacyP1}</p>
          <p>{strings.legal.privacyP2}</p>
          <p>{strings.legal.privacyP3}</p>
        </CardContent>
      </Card>
    </section>
  );
}
