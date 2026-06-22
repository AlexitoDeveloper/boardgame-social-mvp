-- Boardgame Social MVP - Add winner score column to meetup_games
-- Run this in the Supabase SQL Editor.

-- 1. Add winner_score column to meetup_games
ALTER TABLE public.meetup_games 
ADD COLUMN IF NOT EXISTS winner_score VARCHAR(255) DEFAULT NULL;

-- 2. Update existing policies if necessary (Policies automatically check all column modifications, so no changes needed)
COMMENT ON COLUMN public.meetup_games.winner_score IS 'Optional score, points or description of the victory (e.g. "104 pts", "Coop Win", "15-12")';
