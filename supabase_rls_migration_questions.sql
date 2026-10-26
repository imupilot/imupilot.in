-- supabase_rls_migration_questions.sql
-- Description: Enables Row Level Security for the public.questions table.

-- WHAT THIS MIGRATION PROTECTS:
-- 1. This migration completely blocks all unprivileged frontend clients (anon, authenticated) from performing 
--    INSERT, UPDATE, DELETE, or UPSERT operations.
-- 2. It blocks all unprivileged SELECT access. Legitimate reads must now pass through the secured backend API,
--    which safely strips correct_option and other answer keys before sending to the client.

-- WHAT THIS MIGRATION DOES NOT PROTECT:
-- 1. It DOES NOT alter grants or clean up old policies automatically.
-- 2. It assumes backend service-role operations bypass RLS successfully.

-- 1. Enable RLS on the table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- NO POLICIES ARE CREATED FOR ANY OPERATION.
-- By defaulting to RLS-deny, we force all questions access through the privileged backend Node API.
-- No DROP statements are executed blindly. Use the diagnostics script to manually review and drop any permissive legacy policies.
