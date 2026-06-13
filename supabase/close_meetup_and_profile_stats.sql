-- Boardgame Social MVP - Phase 2: Complete Match and Profile Stats
-- Run this in your Supabase SQL Editor.

-- Add new columns to the meetups table to support match completion and stats
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS winner_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS winner_guest_id uuid REFERENCES public.meetup_guests(id) ON DELETE SET NULL;
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS attended_players uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS attended_guests uuid[] NOT NULL DEFAULT '{}';

-- Indexing for stats query performance
CREATE INDEX IF NOT EXISTS idx_meetups_completed ON public.meetups (completed);
CREATE INDEX IF NOT EXISTS idx_meetups_winner_user ON public.meetups (winner_user_id);
