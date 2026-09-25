-- ==============================================================================
-- LudiClub - Security Hardening Phase 2 (Authorization, Privacy & Data Leaks)
-- Run this migration in your Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURE PRIVATE GROUP MEETUPS (public.meetups)
-- Drop lingering public SELECT policy so private group sessions aren't exposed.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "meetups_select_public" ON public.meetups;
DROP POLICY IF EXISTS "meetups_select_group_members" ON public.meetups;

CREATE POLICY "meetups_select_group_members" ON public.meetups
  FOR SELECT
  USING (
    group_id IS NULL -- Public community meetups
    OR creator_id = auth.uid()
    OR public.is_group_member(group_id, auth.uid())
  );

-- Protect meetup creator authorship from being transferred via update
CREATE OR REPLACE FUNCTION public.protect_meetup_creator_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.creator_id <> OLD.creator_id THEN
    RAISE EXCEPTION 'No se permite transferir la autoría de una partida' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_meetup_creator ON public.meetups;
CREATE TRIGGER trg_protect_meetup_creator
BEFORE UPDATE ON public.meetups
FOR EACH ROW
EXECUTE FUNCTION public.protect_meetup_creator_id();

-- Meetup UPDATE policies: Creator can manage meetup; attendees can update scores
DROP POLICY IF EXISTS "meetups_update_authenticated" ON public.meetups;
DROP POLICY IF EXISTS "meetups_update_group_members" ON public.meetups;
DROP POLICY IF EXISTS "meetups_update_creator" ON public.meetups;

CREATE POLICY "meetups_update_creator" ON public.meetups
  FOR UPDATE TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "meetups_update_attendees_companion" ON public.meetups
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = ANY(joined_players)
    OR (group_id IS NOT NULL AND public.is_group_member(group_id, auth.uid()))
  )
  WITH CHECK (
    creator_id = auth.uid()
    OR auth.uid() = ANY(joined_players)
    OR (group_id IS NOT NULL AND public.is_group_member(group_id, auth.uid()))
  );


-- ------------------------------------------------------------------------------
-- 2. SECURE MEETUP MESSAGES / REALTIME CHAT (public.meetup_messages)
-- Eliminate anonymous chat scraping; restrict to confirmed attendees.
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "meetup_messages_select_secured" ON public.meetup_messages;
DROP POLICY IF EXISTS "meetup_messages_select_public" ON public.meetup_messages;
DROP POLICY IF EXISTS "meetup_messages_select_participants" ON public.meetup_messages;

CREATE POLICY "meetup_messages_select_participants" ON public.meetup_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meetups m
      WHERE m.id = meetup_messages.meetup_id AND (
        m.creator_id = auth.uid()
        OR auth.uid() = ANY(m.joined_players)
        OR (m.group_id IS NOT NULL AND public.is_group_member(m.group_id, auth.uid()))
      )
    )
  );

DROP POLICY IF EXISTS "meetup_messages_insert_policy" ON public.meetup_messages;
CREATE POLICY "meetup_messages_insert_policy" ON public.meetup_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.meetups m
      WHERE m.id = meetup_messages.meetup_id AND (
        m.creator_id = auth.uid()
        OR auth.uid() = ANY(m.joined_players)
        OR (m.group_id IS NOT NULL AND public.is_group_member(m.group_id, auth.uid()))
      )
    )
  );


-- ------------------------------------------------------------------------------
-- 3. SECURE ONLINE VOICE CHANNELS (BOLA Mitigation)
-- Isolate voice_link in a secured table and gate access via secure RPC function.
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.meetup_voice_credentials (
  meetup_id UUID PRIMARY KEY REFERENCES public.meetups(id) ON DELETE CASCADE,
  voice_link TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meetup_voice_credentials ENABLE ROW LEVEL SECURITY;

-- Only confirmed attendees can view voice link rows
DROP POLICY IF EXISTS "voice_credentials_select_attendees" ON public.meetup_voice_credentials;
CREATE POLICY "voice_credentials_select_attendees" ON public.meetup_voice_credentials
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meetups m
      WHERE m.id = meetup_voice_credentials.meetup_id AND (
        m.creator_id = auth.uid()
        OR auth.uid() = ANY(m.joined_players)
        OR (m.group_id IS NOT NULL AND public.is_group_member(m.group_id, auth.uid()))
      )
    )
  );

-- Populate existing links from meetups table if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meetups' AND column_name = 'voice_link'
  ) THEN
    INSERT INTO public.meetup_voice_credentials (meetup_id, voice_link)
    SELECT id, voice_link FROM public.meetups 
    WHERE voice_link IS NOT NULL AND voice_link <> ''
    ON CONFLICT (meetup_id) DO UPDATE SET voice_link = EXCLUDED.voice_link;
  END IF;
END $$;

-- Secure RPC function to return voice link only to verified attendees
CREATE OR REPLACE FUNCTION public.get_meetup_voice_link(p_meetup_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link TEXT;
BEGIN
  SELECT voice_link INTO v_link
  FROM public.meetup_voice_credentials
  WHERE meetup_id = p_meetup_id
    AND EXISTS (
      SELECT 1 FROM public.meetups m
      WHERE m.id = p_meetup_id AND (
        m.creator_id = auth.uid()
        OR auth.uid() = ANY(m.joined_players)
        OR (m.group_id IS NOT NULL AND public.is_group_member(m.group_id, auth.uid()))
      )
    );

  RETURN v_link;
END;
$$;

-- Trigger to transparently ingest voice_link on insert/update and clear it from public.meetups
CREATE OR REPLACE FUNCTION public.sync_meetup_voice_link()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.voice_link IS NOT NULL AND NEW.voice_link <> '' THEN
    INSERT INTO public.meetup_voice_credentials (meetup_id, voice_link)
    VALUES (NEW.id, NEW.voice_link)
    ON CONFLICT (meetup_id) DO UPDATE 
    SET voice_link = EXCLUDED.voice_link, updated_at = now();

    NEW.voice_link := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_meetup_voice_link ON public.meetups;
CREATE TRIGGER trg_sync_meetup_voice_link
BEFORE INSERT OR UPDATE OF voice_link ON public.meetups
FOR EACH ROW
EXECUTE FUNCTION public.sync_meetup_voice_link();


-- ------------------------------------------------------------------------------
-- 4. PREVENT CLIENT SELF-ASSIGNMENT OF PREMIUM (public.users)
-- Stop users from updating is_premium directly via REST API.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_user_premium_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    IF coalesce(auth.role(), '') <> 'service_role' 
       AND coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' THEN
      RAISE EXCEPTION 'Solo el servicio de facturación puede modificar el estado premium' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_premium ON public.users;
CREATE TRIGGER trg_protect_user_premium
BEFORE UPDATE OF is_premium ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.protect_user_premium_status();
