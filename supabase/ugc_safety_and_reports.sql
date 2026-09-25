-- ==============================================================================
-- Migration: UGC Safety, Content Reporting & User Blocking
-- Complies with Google Play & Apple App Store User-Generated Content (UGC) Guidelines
-- ==============================================================================

-- 1. Content Reports Table
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users (id) on delete cascade,
  reported_user_id uuid references public.users (id) on delete set null,
  content_type text not null check (content_type in ('chat_message', 'meetup', 'group', 'profile')),
  content_id text,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for admin review dashboard
create index if not exists idx_content_reports_status on public.content_reports (status);
create index if not exists idx_content_reports_reporter on public.content_reports (reporter_id);

-- 2. User Blocks Table
create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.users (id) on delete cascade,
  blocked_user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_user_block unique (blocker_id, blocked_user_id),
  constraint chk_no_self_block check (blocker_id <> blocked_user_id)
);

-- Index for quick lookup of blocked relationships
create index if not exists idx_user_blocks_blocker on public.user_blocks (blocker_id);
create index if not exists idx_user_blocks_blocked on public.user_blocks (blocked_user_id);

-- Enable RLS
alter table public.content_reports enable row level security;
alter table public.user_blocks enable row level security;

-- Reports RLS: Authenticated users can submit reports
create policy "reports_insert_own"
on public.content_reports
for insert
to authenticated
with check (reporter_id = auth.uid());

create policy "reports_select_own"
on public.content_reports
for select
to authenticated
using (reporter_id = auth.uid());

-- Blocks RLS: Users manage only their own block relationships
create policy "blocks_select_own"
on public.user_blocks
for select
to authenticated
using (blocker_id = auth.uid());

create policy "blocks_insert_own"
on public.user_blocks
for insert
to authenticated
with check (blocker_id = auth.uid());

create policy "blocks_delete_own"
on public.user_blocks
for delete
to authenticated
using (blocker_id = auth.uid());

-- 3. Grant table permissions to Supabase API roles
grant all on table public.content_reports to anon, authenticated, service_role;
grant all on table public.user_blocks to anon, authenticated, service_role;
