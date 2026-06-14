-- Boardgame Social MVP - Add multi-game sessions support
-- Run this in the Supabase SQL Editor.

-- 1. Create the meetup_games join table referencing public.games(bgg_id)
DO $$
BEGIN
  -- Ensure there is a unique constraint on public.games(bgg_id) so we can reference it
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE c.conrelid = 'public.games'::regclass 
      AND c.contype = 'u'
  ) THEN
    ALTER TABLE public.games ADD CONSTRAINT games_bgg_id_unique UNIQUE (bgg_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.meetup_games (
  meetup_id UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES public.games(bgg_id) ON DELETE CASCADE,
  PRIMARY KEY (meetup_id, game_id)
);

-- 2. Migrate existing game_id from meetups to meetup_games to preserve history
-- We check if meetups has the column game_id before migrating
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetups' AND column_name = 'game_id'
  ) THEN
    INSERT INTO public.meetup_games (meetup_id, game_id)
    SELECT id, game_id 
    FROM public.meetups 
    WHERE game_id IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 3. Drop the foreign key constraint and column game_id from meetups table
DO $$
BEGIN
  -- Drop constraint if exists (standard name in schema.sql was meetups_game_id_fkey or similar)
  ALTER TABLE public.meetups DROP CONSTRAINT IF EXISTS meetups_game_id_fkey;
  
  -- Drop column game_id
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetups' AND column_name = 'game_id'
  ) THEN
    ALTER TABLE public.meetups DROP COLUMN game_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 4. Enable Row Level Security (RLS) on meetup_games
ALTER TABLE public.meetup_games ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies for meetup_games
-- 5.1. Select: Allow anyone to view games associated with meetups
DROP POLICY IF EXISTS "meetup_games_select_public" ON public.meetup_games;
CREATE POLICY "meetup_games_select_public" ON public.meetup_games 
FOR SELECT USING (true);

-- 5.2. Insert: Allow only the creator of the meetup to add games to it
DROP POLICY IF EXISTS "meetup_games_insert_creator" ON public.meetup_games;
CREATE POLICY "meetup_games_insert_creator" ON public.meetup_games 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meetups 
    WHERE id = meetup_id AND creator_id = auth.uid()
  )
);

-- 5.3. Delete: Allow only the creator of the meetup to remove games from it
DROP POLICY IF EXISTS "meetup_games_delete_creator" ON public.meetup_games;
CREATE POLICY "meetup_games_delete_creator" ON public.meetup_games 
FOR DELETE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.meetups 
    WHERE id = meetup_id AND creator_id = auth.uid()
  )
);

-- 6. Grant Access Rights to roles
GRANT ALL ON TABLE public.meetup_games TO anon, authenticated, service_role;
