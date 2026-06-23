-- Boardgame Social MVP - Security & Performance Fixes (Groups, Polls, and Aggregations)
-- Run this in your Supabase SQL Editor.

-- ==========================================
-- 0. HELPER FUNCTIONS TO PREVENT RECURSION
-- ==========================================

-- Helper function to check group membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- Runs as creator (postgres), bypassing RLS for this lookup
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_user_id
  );
$$;

-- Helper function to check group creator status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_creator(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- Runs as creator (postgres), bypassing RLS for this lookup
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id AND creator_id = p_user_id
  );
$$;


-- ==========================================
-- 1. GROUPS TABLE SECURITY & LOOKUP RPC
-- ==========================================

-- Drop the lax select policy
DROP POLICY IF EXISTS "groups_select_authenticated" ON public.groups;
DROP POLICY IF EXISTS "groups_select_members" ON public.groups;
DROP POLICY IF EXISTS "groups_select_members_only" ON public.groups;

-- Create strict select policy: only members and the creator can select groups directly
CREATE POLICY "groups_select_members_only" ON public.groups
  FOR SELECT TO authenticated
  USING (
    creator_id = auth.uid()
    OR public.is_group_member(id, auth.uid())
  );

-- Create a secure RPC function to join a group using its invite code
CREATE OR REPLACE FUNCTION public.join_group_by_invite_code(p_invite_code text)
RETURNS public.groups
LANGUAGE plpgsql
SECURITY DEFINER -- bypasses standard RLS select rules to find the group
SET search_path = public
AS $$
DECLARE
  v_group public.groups;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = '42501';
  END IF;

  -- 1. Look up the group by invite code
  SELECT * INTO v_group 
  FROM public.groups 
  WHERE UPPER(invite_code) = UPPER(p_invite_code);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código de invitación no encontrado' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Check if the user is already a member
  IF public.is_group_member(v_group.id, v_user_id) THEN
    -- Already a member, return the group details
    RETURN v_group;
  END IF;

  -- 3. Insert user as member
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group.id, v_user_id, 'member');

  RETURN v_group;
END;
$$;


-- ==========================================
-- 2. GROUP MEMBERS TABLE SECURITY
-- ==========================================

-- Drop any public or old select/delete policies
DROP POLICY IF EXISTS "group_members_select" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_restricted" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete" ON public.group_members;

-- Restricted select policy: users can see member list of groups they belong to
CREATE POLICY "group_members_select_restricted" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_creator(group_id, auth.uid())
    OR public.is_group_member(group_id, auth.uid())
  );

-- Delete policy: users can leave group, or group creator can kick members
CREATE POLICY "group_members_delete" ON public.group_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.is_group_creator(group_id, auth.uid())
  );


-- ==========================================
-- 3. GROUP POLLS & OPTIONS SECURITY
-- ==========================================

-- 3.1. group_polls policies
DROP POLICY IF EXISTS "group_polls_all_members" ON public.group_polls;
DROP POLICY IF EXISTS "group_polls_select_members" ON public.group_polls;
DROP POLICY IF EXISTS "group_polls_insert_members" ON public.group_polls;
DROP POLICY IF EXISTS "group_polls_modify_creator" ON public.group_polls;

-- SELECT: Any group member or the group creator can read polls
CREATE POLICY "group_polls_select_members" ON public.group_polls
  FOR SELECT TO authenticated
  USING (
    public.is_group_member(group_id, auth.uid())
    OR public.is_group_creator(group_id, auth.uid())
  );

-- INSERT: Any group member can create a poll
CREATE POLICY "group_polls_insert_members" ON public.group_polls
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_group_member(group_id, auth.uid())
  );

-- UPDATE/DELETE: Only the group creator can update (e.g. close) or delete polls
CREATE POLICY "group_polls_modify_creator" ON public.group_polls
  FOR ALL TO authenticated
  USING (
    public.is_group_creator(group_id, auth.uid())
  )
  WITH CHECK (
    public.is_group_creator(group_id, auth.uid())
  );


-- 3.2. group_poll_options policies
DROP POLICY IF EXISTS "group_poll_options_all_members" ON public.group_poll_options;
DROP POLICY IF EXISTS "group_poll_options_select" ON public.group_poll_options;
DROP POLICY IF EXISTS "group_poll_options_insert" ON public.group_poll_options;
DROP POLICY IF EXISTS "group_poll_options_modify_creator" ON public.group_poll_options;

