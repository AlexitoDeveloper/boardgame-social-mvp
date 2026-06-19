-- Add is_premium column to public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;
