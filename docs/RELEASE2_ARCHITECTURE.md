# Studiux Release 2 architecture

## Runtime modes

Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, Studiux remains a functional local-first application. With both public values configured, authentication becomes mandatory and Supabase is the durable source. A service-role key is never accepted by client code.

## Boundaries

- `src/lib`: validated environment and the single Supabase client.
- `src/auth`: session restoration and product-specific authentication UI.
- `src/repositories`: table access. UI components must not query Supabase directly.
- `src/services`: authentication, offline mutation syncing and exports.
- `src/domain`: deterministic timezone, recurrence, revision and analytics rules.
- `supabase/migrations`: normalized schema, constraints, RLS and security-definer RPCs.

## Synchronization

Local interaction stays immediate. Each durable entity mutation receives a client-generated UUID and enters an outbox. Flushes upsert individual entities, retain failed mutations with attempt metadata, and use database uniqueness for retry safety. The app never uploads one giant state object.

## Timer

Elapsed time remains timestamp-derived. PostgreSQL has a partial unique index allowing only one `ACTIVE` or `PAUSED` session per user. `client_request_id` makes offline completion retries idempotent. A future UI pass should surface `timerRepository.active()` as the cross-device resume/keep-running decision.

## Security

Every private table has RLS with `owner_id = auth.uid()`. Groups use membership and role helper functions. Leaderboards derive totals from completed underlying sessions in a database function; clients cannot submit aggregate hours. Account deletion deletes only `auth.uid()` and cascades owned private data.

## Configuration-dependent verification

Migrations, email delivery, two-user IDOR checks, cross-device restoration and realtime presence require a linked Supabase project. They cannot be truthfully marked verified from an unconfigured local build.
