import { notFound } from "next/navigation";

import { deleteSlotAction, signInWithGoogle } from "@/app/actions";
import { SlotClient } from "@/components/slot-client";
import { Button } from "@/components/ui/button";
import { getCheckInsBySlotId, getSlotById } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/shared";
import { getServerLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

type SlotPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SlotPage({ params }: SlotPageProps) {
  const { id } = await params;
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  const [slot, checkIns] = await Promise.all([getSlotById(id), getCheckInsBySlotId(id)]);

  if (!slot) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const deleteAction = deleteSlotAction.bind(null, slot.id);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {strings.slot.createdBy}: {slot.creator?.full_name ?? slot.creator_id.slice(0, 8)}
        </p>

        <div className="flex items-center gap-2">
          {!user ? (
            <form action={signInWithGoogle}>
              <Button type="submit" size="sm">
                {strings.nav.signIn}
              </Button>
            </form>
          ) : null}

          {user?.id === slot.creator_id ? (
            <form action={deleteAction}>
              <Button type="submit" size="sm" variant="destructive">
                {strings.slot.delete}
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <SlotClient
        slot={slot}
        initialCheckIns={checkIns}
        currentUserId={user?.id ?? null}
        locale={locale}
        strings={strings.slot}
      />
    </section>
  );
}
