# RELEASE 2C STATUS

Release 2C local integration is implemented. Dashboard, Subjects, Tasks, Focus, Analytics, and Profile/Settings now consume one repository-backed workspace provider. No real Supabase project was connected; all cloud behavior described here is contract/mock verification only.

# SCREENS MIGRATED

- Dashboard reads hydrated profile, task, subject, and session entities.
- Subjects create/update paths persist entity mutations; removal is represented by archive semantics in the workspace diff layer.
- Tasks create/complete/reopen paths persist entity mutations. Study duration remains session-derived.
- Focus active/paused/completed state is persisted as session entities with stable client IDs.
- Analytics reads the same session entities and custom reset setting as Dashboard.
- Profile/Settings saves display name, username, timezone, reset hour, target, and theme through the profile/preferences repositories.

# CANONICAL DATA FLOW

`UI -> useStore workspace facade -> persistWorkspaceDiff/domain services -> HybridAdapter -> LocalAdapter + mutation outbox -> SupabaseAdapter when configured`

Provider query syntax, storage keys, retries, and provider error strings remain below the UI boundary.

# LEGACY PATHS REMOVED

- Removed the monolithic `studiux:v1` production store as a source of truth.
- Removed unused direct-Supabase repository modules that competed with `SupabaseAdapter`.
- Removed seeded demo subjects and demo analytics from initial production state.
- The legacy blob is now read only by the explicit account-import boundary.

# TIMER INTEGRATION

Elapsed time remains timestamp-derived. ACTIVE and PAUSED records restore from the session repository. Completion writes a stable session ID/client request ID. Remote active-session discovery opens normalized conflict UI, with Resume here and Keep running there paths. Logout offers Finish session and log out or Cancel; no unverified keep-running claim is shown.

# OUTBOX / OFFLINE INTEGRATION

Hybrid writes update local entities first and enqueue per-user mutation records only when a remote adapter exists. Outboxes are user-namespaced. Online events trigger retry; transient/permanent states remain handled by the Release 2B subsystem. Local-only mode says `Saved locally`, never `Synced`.

# IMPORT INTEGRATION

Authenticated hybrid mode detects importable Release 1 device data, shows real counts, preserves source data, and uses the resumable/idempotent Release 2B import service. Skip/import decisions are stored per user.

# SYNC UX

One shell-level status communicates Saved locally, Syncing, Offline, or Sync issue. A permanent issue is retryable from that control. No per-card badge noise was added.

# MOCK REMOTE VERIFICATION

44 tests pass. Added repository hydration, entity-diff writes, cached reads, per-user cache isolation, reconciliation ordering, pending-local protection, offline completion, exactly-once retry behavior, and active/completed session separation. Existing import, conflict, adapter, auth, analytics, timezone/reset, and outbox tests remain passing.

# LOCAL BROWSER QA

Automated browser QA could not be completed in this workspace because the browser runtime cannot access the local Vite server (`ERR_BLOCKED_BY_CLIENT`). The production bundle was rendered/compiled by Vite, but this is not claimed as browser QA or authenticated Supabase QA.

# SECURITY RECHECK

- UI/feature direct Supabase calls: zero.
- UI/feature domain `localStorage` writes: zero.
- Per-user entity and outbox namespaces prevent client-cache crossover.
- Owner IDs are assigned in the service boundary, not entered by forms.
- Provider errors are normalized before UI conflict handling.
- No service-role key or secret was found.
- SQL/RLS was not deployed or live-verified.

# TESTS

Before: 36 tests. After: 44 tests across 9 files. All 44 pass.

# QUALITY GATES

- ESLint: pass, zero errors.
- Vitest: 9 files, 44 tests passed.
- Production build: pass. JS 446.11 kB (128.09 kB gzip); CSS 14.60 kB (3.77 kB gzip).
- Typecheck: no dedicated project typecheck script/TypeScript configuration exists; not claimed.

# REMAINING TECHNICAL DEBT

- `App.jsx` remains a large single-file UI module. It now uses the canonical data boundary, but should be split by feature in a later non-integration refactor.
- The sidebar Settings button is decorative; settings are accessible through the existing More route.
- Component-level browser tests require a browser-capable runner.
- Domain persistence direct-storage debt: zero. Remaining `localStorage` references are justified adapter, outbox, legacy-import, and injectable infrastructure defaults.

# BLOCKED LIVE VERIFICATION

Migration deployment, live RLS, real email/auth, production cloud sync, cross-device timer behavior, authenticated browser QA, and account-deletion authorization remain blocked until a real Supabase project and credentials are available.

# SUPABASE CONNECTION CHECKLIST

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; never expose the service-role key.
2. Inspect remote migration history and deploy `supabase/migrations` in order.
3. Configure auth providers, email behavior, allowed origins, and redirect URLs.
4. Create User A and User B; run the complete RLS isolation matrix and RPC authorization checks.
5. Import local data against the real backend and verify resumability/deduplication.
6. Test Device A/Device B active-session conflict and resume.
7. Test offline completion, reconnect, exactly-once upload, logout/login persistence, and account deletion.
8. Run authenticated desktop/mobile browser QA and inspect provider/network errors.
