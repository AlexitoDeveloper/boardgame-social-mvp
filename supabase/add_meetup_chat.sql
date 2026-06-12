-- Boardgame Social MVP - Add Meetup Chat Messages (Realtime) and Fix Join RLS
-- Run this in your Supabase SQL Editor.

-- 1. FIX MEETUPS UPDATE POLICY
-- Drops the old creator-only policy if it exists and ensures authenticated users can join/leave.
drop policy if exists "meetups_update_creator" on public.meetups;
drop policy if exists "meetups_update_authenticated" on public.meetups;

create policy "meetups_update_authenticated"
on public.meetups
for update
to authenticated
using (true)
with check (true);

-- 2. CREATE CHAT MESSAGES TABLE
create table if not exists public.meetup_messages (
  id uuid primary key default gen_random_uuid(),
  meetup_id uuid not null references public.meetups (id) on delete cascade,
  user_id uuid references public.users (id) on delete cascade,
  guest_id uuid references public.meetup_guests (id) on delete cascade,
  sender_name text not null,
  avatar_url text,
  content text not null,
  created_at timestamptz not null default now(),
  constraint chk_sender_id_or_guest_id_present check (
    user_id is not null or guest_id is not null or sender_name = 'Sistema'
  )
);

-- Enable Row Level Security (RLS)
alter table public.meetup_messages enable row level security;

-- Index for performance
create index if not exists idx_meetup_messages_meetup_id on public.meetup_messages (meetup_id);
create index if not exists idx_meetup_messages_created_at on public.meetup_messages (created_at);

-- Policies for access
create policy "meetup_messages_select_public"
on public.meetup_messages
for select
using (true);

create policy "meetup_messages_insert_policy"
on public.meetup_messages
for insert
to anon, authenticated
with check (
  (
    auth.role() = 'authenticated' and 
    user_id = auth.uid() and 
    exists (
      select 1 from public.meetups
      where id = meetup_id and (creator_id = auth.uid() or auth.uid() = ANY(joined_players))
    )
  ) OR
  (
    auth.role() = 'anon' and 
    guest_id is not null and 
    exists (
      select 1 from public.meetup_guests
      where id = guest_id and meetup_id = meetup_messages.meetup_id
    )
  )
);

-- Grant permissions to access the table
GRANT ALL ON TABLE public.meetup_messages TO anon, authenticated, service_role;

-- Enable Realtime for the table
alter table public.meetup_messages replica identity full;

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table public.meetup_messages;
  end if;
end $$;
