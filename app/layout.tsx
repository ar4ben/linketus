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
  description: "Presence over communication",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
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
      <body
        suppressHydrationWarning
        className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 antialiased"
      >
        <header className="border-b bg-white/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                {strings.appName}
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

        <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
        <Toaster richColors position="top-right" />
        <PushSubscriptionManager enabled={Boolean(user)} vapidPublicKey={env.pushPublicKey} />
      </body>
    </html>
  );
}
