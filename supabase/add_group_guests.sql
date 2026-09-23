-- LudiClub - Add Group Habitual Guests (Group Guests)
-- Run this script in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.group_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  associated_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_group_guest_name UNIQUE (group_id, name)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.group_guests ENABLE ROW LEVEL SECURITY;

-- Select policy: members can view group guests
DROP POLICY IF EXISTS "group_guests_select_members" ON public.group_guests;
CREATE POLICY "group_guests_select_members"
ON public.group_guests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_guests.group_id
      AND group_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_guests.group_id
      AND groups.creator_id = auth.uid()
  )
);

-- Insert policy: members can add group guests
DROP POLICY IF EXISTS "group_guests_insert_members" ON public.group_guests;
CREATE POLICY "group_guests_insert_members"
ON public.group_guests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_guests.group_id
      AND group_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_guests.group_id
      AND groups.creator_id = auth.uid()
  )
);

-- Update policy: members can link/associate guests
DROP POLICY IF EXISTS "group_guests_update_members" ON public.group_guests;
CREATE POLICY "group_guests_update_members"
ON public.group_guests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Delete policy: members can remove group guests
DROP POLICY IF EXISTS "group_guests_delete_members" ON public.group_guests;
CREATE POLICY "group_guests_delete_members"
ON public.group_guests
FOR DELETE
TO authenticated
USING (true);

GRANT ALL ON TABLE public.group_guests TO authenticated, anon, service_role;
