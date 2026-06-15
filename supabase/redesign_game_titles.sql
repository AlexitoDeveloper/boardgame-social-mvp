-- Boardgame Social MVP - Redesign game title and publisher columns
-- Run this in your Supabase SQL Editor.
--
-- Summary of changes:
--   DROP:  title_original  (redundant — title is already the English/original title)
--   DROP:  year            (redundant — year_published is the canonical column)
--   ADD:   title_es        (Spanish title, populated by bgg-backfill cron job)
--   ADD:   publisher       (original/English publisher from BGG)
--
-- After this migration, the contract is:
--   title         = original English/international title (NEVER overwrite with Spanish)
--   title_es      = Spanish title (nullable, set when a Spanish edition exists)
--   publisher     = original publisher (e.g. "Fantasy Flight Games")
--   es_publisher  = Spanish publisher (e.g. "Edge Entertainment")

-- 1. Drop title_original (we just added it; title already is the original)
ALTER TABLE public.games DROP COLUMN IF EXISTS title_original;

-- 2. Drop year (redundant with year_published)
ALTER TABLE public.games DROP COLUMN IF EXISTS year;

-- 3. Add title_es — Spanish title (NULL = not yet checked / no Spanish edition)
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS title_es TEXT;

-- 4. Add publisher — original/English publisher
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS publisher TEXT;

-- 5. Indexes for future search/filter
CREATE INDEX IF NOT EXISTS idx_games_title_es   ON public.games (title_es);
CREATE INDEX IF NOT EXISTS idx_games_publisher  ON public.games (publisher);
