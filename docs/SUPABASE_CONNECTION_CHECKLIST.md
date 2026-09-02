# Connect and verify Supabase

## Configure

1. Create a dedicated Supabase project and record its project reference.
2. Add only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` and the deployment environment. Never expose the service-role key to Vite.
3. Configure the production URL and localhost callback URLs under Authentication → URL Configuration.
4. Decide whether email confirmation is required and configure an SMTP provider before relying on delivery.

## Migration deployment

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list
supabase db push --dry-run
supabase db push
supabase migration list
```

Deploy forward migrations in filename order, including `202609020001_release3_query_indexes.sql`, `202609020002_release3_completion_schema.sql`, and `202609020003_exam_context.sql` when absent remotely. Do not repair migration history unless the remote/local difference has been investigated. After deployment, inspect tables, foreign keys, partial unique indexes, policies, grants, triggers and functions in the dashboard or via `supabase db dump --schema public`.

## Two-user RLS verification

- Create isolated User A and User B test accounts.
- As A create a profile update, subject, task and study session.
- As B, attempt select/update/delete/owner-spoofed insert using A's UUIDs. Every operation must return no rows or a permission error.
- Create a private group as A. Confirm B cannot read it before joining.
- Join only through `join_group_by_code`. Confirm direct `group_members` insertion is denied.
- Confirm member B cannot update the group, alter roles or remove another member.
- Promote B to admin as owner A. Confirm B still cannot alter/remove the owner or assign owner role.
- Confirm unauthenticated and User B calls to `delete_my_account` cannot delete A; calling as A deletes only A.

## Cross-device and offline verification

1. Start a timer as A on Device 1.
2. Open Device 2 and confirm the existing active session is detected.
3. Verify a second start hits the unique constraint and maps to `ACTIVE_SESSION_EXISTS`.
4. Resume on Device 2 and confirm timestamps are unchanged.
5. Finish offline, reconnect and confirm exactly one completed session exists by `client_request_id`.
6. Create/update a subject and task offline; reconnect and confirm each mutation applies once.
7. Change timezone/reset time and confirm analytics regroup without raw timestamp mutation.

## Auth verification

Test signup, confirmation-required state, login, refresh restoration, logout, expired token, password-reset request, valid reset callback, invalid callback and network failure. Confirm private screens never render while auth state is `INITIALIZING`.
