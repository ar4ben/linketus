import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteSlotAction } from "@/app/actions";
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

export async function generateMetadata({ params }: SlotPageProps): Promise<Metadata> {
  const { id } = await params;
  const slot = await getSlotById(id);

  if (!slot) {
    return {
      title: "Linket not found | Linketus",
      description: "Linket not found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = slot.title;
  const url = `/linket/${slot.id}`;

  return {
    title,
    description: "",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: "",
      type: "website",
      url,
      siteName: "Linketus",
    },
    twitter: {
      card: "summary",
      title,
      description: "",
    },
  };
}

export default async function SlotPage({ params }: SlotPageProps) {
  const { id } = await params;
  const locale = await getServerLocale();
  const strings = getDictionary(locale);

  const slot = await getSlotById(id);

  if (!slot) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasJoined = false;
  let checkIns = [] as Awaited<ReturnType<typeof getCheckInsBySlotId>>;

  if (user) {
    const { count } = await supabase
      .from("check_ins")
      .select("id", { head: true, count: "exact" })
      .eq("slot_id", id)
      .eq("user_id", user.id);

    hasJoined = (count ?? 0) > 0;
  }

  if (hasJoined) {
    checkIns = await getCheckInsBySlotId(id);
  }

  const deleteAction = deleteSlotAction.bind(null, slot.id);
  const signInUrl = `/signin?next=${encodeURIComponent(`/linket/${id}`)}`;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {strings.slot.createdBy}: {slot.creator?.full_name ?? slot.creator_id.slice(0, 8)}
        </p>

        <div className="flex items-center gap-2">
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
        hasJoined={hasJoined}
        signInUrl={signInUrl}
        signInLabel={strings.nav.signIn}
        locale={locale}
        strings={strings.slot}
      />
    </section>
  );
}
