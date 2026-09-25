-- ==============================================================================
-- LudiClub - Security Hardening Phase 1 (Critical & High Vulnerabilities)
-- Run this migration in your Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURE STORAGE BUCKET: game-covers
-- Lock down write/delete operations so only service_role can modify game covers.
-- ------------------------------------------------------------------------------

-- Ensure the bucket exists and is marked public for CDN reads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-covers', 
  'game-covers', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Revoke dangerous public write/delete policies
DROP POLICY IF EXISTS "Public Uploads to Game Covers" ON storage.objects;
DROP POLICY IF EXISTS "Public Modification of Game Covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads to Game Covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Modification of Game Covers" ON storage.objects;

-- Enforce public read-only access
DROP POLICY IF EXISTS "Public Access to Game Covers" ON storage.objects;
CREATE POLICY "Public Access to Game Covers" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'game-covers');

-- Allow service_role full control (bypasses RLS by default, but explicit for clarity)
DROP POLICY IF EXISTS "Service Role Game Covers Full Access" ON storage.objects;
CREATE POLICY "Service Role Game Covers Full Access" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'game-covers')
WITH CHECK (bucket_id = 'game-covers');


-- ------------------------------------------------------------------------------
-- 2. SECURE GLOBAL CATALOG: public.games
-- Enable RLS to prevent unauthorized truncation, deletion, or tampering.
-- ------------------------------------------------------------------------------

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- 2.1. Read access: Anyone (anon or authenticated) can view games
DROP POLICY IF EXISTS "games_select_public" ON public.games;
CREATE POLICY "games_select_public" ON public.games
  FOR SELECT TO anon, authenticated
  USING (true);

-- 2.2. Write access: Only service_role can insert, update, or delete games
DROP POLICY IF EXISTS "games_insert_service_role" ON public.games;
CREATE POLICY "games_insert_service_role" ON public.games
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "games_update_service_role" ON public.games;
CREATE POLICY "games_update_service_role" ON public.games
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "games_delete_service_role" ON public.games;
CREATE POLICY "games_delete_service_role" ON public.games
  FOR DELETE TO service_role
  USING (true);

-- Revoke write permissions from public/anon/authenticated roles
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.games FROM anon, authenticated, public;
GRANT SELECT ON TABLE public.games TO anon, authenticated;
GRANT ALL ON TABLE public.games TO service_role;


-- ------------------------------------------------------------------------------
-- 3. SECURE GROUP MEMBERSHIP & PREVENT PRIVILEGE ESCALATION: public.group_members
-- Stop authenticated users from directly inserting themselves as 'admin' in any group.
-- ------------------------------------------------------------------------------

-- Trigger: Automatically add the creator of a new group as 'admin'
CREATE OR REPLACE FUNCTION public.handle_new_group_creator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (new.id, new.creator_id, 'admin')
  ON CONFLICT (group_id, user_id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_group_creator_member ON public.groups;
CREATE TRIGGER trg_group_creator_member
AFTER INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_group_creator();

-- Drop wide-open group_members insert policy
DROP POLICY IF EXISTS "group_members_insert" ON public.group_members;

-- Only group creators can directly insert members via REST (e.g. self-inserting upon creation)
-- Non-creators MUST join via the secure join_group_by_invite_code RPC
CREATE POLICY "group_members_insert_creator_only" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM public.groups g 
        WHERE g.id = group_id AND g.creator_id = auth.uid()
      )
    )
  );


-- ------------------------------------------------------------------------------
-- 4. SECURE GROUP HABITUAL GUESTS: public.group_guests & public.group_guest_games
-- Eliminate IDOR allowing any authenticated user to update/delete other groups' guests.
-- ------------------------------------------------------------------------------

-- 4.1. Restrict group_guests update to verified members or creator
DROP POLICY IF EXISTS "group_guests_update_members" ON public.group_guests;
CREATE POLICY "group_guests_update_members"
ON public.group_guests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_guests.group_id
      AND gm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_guests.group_id
      AND g.creator_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_guests.group_id
      AND gm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_guests.group_id
      AND g.creator_id = auth.uid()
  )
);

-- 4.2. Restrict group_guests delete to verified members or creator
DROP POLICY IF EXISTS "group_guests_delete_members" ON public.group_guests;
CREATE POLICY "group_guests_delete_members"
ON public.group_guests
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_guests.group_id
      AND gm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_guests.group_id
      AND g.creator_id = auth.uid()
  )
);

-- 4.3. Restrict group_guest_games select so only group members/creator see guest games
DROP POLICY IF EXISTS "group_guest_games_select" ON public.group_guest_games;
CREATE POLICY "group_guest_games_select"
ON public.group_guest_games
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_guest_games.group_id
      AND gm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_guest_games.group_id
      AND g.creator_id = auth.uid()
  )
);
