import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";

export default async function TermsPage() {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  return (
    <section className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{strings.legal.termsTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{strings.legal.termsLastUpdated}</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/90">
          <p>{strings.legal.termsP1}</p>
          <p>{strings.legal.termsP2}</p>
          <p>{strings.legal.termsP3}</p>
        </CardContent>
      </Card>
    </section>
  );
}
