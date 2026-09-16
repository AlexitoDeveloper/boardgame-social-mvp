-- Boardgame Social MVP - Add Spanish edition cover column and audit tracking
-- Run this script in the Supabase SQL Editor.

-- 1. Add image_url_es and spanish_checked_at columns
ALTER TABLE public.games 
  ADD COLUMN IF NOT EXISTS image_url_es TEXT,
  ADD COLUMN IF NOT EXISTS spanish_checked_at TIMESTAMPTZ;

-- 2. Clean up corrupted title_es entries where title_es was set equal to English title
-- (This was caused by the previous backfill script using English title as fallback)
UPDATE public.games
SET title_es = NULL
WHERE title_es = title;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_spanish_checked_at ON public.games (spanish_checked_at);
CREATE INDEX IF NOT EXISTS idx_games_has_spanish_edition ON public.games (has_spanish_edition);
CREATE INDEX IF NOT EXISTS idx_games_image_url_es ON public.games (image_url_es);

COMMENT ON COLUMN public.games.image_url_es IS 'BGG CDN URL for the Spanish edition box cover (null if no Spanish cover exists)';
COMMENT ON COLUMN public.games.spanish_checked_at IS 'Timestamp of when BGG versions were inspected for Spanish title/publisher/cover';
