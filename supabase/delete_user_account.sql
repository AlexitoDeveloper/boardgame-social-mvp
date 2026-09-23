-- ==============================================================================
-- Migration: In-App User Account Deletion (Google Play & Apple Compliance)
-- Allows an authenticated user to permanently delete their account and personal data.
-- ==============================================================================

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  curr_user_id uuid;
begin
  -- 1. Verify user is currently authenticated
  curr_user_id := auth.uid();
  if curr_user_id is null then
    raise exception 'Unauthorized: Only authenticated users can delete their own account.';
  end if;

  -- 2. Clean up joined_players array in active meetups
  update public.meetups
  set joined_players = array_remove(joined_players, curr_user_id)
  where curr_user_id = any(joined_players);

  -- 3. Delete from public.users
  -- Foreign key constraints with ON DELETE CASCADE will clean up user collections,
  -- group memberships, poll votes, and created meetups.
  delete from public.users where id = curr_user_id;

  -- 4. Delete the authentication record permanently
  delete from auth.users where id = curr_user_id;
end;
$$;

-- Secure execution permissions
revoke all on function public.delete_user_account() from public;
revoke all on function public.delete_user_account() from anon;
grant execute on function public.delete_user_account() to authenticated;
