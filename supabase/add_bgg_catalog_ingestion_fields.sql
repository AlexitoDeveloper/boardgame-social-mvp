-- Boardgame Social MVP - Add BGG catalog ingestion and expansions support fields to games table
-- Run this in your Supabase SQL Editor.

-- 1. Add new columns to public.games table
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS es_publisher TEXT,
ADD COLUMN IF NOT EXISTS has_spanish_edition BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_expansion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bgg_base_game_id INTEGER,
ADD COLUMN IF NOT EXISTS base_game_id UUID REFERENCES public.games(id) ON DELETE SET NULL;

-- 2. Create indexes for foreign keys to optimize expansion querying
CREATE INDEX IF NOT EXISTS idx_games_base_game_id ON public.games(base_game_id);
CREATE INDEX IF NOT EXISTS idx_games_bgg_base_game_id ON public.games(bgg_base_game_id);
CREATE INDEX IF NOT EXISTS idx_games_bgg_id ON public.games(bgg_id);
