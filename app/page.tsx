import Link from "next/link";

import { signInWithGoogle } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">{strings.home.title}</h1>
        <p className="max-w-xl text-base text-muted-foreground">{strings.home.description}</p>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <>
              <Button asChild>
                <Link href="/dashboard">{strings.home.openDashboard}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/slot/new">{strings.home.createSlot}</Link>
              </Button>
            </>
          ) : (
            <form action={signInWithGoogle}>
              <Button type="submit">{strings.home.signIn}</Button>
            </form>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{strings.appName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- Shared slot: 1 to 720 hours.</p>
          <p>- One-tap check-ins with emoji.</p>
          <p>- Live activity stream + PWA install.</p>
        </CardContent>
      </Card>
    </section>
  );
}
