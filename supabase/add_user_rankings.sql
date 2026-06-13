-- Boardgame Social MVP - Phase 2: User Saved Rankings Showcase
-- Run this in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.user_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('tier', 'top10')),
  data jsonb NOT NULL, -- Holds tiers array or top10 array, selectedBg, and aspectRatio
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_rankings ENABLE ROW LEVEL SECURITY;

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON public.user_rankings(user_id);

-- RLS Policies
DROP POLICY IF EXISTS "user_rankings_select_public" ON public.user_rankings;
CREATE POLICY "user_rankings_select_public"
  ON public.user_rankings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "user_rankings_insert_owner" ON public.user_rankings;
CREATE POLICY "user_rankings_insert_owner"
  ON public.user_rankings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_rankings_delete_owner" ON public.user_rankings;
CREATE POLICY "user_rankings_delete_owner"
  ON public.user_rankings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant table access to roles
GRANT ALL ON TABLE public.user_rankings TO anon, authenticated, service_role;
