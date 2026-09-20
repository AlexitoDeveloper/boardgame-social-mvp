-- Boardgame Social MVP - Allow group members to add games to co-members' collections
-- Run this script in your Supabase SQL Editor.

DROP POLICY IF EXISTS "user_collection_insert_own" ON public.user_collection;
DROP POLICY IF EXISTS "user_collection_insert_group_or_own" ON public.user_collection;

CREATE POLICY "user_collection_insert_group_or_own" ON public.user_collection
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = public.user_collection.user_id
    )
  );

DROP POLICY IF EXISTS "user_collection_delete_group_or_own" ON public.user_collection;
CREATE POLICY "user_collection_delete_group_or_own" ON public.user_collection
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.groups g
      JOIN public.group_members gm ON gm.group_id = g.id
      WHERE (g.creator_id = auth.uid() OR (gm.user_id = auth.uid() AND gm.role = 'admin'))
        AND EXISTS (
          SELECT 1 FROM public.group_members target_gm
          WHERE target_gm.group_id = g.id AND target_gm.user_id = public.user_collection.user_id
        )
    )
  );
