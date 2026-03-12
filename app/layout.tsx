import type { Metadata } from "next";
import Link from "next/link";

import { signInWithGoogle, signOut } from "@/app/actions";
import { LocaleToggle } from "@/components/locale-toggle";
import { PushSubscriptionManager } from "@/components/push-subscription-manager";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linketus",
  description: "Presence over communication / Присутствие важнее общения",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon-v6.png",
    apple: "/apple-touch-icon-v6.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang={locale}>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        <header className="px-3 pt-3 sm:px-4">
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/80 bg-card/85 px-4 py-3 shadow-[0_8px_24px_-18px_rgba(32,29,26,0.4)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1.5 text-lg font-semibold tracking-tight">
                <span aria-hidden className="text-emerald-600">
                  └●
                </span>
                <span>{strings.appName}</span>
              </Link>
              <nav className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">{strings.nav.dashboard}</Link>
                </Button>
                {user ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/linket/new">{strings.nav.createSlot}</Link>
                  </Button>
                ) : null}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <LocaleToggle locale={locale} label={strings.nav.language} />

              {user ? (
                <form action={signOut}>
                  <Button type="submit" variant="outline" size="sm">
                    {strings.nav.signOut}
                  </Button>
                </form>
              ) : (
                <form action={signInWithGoogle}>
                  <Button type="submit" size="sm">
                    {strings.nav.signIn}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">{children}</main>
        <Toaster richColors position="top-right" />
        <PushSubscriptionManager
          enabled={Boolean(user)}
          vapidPublicKey={env.pushPublicKey}
          strings={strings.push}
        />
      </body>
    </html>
  );
}
