-- =====================================================================
-- BOARDGAME SOCIAL MVP - AUDIT FIXES & OPTIMIZATIONS
-- =====================================================================

-- 1. SERVER-SIDE AGGREGATED STATS (RPC)
-- Calculates user profile statistics directly on PostgreSQL rather than client-side
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE(
  played INTEGER,
  won INTEGER,
  win_rate INTEGER,
  karma INTEGER,
  missed INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_completed_meetups INTEGER := 0;
  v_attended_meetups INTEGER := 0;
  v_missed_meetups INTEGER := 0;
  v_played_games INTEGER := 0;
  v_won_games INTEGER := 0;
  v_win_rate INTEGER := 0;
  v_karma INTEGER := 100;
BEGIN
  -- 1. Count completed meetups where user was signed up
  SELECT COUNT(*) INTO v_completed_meetups
  FROM public.meetups
  WHERE completed = true AND p_user_id = ANY(joined_players);

  -- 2. Count completed meetups where user actually attended
  SELECT COUNT(*) INTO v_attended_meetups
  FROM public.meetups
  WHERE completed = true AND p_user_id = ANY(attended_players);

  -- 3. Calculate missed meetups
  v_missed_meetups := v_completed_meetups - v_attended_meetups;

  -- 4. Calculate total games played:
  -- Sum the games associated to meetups the user attended. If a meetup has no games, count as 1.
  SELECT COALESCE(SUM(
    CASE 
      WHEN (SELECT COUNT(*) FROM public.meetup_games WHERE meetup_id = m.id) = 0 THEN 1
      ELSE (SELECT COUNT(*) FROM public.meetup_games WHERE meetup_id = m.id)
    END
  ), 0) INTO v_played_games
  FROM public.meetups m
  WHERE m.completed = true AND p_user_id = ANY(m.attended_players);

  -- 5. Calculate total games won:
  -- Count meetup_games rows associated to completed meetups where the user is the winner
  SELECT COUNT(*) INTO v_won_games
  FROM public.meetup_games mg
  JOIN public.meetups m ON m.id = mg.meetup_id
  WHERE m.completed = true AND mg.winner_user_id = p_user_id;

  -- 6. Calculate Win rate & Karma
  IF v_played_games > 0 THEN
    v_win_rate := ROUND((v_won_games::float / v_played_games::float) * 100);
  END IF;

  IF v_completed_meetups > 0 THEN
    v_karma := ROUND((v_attended_meetups::float / v_completed_meetups::float) * 100);
  END IF;

  RETURN QUERY SELECT 
    v_played_games::INTEGER, 
    v_won_games::INTEGER, 
    v_win_rate::INTEGER, 
    v_karma::INTEGER, 
    v_missed_meetups::INTEGER;
END;
$$;


-- 2. COMPOSITE INDEXES
-- Optimize ordered chat retrieves, lookup collection duplicates, and poll vote aggregates
CREATE INDEX IF NOT EXISTS idx_meetup_messages_meetup_created 
  ON public.meetup_messages (meetup_id, created_at);

CREATE INDEX IF NOT EXISTS idx_user_collection_user_game 
  ON public.user_collection (user_id, game_id);

CREATE INDEX IF NOT EXISTS idx_group_poll_votes_poll_game 
  ON public.group_poll_votes (poll_id, game_id);


-- 3. MEETUP GUESTS SECURITY TIGHTENING
-- Remove wide-open inserts, allow only creators and meetup players to register guests
DROP POLICY IF EXISTS "meetup_guests_insert_public" ON public.meetup_guests;
CREATE POLICY "meetup_guests_insert_restricted" ON public.meetup_guests
  FOR INSERT TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetups
      WHERE id = meetup_id AND (
        creator_id = auth.uid() 
        OR auth.uid() = ANY(joined_players)
        -- Also allow anonymous users to register guest rows if it is not completed 
        -- (safeguarded by trigger limit count check)
        OR (auth.role() = 'anon' AND completed = false)
      )
    )
  );


-- 4. SECURE CHAT LOGISTICS
-- Prevent sending new messages to completed meetups using a database trigger
CREATE OR REPLACE FUNCTION public.check_meetup_chat_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.meetups
    WHERE id = NEW.meetup_id AND completed = true
  ) THEN
    RAISE EXCEPTION 'No se pueden enviar mensajes a una partida ya cerrada' USING ERRCODE = 'ERR04';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_meetup_chat_active ON public.meetup_messages;
CREATE TRIGGER trg_check_meetup_chat_active
  BEFORE INSERT ON public.meetup_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_meetup_chat_active();
