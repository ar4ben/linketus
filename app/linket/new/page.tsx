import Link from "next/link";

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
          <Button asChild>
            <Link href="/signin?next=%2Flinket%2Fnew">{strings.home.signIn}</Link>
          </Button>
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
