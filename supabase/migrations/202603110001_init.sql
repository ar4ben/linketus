create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint slot_duration_valid check (
    end_at > start_at
    and end_at <= start_at + interval '720 hours'
    and end_at >= start_at + interval '1 hour'
  )
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  constraint check_ins_emoji_allowed check (
    emoji in (
      '😂', '❤️', '🤣', '👍', '😭', '🙏', '😘', '🥰', '😍', '😊', '💔', '🔥',
      '😎', '💩', '💪', '🙌', '👏', '✅', '👀', '💀', '🎉', '🎶', '🤡'
    )
  )
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  subscription_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists slots_creator_id_idx on public.slots (creator_id);
create index if not exists slots_start_at_idx on public.slots (start_at);
create index if not exists check_ins_slot_created_idx on public.check_ins (slot_id, created_at desc);
create index if not exists check_ins_user_slot_idx on public.check_ins (user_id, slot_id);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

create or replace function public.get_participated_slots(p_user_id uuid)
returns setof public.slots
language sql
stable
as $$
  select s.*
  from public.slots s
  join (
    select distinct slot_id
    from public.check_ins
    where user_id = p_user_id
  ) as distinct_check_ins on distinct_check_ins.slot_id = s.id
  order by s.start_at desc;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.handle_auth_user_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  name_value text;
  avatar_value text;
begin
  name_value := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name');
  avatar_value := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, name_value, avatar_value)
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$;

create or replace function public.enforce_check_in_rules()
returns trigger
language plpgsql
as $$
declare
  last_check_in_at timestamptz;
  slot_start_at timestamptz;
  slot_end_at timestamptz;
  current_ts timestamptz;
begin
  current_ts := coalesce(new.created_at, now());
  new.created_at := current_ts;

  select start_at, end_at
  into slot_start_at, slot_end_at
  from public.slots
  where id = new.slot_id;

  if slot_start_at is null then
    raise exception 'Slot does not exist';
  end if;

  if current_ts < slot_start_at or current_ts > slot_end_at then
    raise exception 'Check-ins are only allowed during the active slot window';
  end if;

  select created_at
  into last_check_in_at
  from public.check_ins
  where slot_id = new.slot_id and user_id = new.user_id
  order by created_at desc
  limit 1;

  if last_check_in_at is not null and current_ts < last_check_in_at + interval '60 seconds' then
    raise exception 'One emoji per minute is available';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_change on auth.users;
create trigger on_auth_user_change
after insert or update on auth.users
for each row
execute function public.handle_auth_user_change();

drop trigger if exists set_push_subscriptions_updated_at on public.push_subscriptions;
create trigger set_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row
execute function public.set_updated_at();

drop trigger if exists enforce_check_in_rules on public.check_ins;
create trigger enforce_check_in_rules
before insert on public.check_ins
for each row
execute function public.enforce_check_in_rules();

alter table public.profiles enable row level security;
alter table public.slots enable row level security;
alter table public.check_ins enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles
for select
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Slots are publicly readable" on public.slots;
create policy "Slots are publicly readable"
on public.slots
for select
using (true);

drop policy if exists "Authenticated users can create own slots" on public.slots;
create policy "Authenticated users can create own slots"
on public.slots
for insert
to authenticated
with check (auth.uid() = creator_id);

drop policy if exists "Slot creators can delete slots" on public.slots;
create policy "Slot creators can delete slots"
on public.slots
for delete
to authenticated
using (auth.uid() = creator_id);

drop policy if exists "Check-ins are publicly readable" on public.check_ins;
create policy "Check-ins are publicly readable"
on public.check_ins
for select
using (true);

drop policy if exists "Authenticated users can create own check-ins" on public.check_ins;
create policy "Authenticated users can create own check-ins"
on public.check_ins
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own push subscriptions" on public.push_subscriptions;
create policy "Users can read own push subscriptions"
on public.push_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own push subscriptions" on public.push_subscriptions;
create policy "Users can insert own push subscriptions"
on public.push_subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own push subscriptions" on public.push_subscriptions;
create policy "Users can update own push subscriptions"
on public.push_subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own push subscriptions" on public.push_subscriptions;
create policy "Users can delete own push subscriptions"
on public.push_subscriptions
for delete
to authenticated
using (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'check_ins'
  ) then
    alter publication supabase_realtime add table public.check_ins;
  end if;
end;
$$;
