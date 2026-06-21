-- Boardgame Social MVP - Add User Collection support (Ludoteca Personal)
-- Run this in your Supabase SQL Editor.

-- 1. Create the user_collection table referencing public.users and public.games
CREATE TABLE IF NOT EXISTS public.user_collection (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES public.games(bgg_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);

-- 2. Create index on game_id to optimize query for finding local owners of a game
CREATE INDEX IF NOT EXISTS idx_user_collection_game_id ON public.user_collection (game_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_user_id ON public.user_collection (user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_collection ENABLE ROW LEVEL SECURITY;

-- 4. Define RLS Policies
-- 4.1. Select: Allow anyone to view users' collections
DROP POLICY IF EXISTS "user_collection_select_public" ON public.user_collection;
CREATE POLICY "user_collection_select_public" ON public.user_collection
  FOR SELECT USING (true);

-- 4.2. Insert: Allow authenticated users to add games to their own collection only
DROP POLICY IF EXISTS "user_collection_insert_own" ON public.user_collection;
CREATE POLICY "user_collection_insert_own" ON public.user_collection
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 4.3. Delete: Allow authenticated users to remove games from their own collection only
DROP POLICY IF EXISTS "user_collection_delete_own" ON public.user_collection;
CREATE POLICY "user_collection_delete_own" ON public.user_collection
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 5. Grant access permissions to Supabase API roles
GRANT ALL ON TABLE public.user_collection TO anon, authenticated, service_role;
