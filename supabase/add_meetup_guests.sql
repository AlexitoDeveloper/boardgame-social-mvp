-- Boardgame Social MVP - Add Meetup Guests (Shadow Guests)
-- Run this in your Supabase SQL Editor.

create table if not exists public.meetup_guests (
  id uuid primary key default gen_random_uuid(),
  meetup_id uuid not null references public.meetups (id) on delete cascade,
  guest_name text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.meetup_guests enable row level security;

-- Policies for public access (since guests are unregistered users)
create policy "meetup_guests_select_public"
on public.meetup_guests
for select
using (true);

create policy "meetup_guests_insert_public"
on public.meetup_guests
for insert
with check (true);

create policy "meetup_guests_delete_public"
on public.meetup_guests
for delete
using (true);

-- Grant permissions to access the table
GRANT ALL ON TABLE public.meetup_guests TO anon, authenticated, service_role;
