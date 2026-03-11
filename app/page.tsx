import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InstallLinketusCta } from "@/components/install-linketus-cta";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";

export default async function HomePage() {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);
  const [heroFirstWord, ...heroTail] = strings.home.heroLine1.split(" ");

  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center justify-center py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">{strings.home.title}</h1>

      <div className="mt-8 space-y-2 text-lg leading-relaxed text-foreground/90 sm:text-xl">
        <p>
          <strong className="font-bold">{heroFirstWord}</strong> {heroTail.join(" ")}
        </p>
        <p>{strings.home.heroLine2}</p>
        <p>{strings.home.heroLine3}</p>
      </div>

      <Button asChild size="lg" className="mt-10 h-12 px-8 text-base font-semibold">
        <Link href="/linket/new">{strings.home.createFirst}</Link>
      </Button>

      <InstallLinketusCta
        ctaText={strings.home.installCta}
        iosTitle={strings.home.iosInstallTitle}
        iosBody={strings.home.iosInstallBody}
      />
    </section>
  );
}
