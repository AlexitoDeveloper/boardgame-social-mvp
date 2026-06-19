-- Boardgame Social MVP - Add BGG metrics (rank, ratings, complexity) to games table
-- Run this in your Supabase SQL Editor.

-- 1. Add new columns to public.games table
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS bgg_rank INTEGER,
ADD COLUMN IF NOT EXISTS rating_geek NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS rating_average NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS complexity NUMERIC(3,2);

-- 2. Create indexes for performance when sorting and filtering
CREATE INDEX IF NOT EXISTS idx_games_bgg_rank ON public.games (bgg_rank);
CREATE INDEX IF NOT EXISTS idx_games_rating_geek ON public.games (rating_geek);
CREATE INDEX IF NOT EXISTS idx_games_complexity ON public.games (complexity);
