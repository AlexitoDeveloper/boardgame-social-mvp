-- Boardgame Social MVP - Add online meetup modality
-- Run this in the Supabase SQL Editor.

-- Add online columns if they do not exist
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS voice_link TEXT;

-- Make city and location columns nullable
ALTER TABLE public.meetups ALTER COLUMN city DROP NOT NULL;
ALTER TABLE public.meetups ALTER COLUMN location DROP NOT NULL;

-- Drop old check constraint if it exists (for clean deployment)
ALTER TABLE public.meetups DROP CONSTRAINT IF EXISTS chk_meetup_modality;

-- Add check constraint for modality requirements
ALTER TABLE public.meetups ADD CONSTRAINT chk_meetup_modality CHECK (
  (is_online = true) OR 
  (is_online = false AND city IS NOT NULL AND location IS NOT NULL)
);