-- SELECT: Read options if user is in group
CREATE POLICY "group_poll_options_select" ON public.group_poll_options
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_polls p
      WHERE p.id = poll_id AND (
        public.is_group_member(p.group_id, auth.uid())
        OR public.is_group_creator(p.group_id, auth.uid())
      )
    )
  );

-- INSERT: Insert options if user is in group
CREATE POLICY "group_poll_options_insert" ON public.group_poll_options
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_polls p
      WHERE p.id = poll_id AND public.is_group_member(p.group_id, auth.uid())
    )
  );

-- DELETE/UPDATE: Restrict option management (e.g. clear options) to the group creator
CREATE POLICY "group_poll_options_modify_creator" ON public.group_poll_options
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_polls p
      WHERE p.id = poll_id AND public.is_group_creator(p.group_id, auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_polls p
      WHERE p.id = poll_id AND public.is_group_creator(p.group_id, auth.uid())
    )
  );


-- ==========================================
-- 4. GROUP POLL VOTES SECURITY
-- ==========================================

DROP POLICY IF EXISTS "group_poll_votes_all_members" ON public.group_poll_votes;
DROP POLICY IF EXISTS "group_poll_votes_select" ON public.group_poll_votes;
DROP POLICY IF EXISTS "group_poll_votes_modify_own" ON public.group_poll_votes;

-- SELECT: Any group member or group creator can view votes
CREATE POLICY "group_poll_votes_select" ON public.group_poll_votes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_polls p
      WHERE p.id = poll_id AND (
        public.is_group_member(p.group_id, auth.uid())
        OR public.is_group_creator(p.group_id, auth.uid())
      )
    )
  );

-- MODIFY: Users can only write/update/delete their OWN votes if they are group members
CREATE POLICY "group_poll_votes_modify_own" ON public.group_poll_votes
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.group_polls p
      WHERE p.id = poll_id AND public.is_group_member(p.group_id, auth.uid())
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.group_polls p
      WHERE p.id = poll_id AND public.is_group_member(p.group_id, auth.uid())
    )
  );


-- ==========================================
-- 5. PERFORMANCE: MOST PLAYED GAMES RPC
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_most_played_games(p_time_limit_iso text DEFAULT NULL)
RETURNS SETOF public.games
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_time_limit timestamptz;
BEGIN
  IF p_time_limit_iso IS NOT NULL THEN
    v_time_limit := p_time_limit_iso::timestamptz;
  END IF;

  RETURN QUERY
  WITH play_counts AS (
    SELECT mg.game_id, COUNT(*) as cnt
    FROM public.meetup_games mg
    JOIN public.meetups m ON m.id = mg.meetup_id
    WHERE (v_time_limit IS NULL OR m.date >= v_time_limit)
    GROUP BY mg.game_id
  ),
  ordered_ids AS (
    SELECT pc.game_id, pc.cnt
    FROM play_counts pc
    ORDER BY pc.cnt DESC
  ),
  overall_ids AS (
    SELECT mg.game_id, COUNT(*) as cnt
    FROM public.meetup_games mg
    GROUP BY mg.game_id
    ORDER BY cnt DESC
  ),
  bgg_rank_ids AS (
    SELECT g.bgg_id as game_id, 0::bigint as cnt
    FROM public.games g
    WHERE g.bgg_rank IS NOT NULL
    ORDER BY g.bgg_rank ASC
    LIMIT 20
  ),
  combined_ids AS (
    SELECT game_id, cnt, 1 as priority FROM ordered_ids
    UNION ALL
    SELECT game_id, cnt, 2 as priority FROM overall_ids
    UNION ALL
    SELECT game_id, cnt, 3 as priority FROM bgg_rank_ids
  ),
  distinct_ids AS (
    SELECT game_id, MAX(cnt) as max_cnt, MIN(priority) as min_priority
    FROM combined_ids
    GROUP BY game_id
    ORDER BY min_priority ASC, max_cnt DESC, game_id ASC
    LIMIT 10
  )
  SELECT g.*
  FROM public.games g
  JOIN distinct_ids d ON d.game_id = g.bgg_id
  ORDER BY d.min_priority ASC, d.max_cnt DESC, g.bgg_id ASC;
END;
$$;
