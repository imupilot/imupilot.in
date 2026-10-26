-- supabase_diagnostics.sql
-- Description: Diagnostic queries to verify current table privileges and RLS policies on public.questions

-- 1. Check if RLS is currently enabled and forced on the table
SELECT relname, relrowsecurity AS rls_enabled, relforcerowsecurity AS rls_forced
FROM pg_class 
WHERE relname = 'questions' AND relnamespace = 'public'::regnamespace;

-- 2. List all existing RLS policies on the table
SELECT polname AS policy_name, 
       polpermissive AS is_permissive, 
       (SELECT string_agg(rolname, ', ') FROM pg_roles WHERE oid = ANY(polroles)) AS roles, 
       polcmd AS command, 
       pg_get_expr(polqual, polrelid) AS using_expression, 
       pg_get_expr(polwithcheck, polrelid) AS with_check_expression
FROM pg_policy 
WHERE polrelid = 'public.questions'::regclass;

-- 3. Check table-level privileges (Grants) from information_schema
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'questions' AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 4. Check direct ACL grants from pg_class (shows direct grants vs effective privileges)
SELECT relname, relacl 
FROM pg_class 
WHERE relname = 'questions' AND relnamespace = 'public'::regnamespace;
