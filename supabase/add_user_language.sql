-- Migration: Add language preference to public.users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'es' NOT NULL
CONSTRAINT chk_user_language CHECK (language IN ('es', 'en'));

-- Add documentation comment
COMMENT ON COLUMN public.users.language IS 'User preferred UI language: es (Spanish) or en (English)';
