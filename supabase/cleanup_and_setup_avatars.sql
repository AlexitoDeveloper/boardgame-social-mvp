-- ============================================================
-- Boardgame Social MVP — Database Cleanup
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Drop reviews table (never used in frontend, not needed)
DROP TABLE IF EXISTS public.reviews;

-- 2. Drop games_cache table (only written by bgg-search, which is deleted)
DROP TABLE IF EXISTS public.games_cache;

-- 3. Remove legacy winner columns from meetups
--    Winners now live exclusively in meetup_games (per-game granularity)
ALTER TABLE public.meetups
  DROP COLUMN IF EXISTS winner_user_id,
  DROP COLUMN IF EXISTS winner_guest_id;

-- ============================================================
-- Boardgame Social MVP — Create avatars Storage Bucket
-- ============================================================

-- 3. Create the avatars bucket (public, 5MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,   -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS Policies for avatars bucket

-- 4.1 Public read access (avatars are publicly visible)
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
CREATE POLICY "Avatar public read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- 4.2 Authenticated upload — only to their own public/<uid>/ folder
DROP POLICY IF EXISTS "Avatar authenticated upload" ON storage.objects;
CREATE POLICY "Avatar authenticated upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'public'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4.3 Authenticated update of own avatar
DROP POLICY IF EXISTS "Avatar authenticated update" ON storage.objects;
CREATE POLICY "Avatar authenticated update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4.4 Authenticated delete of own avatar
DROP POLICY IF EXISTS "Avatar authenticated delete" ON storage.objects;
CREATE POLICY "Avatar authenticated delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ============================================================
-- Boardgame Social MVP — Document online meetup columns
-- These were added directly in SQL Editor without local files.
-- Running this is safe (IF NOT EXISTS / IF NOT EXISTS).
-- ============================================================

-- 5. Ensure online meetup columns exist (idempotent)
ALTER TABLE public.meetups
  ADD COLUMN IF NOT EXISTS is_online   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS platform    TEXT,
  ADD COLUMN IF NOT EXISTS voice_link  TEXT;
