-- Run with two authenticated test users in the Supabase local test harness.
-- Contract: every private table has RLS enabled and an owner_isolation policy.
select tablename,rowsecurity from pg_tables where schemaname='public' order by tablename;
select tablename,policyname,cmd,qual,with_check from pg_policies where schemaname='public' order by tablename,policyname;
-- The application test harness must assert User A cannot select/update User B rows,
-- non-members cannot read private groups, admins cannot transfer ownership, and
-- only an account owner can invoke the server-side account deletion function.
