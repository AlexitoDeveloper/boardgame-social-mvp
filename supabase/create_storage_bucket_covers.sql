-- Boardgame Social MVP - Setup Storage Bucket for Game Covers
-- Run this in your Supabase SQL Editor.

-- 1. Insert 'game-covers' bucket into storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-covers', 
  'game-covers', 
  true,                  -- public bucket so URLs can be fetched directly from CDN
  5242880,               -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (if not already enabled globally in Supabase storage schema)
-- Note: Supabase Storage enables RLS by default.

-- 3. Define RLS Policies for the bucket
-- 3.1. Select: Allow anyone to read game covers
DROP POLICY IF EXISTS "Public Access to Game Covers" ON storage.objects;
CREATE POLICY "Public Access to Game Covers" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'game-covers');

-- 3.2. Insert: Allow public uploads (required since script runs with anon key)
DROP POLICY IF EXISTS "Authenticated Uploads to Game Covers" ON storage.objects;
DROP POLICY IF EXISTS "Public Uploads to Game Covers" ON storage.objects;
CREATE POLICY "Public Uploads to Game Covers" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'game-covers');

-- 3.3. Update/Delete: Allow public modification of game covers
DROP POLICY IF EXISTS "Authenticated Modification of Game Covers" ON storage.objects;
DROP POLICY IF EXISTS "Public Modification of Game Covers" ON storage.objects;
CREATE POLICY "Public Modification of Game Covers" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'game-covers');
