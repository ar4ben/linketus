import { createClient } from "npm:@supabase/supabase-js@2.99.0";
import webpush, { type PushSubscription } from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestPayload = {
  slot_id: string;
  actor_id: string;
  emoji: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@example.com";

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return new Response(JSON.stringify({ error: "Missing function environment variables" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const payload = (await request.json()) as RequestPayload;

  if (!payload.slot_id || !payload.actor_id || !payload.emoji) {
    return new Response(JSON.stringify({ error: "Missing payload fields" }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data: slot, error: slotError } = await supabase
    .from("slots")
    .select("id, title, creator_id")
    .eq("id", payload.slot_id)
    .single();

  if (slotError || !slot) {
    return new Response(JSON.stringify({ error: slotError?.message ?? "Slot not found" }), {
      status: 404,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const participantIds = new Set<string>();
  participantIds.add(slot.creator_id);

  const { data: checkInUsers, error: checkInError } = await supabase
    .from("check_ins")
    .select("user_id")
    .eq("slot_id", payload.slot_id);

  if (checkInError) {
    return new Response(JSON.stringify({ error: checkInError.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  for (const row of checkInUsers ?? []) {
    participantIds.add(row.user_id);
  }

  participantIds.delete(payload.actor_id);

  if (participantIds.size === 0) {
    return new Response(JSON.stringify({ ok: true, delivered: 0 }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const { data: actor } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", payload.actor_id)
    .maybeSingle();

  const actorName = actor?.full_name ?? "Someone";

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, subscription_data")
    .in("user_id", [...participantIds]);

  if (subscriptionsError) {
    return new Response(JSON.stringify({ error: subscriptionsError.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const notificationBody = JSON.stringify({
    title: "Linketus",
    body: `${actorName} checked in ${payload.emoji} in \"${slot.title}\"`,
    url: `/slot/${slot.id}`,
  });

  const results = await Promise.allSettled(
    (subscriptions ?? []).map(async (subscriptionRow) => {
      try {
        await webpush.sendNotification(
          subscriptionRow.subscription_data as PushSubscription,
          notificationBody,
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;

        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", subscriptionRow.id);
        }

        throw error;
      }
    }),
  );

  const delivered = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - delivered;

  return new Response(JSON.stringify({ ok: true, delivered, failed }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});
