# 📄 Final Specification: Linketus (PWA) — Ver. 1.1

## 1. Project Concept

**Linketus** is a minimalist social presence app for maintaining "weak ties" through synchronous micro-rituals.

- **The Slot:** A time window for a shared activity (1 to 720 hours).
- **The Check-in:** A one-tap action to say "I am here" with an emoji.
- **Philosophy:** Presence over communication. No chats, no profiles, just being "together" in time.

## 2. Core Features & Logic

- **Localization:** Toggle for English (EN) and Russian (RU).
- **Auth:** Google OAuth via Supabase.
- **Slot States:**
  1. **Waiting Room:** Before `start_at` — show countdown.
  2. **Active:** During the slot — show "I'm Here" button + Emoji grid.
  3. **Archive:** After `end_at` — read-only log of the event.
- **Emoji Set (24):** 😂 ❤️ 🤣 👍 😭 🙏 😘 🥰 😍 😊 💔 🔥 😎 💩 💪 🙌 👏 ✅ 👀 💀 🎉 🎶 🤡.
- **Cooldown:** Users can check in only once every 60 seconds per slot.
- **Deletion:** The creator can delete their slot.
- **Dashboard:** Contains:
  - **My Slots:** Slots created by the user.
  - **Participated:** Unique list of slots where the user has checked in at least once (must use `DISTINCT` on `slot_id`).

## 3. Technical Requirements

- **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn/UI, Lucide icons.
- **Backend:** Supabase (PostgreSQL).
- **Real-time:** Supabase Realtime for live Activity Stream updates.
- **Notifications:**
  - **In-app:** Real-time toasts (using `sonner`) when someone checks in.
  - **Push:** Web Push API via Supabase Edge Functions.
- **PWA:** Installable on mobile, offline manifest, dedicated icon.

## 4. Database Schema & Integrity

- `**profiles`**: `id (uuid, pk), full_name, avatar_url`.
- `**slots**`: `id (uuid, pk), creator_id (fk), title, start_at, end_at`.
- `**check_ins**`: `id, slot_id (fk), user_id (fk), emoji, created_at`.
- `**push_subscriptions**`: `id, user_id (fk), subscription_data (jsonb)`.
- **CRITICAL:** Use `ON DELETE CASCADE` for all foreign keys linked to a `slot_id`. Deleting a slot must automatically delete all its `check_ins` and related data.

## 5. Security & Constraints

- **PostgreSQL Trigger:** Prevent inserting into `check_ins` if the user's last check-in for that `slot_id` was `< 60 seconds` ago.
- **RLS (Row Level Security):**
  - Slots and Check-ins: Publicly readable via direct link.
  - Insertions: Only for authenticated users.
  - Deletion: Only for the slot `creator_id`.



