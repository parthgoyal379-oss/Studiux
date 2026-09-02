# Studiux Release 3 — final completion checkpoint

## Implemented locally

- Canonical Store → repository → local persistence/outbox boundary is used by the active Home, Today, Focus, Plan, Tasks, Progress, Syllabus, Revision, Exams, Mocks, Groups and Settings routes.
- Route-level lazy loading covers all major workflows plus notifications; duplicate monolithic route implementations were removed from `App.jsx`.
- Today prioritizes NOW/NEXT/LATER, revision due, DONE, target, planned, studied, remaining, carry-forward and task-linked Focus.
- Tasks support quick add, search, completion/reopen, detail editing, subject linkage, due date, estimate, recurrence, notes, subtasks, derived actual focus and archive semantics.
- Focus supports stopwatch, countdown, Pomodoro, deep work, timestamp-based elapsed time, pause/resume, tab-leave accounting, session review, question logging, manual logging and task/chapter context.
- Planner supports day/week/month ranges, navigation, planned vs actual/adherence, blocks, subject assignment, carry-forward and Focus launch.
- Syllabus supports subject/chapter/topic creation, chapter statuses and chapter intelligence from sessions, questions, tasks, revisions and mistakes.
- Revision supports due/upcoming/history, transparent interval feedback, rescheduling and context-aware Focus launch.
- Exams support type, date, target, notes, subject scope and deterministic readiness inputs.
- Mocks support score logging, section breakdown, mistake categories, marks lost, chapter tags and mistake book.
- Groups support local group/challenge records and cloud-gated secure join/member/verified leaderboard boundaries; no simulated cloud membership is shown.
- Settings support profile, username, timezone, custom reset, target, theme, timer defaults, Pomodoro settings, privacy, export and safe logout with active timer completion.
- Notifications are repository-backed and actionable; command palette searches tasks, subjects, chapters, mocks and mistakes.

## Database

Forward migrations only; migrations 001–005 were preserved. Live project `ybnopzaobfrnguwizbuy` has verified migration history through:

- `202609020001_release3_query_indexes`
- `202609020002_release3_completion_schema`
- `202609020003_exam_context`

The exam-context migration adds exam type/subject scope and was deployed and catalog-verified live. No deployed migration was edited.

## Verification boundaries

- **VERIFIED LOCALLY:** ESLint, Vitest, production build, domain calculations, outbox/import/timer/repository tests, local-first UI flows and cache namespace behavior covered by tests.
- **VERIFIED LIVE:** migration history, migrations 006/007/008 catalog changes, existing RLS/security schema facts and advisor output for project `ybnopzaobfrnguwizbuy`.
- **BLOCKED:** live signup/login/email delivery, two-user adversarial RLS/RPC matrix, Device A/Device B timer race, real offline→cloud reconnect, account deletion, and authenticated browser QA. Required QA credentials/environment variables are absent.
- Hosted browser local UI inspection was attempted but `127.0.0.1` was blocked by the browser client; no browser pass is represented as passed.

## Quality gates

- ESLint: passed
- Vitest: **64/64 passed** across 13 files (55 prior tests preserved; 9 additional tests)
- Vite production build: passed
- Final build: initial `index` 206.18 kB / 65.58 kB gzip and `store` 249.89 kB / 66.47 kB gzip, with feature chunks loaded on demand; CSS 29.88 kB / 6.42 kB gzip.

## Remaining release blockers

Five intentional authenticated `SECURITY DEFINER` advisor warnings remain: account deletion, group leaderboard, group admin/member helpers and secure group join. Performance notices are unused indexes on the empty database plus overlapping permissive group policies. Live auth/security/race verification remains required before a production-ready verdict.
