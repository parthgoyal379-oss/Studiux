# Studiux

A local-first study operating system with an optional production Supabase backend. Release 2 adds authentication, normalized migrations, strict RLS, repository/service boundaries, offline outbox foundations, timezone/DST domain logic, recurrence, revision scheduling, deterministic analytics, secure group foundations and database-derived leaderboards.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and supply a Supabase project URL and public anonymous key to enable authenticated cloud mode. Never place a service-role key in a Vite environment variable.

## Architecture

- React + Vite interface with centralized design tokens.
- Local-first state is versioned under `studiux:v1`; it deliberately avoids pretending that auth, realtime groups, or AI exist before a secure backend is configured.
- Timer records absolute timestamps and persisted pause duration. Reloads and suspended tabs therefore do not depend on `setInterval` accuracy.
- Analytics are derived from stored sessions. Empty states never contain sample user metrics.
- Production migrations live under `supabase/migrations`. See `docs/RELEASE2_ARCHITECTURE.md` for boundaries and honest configuration-dependent limitations.
