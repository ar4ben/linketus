# Linketus

Linketus is a minimalist social presence PWA built with Next.js + Supabase.

## Stack

- Next.js (App Router)
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, Realtime, RLS)
- Sonner (in-app toasts)
- Web Push via Supabase Edge Function

## Local setup

1. Install dependencies:
   - `npm install`
2. Create env file:
   - `cp .env.example .env.local`
3. Fill required values in `.env.local`.
4. Start dev server:
   - `npm run dev`

## Supabase setup

1. Open your Supabase SQL editor.
2. Run migration SQL from:
   - `supabase/migrations/202603110001_init.sql`
3. In Supabase Auth, enable Google provider.
4. Set callback URL:
   - `http://localhost:3000/auth/callback`

## Push notifications

1. Generate VAPID keys.
2. Deploy edge function:
   - `supabase functions deploy send-checkin-push`
3. Set edge function secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
4. Set app env vars:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `SUPABASE_EDGE_FUNCTION_URL` (for example `https://<project-ref>.functions.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`

## Checks

- Lint: `npm run lint`
- Production build: `npm run build`

## Notes

- Timestamps are stored in UTC and displayed in user local timezone.
- Participated slots query uses SQL `DISTINCT slot_id` via `get_participated_slots` function.
- Deleting a slot cascades to slot check-ins.
