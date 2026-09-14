-- Table Companion Migration: Group Sessions, Detailed Scores, Board Photos, and Shelf of Shame
-- Run this in your Supabase SQL editor.

-- 1. Add group link, board photo, player scores, and first player to meetups table
ALTER TABLE public.meetups
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS board_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS player_scores JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS first_player_id TEXT;

-- 2. Index for faster queries on group sessions
CREATE INDEX IF NOT EXISTS idx_meetups_group_id ON public.meetups(group_id);

-- 3. Add is_unplayed and play_count to user_collection for "Estantería de la Vergüenza"
ALTER TABLE public.user_collection
  ADD COLUMN IF NOT EXISTS is_unplayed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;

-- 4. RLS updates: ensure members of a group can view their group's meetups even if private
DROP POLICY IF EXISTS "meetups_select_group_members" ON public.meetups;
CREATE POLICY "meetups_select_group_members"
  ON public.meetups
  FOR SELECT
  USING (
    group_id IS NULL -- Public or non-group meetups
    OR creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = meetups.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- 5. Allow group members to update attendance / scores in a group meetup if active
DROP POLICY IF EXISTS "meetups_update_group_members" ON public.meetups;
CREATE POLICY "meetups_update_group_members"
  ON public.meetups
  FOR UPDATE
  TO authenticated
  USING (
    creator_id = auth.uid()
    OR (
      group_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = meetups.group_id
          AND group_members.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (true);
