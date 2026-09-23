-- LudiClub - Add Group Guest Games (Games owned by guests in groups)
-- Run this script in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.group_guest_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.group_guests(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES public.games(bgg_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_guest_game UNIQUE (guest_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_group_guest_games_group ON public.group_guest_games (group_id);
CREATE INDEX IF NOT EXISTS idx_group_guest_games_guest ON public.group_guest_games (guest_id);
CREATE INDEX IF NOT EXISTS idx_group_guest_games_game ON public.group_guest_games (game_id);

ALTER TABLE public.group_guest_games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_guest_games_select" ON public.group_guest_games;
CREATE POLICY "group_guest_games_select"
ON public.group_guest_games
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "group_guest_games_insert" ON public.group_guest_games;
CREATE POLICY "group_guest_games_insert"
ON public.group_guest_games
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_guest_games.group_id
      AND group_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_guest_games.group_id
      AND groups.creator_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "group_guest_games_delete" ON public.group_guest_games;
CREATE POLICY "group_guest_games_delete"
ON public.group_guest_games
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_guest_games.group_id
      AND group_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_guest_games.group_id
      AND groups.creator_id = auth.uid()
  )
);

GRANT ALL ON TABLE public.group_guest_games TO anon, authenticated, service_role;
