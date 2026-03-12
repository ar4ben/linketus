import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";

type SignInPageProps = {
  searchParams?: { next?: string | string[] } | Promise<{ next?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const rawNext = Array.isArray(params?.next) ? params.next[0] : params?.next;
  const nextPath = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const signInHref = `/auth/signin?next=${encodeURIComponent(nextPath)}`;

  return (
    <section className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{strings.auth.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{strings.auth.subtitle}</p>

          <Button asChild className="w-full">
            <Link href={signInHref}>{strings.auth.continueWithGoogle}</Link>
          </Button>

          <div className="pt-1 text-center text-xs text-muted-foreground">
            <p>{strings.auth.legalLinksLabel}</p>
            <p className="mt-1">
              <Link href="/terms" className="underline underline-offset-2">
                {strings.auth.terms}
              </Link>{" "}
              ·{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                {strings.auth.privacy}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
