-- Boardgame Social MVP - Add game metadata fields (playtimes, min_age, categories, mechanics)
-- Run this migration in your Supabase SQL Editor.

-- 1. Add new columns to public.games table
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS min_play_time INTEGER,
  ADD COLUMN IF NOT EXISTS max_play_time INTEGER,
  ADD COLUMN IF NOT EXISTS min_age INTEGER,
  ADD COLUMN IF NOT EXISTS categories TEXT[],
  ADD COLUMN IF NOT EXISTS mechanics TEXT[];

-- 2. Create indexes for performance when filtering and querying
CREATE INDEX IF NOT EXISTS idx_games_min_age ON public.games (min_age);
CREATE INDEX IF NOT EXISTS idx_games_categories ON public.games USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_games_mechanics ON public.games USING GIN (mechanics);

COMMENT ON COLUMN public.games.min_play_time IS 'Minimum play time in minutes from BGG';
COMMENT ON COLUMN public.games.max_play_time IS 'Maximum play time in minutes from BGG';
COMMENT ON COLUMN public.games.min_age IS 'Minimum recommended player age from BGG';
COMMENT ON COLUMN public.games.categories IS 'List of game categories from BGG';
COMMENT ON COLUMN public.games.mechanics IS 'List of game mechanics from BGG';
