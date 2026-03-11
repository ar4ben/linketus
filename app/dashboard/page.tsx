import { signInWithGoogle } from "@/app/actions";
import { DashboardFeed } from "@/components/dashboard-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSlots } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{strings.dashboard.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">{strings.createSlot.authRequired}</p>
          <form action={signInWithGoogle}>
            <Button type="submit">{strings.home.signIn}</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  const { feed } = await getDashboardSlots(user.id);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{strings.dashboard.title}</h1>
      <DashboardFeed
        items={feed}
        locale={locale}
        dashboardStrings={strings.dashboard}
        slotStrings={strings.slot}
      />
    </section>
  );
}
