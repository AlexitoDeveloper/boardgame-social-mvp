-- Boardgame Social MVP - Add meetup games winners and seed test data
-- Run this in the Supabase SQL Editor.

-- 1. Add winner columns to meetup_games
ALTER TABLE public.meetup_games 
ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS winner_guest_id UUID REFERENCES public.meetup_guests(id) ON DELETE SET NULL;

-- 2. Migrate existing winner_user_id from meetups to meetup_games to preserve history
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'meetups' AND column_name = 'winner_user_id'
  ) THEN
    UPDATE public.meetup_games mg
    SET winner_user_id = m.winner_user_id
    FROM public.meetups m
    WHERE mg.meetup_id = m.id AND m.winner_user_id IS NOT NULL;
  END IF;
END $$;

-- 3. Define UPDATE RLS Policy for meetup_games so the creator can save winners
DROP POLICY IF EXISTS "meetup_games_update_creator" ON public.meetup_games;
CREATE POLICY "meetup_games_update_creator" ON public.meetup_games 
FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.meetups 
    WHERE id = meetup_id AND creator_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meetups 
    WHERE id = meetup_id AND creator_id = auth.uid()
  )
);

-- 4. Seed test meetups with multiple games ready to assign winners (uncompleted)
-- We will use the existing sample userscf957a43-1dd5-4b26-b102-9508d8010464 (alex) and e0658e26-6e0c-4e8b-ab68-69fa4c4cd062 (tester2)
DO $$
DECLARE
  meetup1_id UUID := 'd9000000-0000-0000-0000-000000000001';
  meetup2_id UUID := 'd9000000-0000-0000-0000-000000000002';
BEGIN
  -- Check if sample creator exists
  IF EXISTS (SELECT 1 FROM public.users WHERE id = 'cf957a43-1dd5-4b26-b102-9508d8010464') THEN
    -- Delete if already exists to allow re-running
    DELETE FROM public.meetup_games WHERE meetup_id IN (meetup1_id, meetup2_id);
    DELETE FROM public.meetups WHERE id IN (meetup1_id, meetup2_id);

    -- 4.1. Insert First Active Meetup (Brass: Birmingham + Dixit)
    INSERT INTO public.meetups (
      id, creator_id, title, description, city, location, date, max_players, joined_players, completed
    ) VALUES (
      meetup1_id,
      'cf957a43-1dd5-4b26-b102-9508d8010464',
      'Sesión Multijuego de Prueba',
      'Probando el cierre de partida con ganadores individuales. Jugaremos Brass y Dixit.',
      'Madrid',
      'Asociación Lúdica',
      now() + interval '3 days',
      4,
      '{cf957a43-1dd5-4b26-b102-9508d8010464, e0658e26-6e0c-4e8b-ab68-69fa4c4cd062}',
      false
    );

    -- Associate Brass: Birmingham (224517)
    IF EXISTS (SELECT 1 FROM public.games WHERE bgg_id = 224517) THEN
      INSERT INTO public.meetup_games (meetup_id, game_id) VALUES (meetup1_id, 224517);
    END IF;

    -- Associate Dixit (37111)
    IF EXISTS (SELECT 1 FROM public.games WHERE bgg_id = 37111) THEN
      INSERT INTO public.meetup_games (meetup_id, game_id) VALUES (meetup1_id, 37111);
    END IF;

    -- 4.2. Insert Second Active Meetup (Catan + Twilight Struggle)
    INSERT INTO public.meetups (
      id, creator_id, title, description, city, location, date, max_players, joined_players, completed
    ) VALUES (
      meetup2_id,
      'cf957a43-1dd5-4b26-b102-9508d8010464',
      'Mega Sesión Eurogames',
      'Probando una sesión larga con Catan y Twilight Struggle. Listo para asignar ganadores.',
      'Madrid',
      'Casa de Alex',
      now() + interval '5 days',
      4,
      '{cf957a43-1dd5-4b26-b102-9508d8010464, e0658e26-6e0c-4e8b-ab68-69fa4c4cd062, 7d8b1c1e-bf91-4cf1-8c4d-6b5839218204}',
      false
    );

    -- Associate Catan (13)
    IF EXISTS (SELECT 1 FROM public.games WHERE bgg_id = 13) THEN
      INSERT INTO public.meetup_games (meetup_id, game_id) VALUES (meetup2_id, 13);
    END IF;

    -- Associate Twilight Struggle (12333)
    IF EXISTS (SELECT 1 FROM public.games WHERE bgg_id = 12333) THEN
      INSERT INTO public.meetup_games (meetup_id, game_id) VALUES (meetup2_id, 12333);
    END IF;

  END IF;
END $$;
