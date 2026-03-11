import { signInWithGoogle } from "@/app/actions";
import { CreateSlotForm } from "@/components/create-slot-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export default async function NewSlotPage() {
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
          <CardTitle>{strings.createSlot.title}</CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.createSlot.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateSlotForm locale={locale} strings={strings.createSlot} />
      </CardContent>
    </Card>
  );
}
