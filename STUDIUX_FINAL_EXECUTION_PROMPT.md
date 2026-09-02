# STUDIUX — FINAL MASTER COMPLETION PASS

## COMPLETE THE PRODUCT • FINISH ALL REMAINING FEATURES • LIVE VERIFY • ZERO-VIBECODED UI • PRODUCTION HARDEN

You are executing the FINAL major completion pass for Studiux.

This is not a prototype pass.
This is not another architecture pass.
This is not another partial feature batch.
This is not permission to redesign working foundations from scratch.

Your job is to take the CURRENT repository exactly as it exists after Release 3 and push it as close as technically possible to a complete, coherent, production-quality STUDY OPERATING SYSTEM.

Do not merely produce recommendations.

IMPLEMENT.

Do not create fake shells.

Do not leave decorative controls.

Do not claim blocked verification as passed.

Do not optimize for finishing quickly.

Optimize for:

CORRECTNESS
SECURITY
DATA INTEGRITY
PRODUCT COHERENCE
VISUAL QUALITY
MOBILE QUALITY
PERFORMANCE
ACCESSIBILITY
RELIABILITY

# ================================================== AUTHORITATIVE HANDOFF — READ FIRST

Treat this prompt as the single authoritative execution brief. Do not ask the user to restate earlier Release 2B, 2C, 2D, or Release 3 requirements.

Authoritative project references:

- GitHub repository: https://github.com/parthgoyal379-oss/Studiux.git
- Supabase project ref: `ybnopzaobfrnguwizbuy`
- Supabase region: Mumbai
- Previously reported local security commit: `69bb80f Harden Release 2D Supabase security`
- Current continuation artifact, when supplied with this prompt: `Studiux-release-3-local-completion.zip`
- Current local implementation report, when supplied: `docs/RELEASE3_REPORT.md`
- Pending forward migration: `supabase/migrations/202609020001_release3_query_indexes.sql`

The working Git repository, attached continuation ZIP, and live Supabase migration history may not be at exactly the same revision. Resolve this deliberately before feature work:

1. Clone or inspect the existing GitHub repository without rewriting history.
2. Inspect all branches, tags, commits, dirty changes, and migration files.
3. If the Release 3 continuation ZIP is available, unpack it into a temporary directory and compare it against GitHub; do not blindly overwrite either source.
4. Preserve the newest correct Release 2 security architecture and the newest correct Release 3 product work.
5. Reconcile changes into one clean working tree.
6. Never alter already-deployed migrations 001–005. Use forward migrations only.
7. Compare live migration history before applying migration 006 or any later migration.
8. Never force-push, reset away user work, or discard an unrecognized change.
9. If an old local commit is not present in the current clone, locate or reconstruct its verified changes from migration/report evidence instead of pretending it exists.
10. Keep the repository runnable and green after each completed phase.

Known live database state reported before this pass:

- Migrations 001–005 were deployed to the selected Supabase project.
- 24 public tables had RLS enabled.
- Migration 005 reduced security advisor warnings from 15 to 5.
- Anonymous `SECURITY DEFINER` exposure was reduced to 0.
- Unindexed foreign-key warnings were reduced to 0.
- Non-optimized `auth.uid()` RLS init-plan warnings were reduced to 0.
- Policies were scoped to `authenticated`.
- `citext` was moved to the `extensions` schema.
- The five remaining security notices concerned intentionally callable authenticated `SECURITY DEFINER` functions and still require function-by-function verification/documentation.
- Migration 006 was prepared locally but was NOT reported deployed.

These are historical reports, not permission to assume current live state. Re-query and verify the project before making new claims.

Last locally reported Release 3 gates:

- ESLint passed.
- Vitest passed: 55/55 tests across 11 files.
- Production build passed.
- Baseline bundle: 471.69 KB JavaScript / 133.50 KB gzip; 19.92 KB CSS / 4.76 KB gzip.
- Cloud browser access to the previous localhost preview was blocked, so authenticated/local browser QA was NOT verified in that run.

Do not downgrade these gates. Preserve all existing passing tests and add meaningful behavior coverage.

# ================================================== PRODUCT IDENTITY — NON-NEGOTIABLE

Studiux is an independent study operating system in the same broad category as YPT. It must not copy YPT trademarks, proprietary assets, copywriting, icons, layouts, or branding.

Product priority remains:

1. Study
2. Plan
3. Understand performance
4. Improve
5. Accountability/community
6. Competition

Reward consistency, completed goals, focused sessions, questions solved, syllabus progress, revision completion, accuracy improvement, and sustainable routines. Never imply that raw logged hours alone equal productivity.

Do not build engagement bait, follower farming, endless feeds, distracting direct messages, manipulative streak-loss warnings, loot boxes, or fake urgency. Competition must motivate without dominating the product.

Starting Focus must remain possible in a few seconds. Desktop is first-class, mobile is purpose-built, every important interaction is keyboard-accessible, reduced-motion is respected, and all user-controlled inputs are validated.

# ================================================== 0. CURRENT STATE — PRESERVE THIS

Current reported state:

Release 2 foundation:

- repository-backed architecture
- HybridAdapter
- LocalAdapter
- SupabaseAdapter
- persistent outbox
- local-first persistence
- per-user cache isolation
- account import
- auth architecture
- profiles/preferences
- timestamp-based timer
- active-session conflict architecture
- idempotent synchronization
- deterministic analytics
- strict RLS architecture
- migrations 001–005
- migration 005 deployed live previously
- security hardening completed
- anonymous SECURITY DEFINER exposure removed

Release 3 currently includes:

- Home dashboard
- Today command center
- Focus modes
- session intention
- task linking
- pause/resume/finish
- timer recovery
- task management
- Planner day blocks
- planned duration
- Subjects
- chapter hierarchy/status
- Revision queue/history
- Exams/countdown
- Mock score logging
- Progress analytics
- 7/30/90-day views
- trends
- subject balance
- Settings
- timezone/reset/target/theme
- CSV/JSON export
- Ctrl/Cmd+K
- hash navigation/deep links
- responsive foundations
- reduced-motion support
- expanded Supabase mappings
- Release 3 migration 006 prepared locally
- deterministic allocation/readiness/revision/mistake logic
- 55/55 tests passing
- ESLint passing
- production build passing

Known unfinished work:

- complete mock analysis
- mistake book
- richer revision scheduling UX
- group membership UX
- group presence
- verified leaderboards
- challenges
- notification center
- AI coach
- intelligent daily planning
- plan rebalancing
- stronger route-level splitting
- browser-extension architecture where useful
- migration 006 deployment/verification
- remaining Release 2D live verification
- authenticated desktop/mobile QA
- final visual refinement

Do NOT rewrite completed foundations merely for architectural preference.

\==================================================

1. FIRST ACTION — FULL REPOSITORY AUDIT
   \==================================================

Before editing, inspect the entire repository.

Create an internal completion matrix for every meaningful feature:

COMPLETE
PARTIAL
FOUNDATION ONLY
MISSING
BROKEN
DECORATIVE
DUPLICATED
NEEDS POLISH

Inspect:

routes
App.jsx
features
components
styles
design tokens
domain
services
repositories
adapters
migrations
RLS
RPCs
analytics
tests
PWA
offline
sync
auth
responsive behavior

Search specifically for:

TODO
FIXME
placeholder
coming soon
disabled decorative controls
mock data
demo data
Math.random
fake statistics
unused feature flags
duplicate persistence
direct Supabase usage
direct domain localStorage usage

Do not assume the previous report is perfectly complete.

Verify code.

# ================================================== 2. FINAL PRODUCT STANDARD

Studiux must become one coherent system connecting:

GOALS
→ EXAMS
→ SYLLABUS
→ PLANNER
→ TODAY
→ TASKS
→ FOCUS
→ QUESTIONS
→ REVISION
→ MOCKS
→ MISTAKES
→ ANALYTICS
→ ACCOUNTABILITY
→ AI RECOMMENDATIONS

The product must answer:

What should I study now?

What am I behind on?

Which chapter is weak?

What needs revision?

How prepared am I?

Where did my study time go?

Did I execute what I planned?

Which mistakes keep costing marks?

How should tomorrow change?

The answer cannot be a collection of disconnected dashboards.

# ================================================== 3. NO FAKE COMPLETION

A navigation item does not count as a feature.

A card does not count as a feature.

A form that does not persist does not count.

A chart backed by dummy data does not count.

An AI button without grounded context does not count.

Every visible feature must:

WORK

or

NOT BE SHOWN.

# ================================================== 4. FINISH TODAY

Make Today the primary daily execution surface.

It should clearly show:

TODAY'S TARGET
STUDIED
PLANNED
COMPLETED
REMAINING

Sections:

NOW
NEXT
LATER
REVISION DUE
DONE

Integrate:

tasks
planned blocks
revision
exam pressure
priority

Allow:

quick task completion
reordering where supported
Start Focus
carry-forward
quick rescheduling

Today must answer "what do I do next?" immediately.

# ================================================== 5. FINISH TASKS

Complete task workflows.

Support where schema permits:

title
notes
subject
chapter/topic
priority
due date
planned date
estimated duration
actual derived duration
status
subtasks
recurrence

Statuses should remain understandable.

Possible:

BACKLOG
PLANNED
IN\_PROGRESS
DONE
ARCHIVED

Do not expose complexity unnecessarily.

Quick-add must remain fast.

# ================================================== 6. SUBTASKS

Finish proper subtasks if not already complete.

Parent progress must derive consistently.

Support:

create
complete
reopen
reorder where practical

Do not corrupt parent task history.

# ================================================== 7. RECURRING TASKS

Complete recurrence using existing validation architecture.

Support practical recurrence:

daily
selected weekdays
weekly
custom interval

Avoid infinite future-row creation.

Prevent duplicates across:

reload
offline
reconnect
retry

Respect timezone and custom study-day reset.

# ================================================== 8. PLANNER — COMPLETE IT

Planner must become genuinely useful.

Views:

DAY
WEEK
MONTH

Prioritize DAY/WEEK quality.

Show:

tasks
revision
exam milestones
planned study blocks
planned duration
completion

Support:

schedule
reschedule
carry forward
reorder
Start Focus

Do not recreate a generic calendar app.

This is a study planner.

# ================================================== 9. RAPID DAILY PLANNING

Implement a compact planning workflow.

Flow:

Review yesterday
→ overdue work
→ revision due
→ upcoming exams
→ choose priorities
→ estimate workload
→ confirm day

A student should be able to create today's plan quickly.

# ================================================== 10. SYLLABUS — COMPLETE

Preserve flexible hierarchy:

SUBJECT
→ UNIT
→ CHAPTER
→ TOPIC

Do not force every level.

Chapter statuses:

NOT\_STARTED
LEARNING
PRACTICING
REVISING
STRONG

Track/derive:

completion
time invested
questions
accuracy
last studied
last revised
next revision
mock performance
weakness

# ================================================== 11. CHAPTER INTELLIGENCE

Finish a useful chapter detail experience.

Show:

status
time
sessions
tasks
questions
accuracy
revision history
mistakes
mock performance
recent activity
next action

Use existing records.

Do not duplicate data.

# ================================================== 12. QUESTION PRACTICE

Complete lightweight practice tracking.

Record aggregate:

attempted
correct
incorrect
skipped if supported

Derive:

accuracy
questions/hour
trend

Allow logging after Focus and from relevant chapter/mock workflows.

Do not force individual-question entry.

# ================================================== 13. REVISION ENGINE — COMPLETE

Turn current revision foundation into a complete user workflow.

Provide transparent spaced scheduling.

Support defaults similar conceptually to:

1 day
3 days
7 days
14 days
30 days

Allow customization.

Do not claim scientifically exact forgetting prediction.

# ================================================== 14. REVISION UX

Dedicated Revision page:

OVERDUE
TODAY
UPCOMING
RECENTLY COMPLETED

Show:

chapter
subject
revision number
last reviewed
due date
estimated effort
confidence

Actions:

Start Revision
Mark Reviewed
Reschedule

Start Revision must launch Focus with correct context.

# ================================================== 15. REVISION FEEDBACK

After revision optionally capture:

WEAK
OKAY
STRONG

Use conservatively to influence future scheduling/recommendations.

Keep logic explainable.

# ================================================== 16. EXAMS

Finish exam management.

Support:

name
date
type
subjects
target optional
notes

Show:

days remaining
syllabus coverage
revision coverage
recent allocation
mock performance

# ================================================== 17. EXAM READINESS

Readiness must be transparent and deterministic.

Potential signals:

syllabus coverage
revision completion
question practice
mock performance
weak chapters
consistency

Explain why score changes.

Do not use arbitrary AI-generated readiness percentages.

# ================================================== 18. MOCK TESTS — FULL IMPLEMENTATION

This is a major priority.

Complete mock creation:

name
exam
date
duration
maximum marks
score
percentage
rank/percentile optional

Subject breakdown:

attempted
correct
incorrect
unattempted
marks
accuracy

# ================================================== 19. MOCK ANALYSIS

Build serious analysis.

Mistake types:

CONCEPTUAL
CALCULATION
CARELESS
TIME\_PRESSURE
MISREAD
GUESS
MEMORY
OTHER

Track:

marks lost
subject
chapter
mistake category

Show:

score trend
accuracy
subject breakdown
marks lost by category
weak chapters
repeated mistakes
performance trend

Every chart must answer a real question.

# ================================================== 20. MISTAKE BOOK — FULL IMPLEMENTATION

Create central Mistake Book.

Entries from:

mock
practice
manual entry

Fields:

subject
chapter
topic
mistake type
short description
lesson/fix
date
reviewed/resolved

Do not require copyrighted question text.

Surface repeated patterns.

Example:

"Calculation errors caused 18 lost marks across your last 3 mocks."

Only show claims supported by real records.

# ================================================== 21. FOCUS — FINAL FLAGSHIP POLISH

Focus must become one of the best-designed areas of Studiux.

Modes:

STOPWATCH
COUNTDOWN
POMODORO
DEEP WORK

Pre-session:

subject
chapter optional
task optional
intention optional

Active session:

large legible timer
minimal context
pause
finish

Reduce distractions dramatically during active Focus.

Preserve timestamp authority.

# ================================================== 22. SESSION COMPLETION

Create polished completion workflow.

Show:

duration
subject
task
intention
questions optional
short note optional

Update all dependent systems:

task actual time
chapter time
Today
Analytics
Revision
Question practice
daily target

No casino-like celebration.

# ================================================== 23. MANUAL STUDY LOGGING

Finish manual study entry.

Support:

date/time
duration
subject
chapter/task optional
note

Clearly distinguish:

TIMER RECORDED

vs

MANUAL

Personal analytics may use both according to explicit rules.

Competitive ranking must preserve provenance.

# ================================================== 24. ANALYTICS — FINAL

Analytics should answer questions, not display random charts.

Sections should explain:

TIME
CONSISTENCY
EXECUTION
SUBJECT BALANCE
SYLLABUS
REVISION
MOCK PERFORMANCE

Support:

7 days
30 days
90 days
custom range if practical

# ================================================== 25. PLAN VS ACTUAL

Finish this as a flagship metric.

Compare:

planned minutes
actual minutes
planned tasks
completed tasks

Derive:

execution rate
estimation accuracy
carry-forward

Generate grounded deterministic insights.

# ================================================== 26. SUBJECT BALANCE

Compare allocation against:

targets
weakness
exam proximity

Example:

"Chemistry received 14% of your study time while 31% of your weak chapters are Chemistry."

Only when data supports it.

# ================================================== 27. CONSISTENCY

Implement/refine activity heatmap.

Show:

study days
target-hit days
consistency
streak if useful

Do not overemphasize streaks.

# ================================================== 28. FOCUS SCORE

Keep it transparent.

Potential components:

target adherence
session completion
consistency
planned-vs-actual
abandon behavior if reliable

Explain components.

No black-box AI score.

# ================================================== 29. DETERMINISTIC INSIGHT ENGINE

Before AI, generate useful deterministic insights.

Examples:

study allocation change
session-duration trend
overdue revision
weak chapter
plan-vs-actual
mock mistake patterns

Only produce insight when enough data exists.

# ================================================== 30. GROUPS — COMPLETE USER WORKFLOW

Use existing secure group foundation.

Implement:

create
join by code
leave
member list
roles
privacy

Roles:

OWNER
ADMIN
MEMBER

Authorization remains database-enforced.

# ================================================== 31. GROUP HOME

Show:

members
active/studying status where permitted
today activity
weekly activity
leaderboard
active challenge

No infinite social feed.

# ================================================== 32. PRESENCE

Where backend supports it safely:

STUDYING
PAUSED
OFFLINE

Respect privacy.

Graceful fallback when realtime unavailable.

# ================================================== 33. VERIFIED LEADERBOARDS

Finish group/friend leaderboards.

Windows:

TODAY
WEEK
MONTH

Prioritize:

TIMER-RECORDED verified time.

Manual time must remain distinguishable.

Never trust client-submitted aggregate totals.

# ================================================== 34. CHALLENGES

Implement:

personal
group

Examples:

10 focused hours
5 study days
3 revision sessions
4 target-hit days

Progress must derive from real database records.

# ================================================== 35. ACCOUNTABILITY

If current architecture supports it safely, add lightweight accountability partner behavior.

Possible shared signals:

studied today
target progress
currently studying
weekly consistency

Require privacy controls.

Do not build surveillance.

# ================================================== 36. NOTIFICATION CENTER

Finish internal notifications.

Useful events:

revision due
exam approaching
group invite
challenge result
sync issue

No spam.

Do not block this release on external push notification infrastructure.

# ================================================== 37. SEARCH

Finish global search across:

tasks
subjects
chapters
mocks
mistakes

Group results.

Make navigation fast.

# ================================================== 38. COMMAND PALETTE

Finish Ctrl/Cmd+K.

Support:

Start Focus
Create Task
Today
Planner
Revision
Add Mock
Search Chapter
Analytics
Settings
Theme

Keyboard behavior must be polished.

# ================================================== 39. SETTINGS — COMPLETE

Fix all remaining Settings UX.

Sections as appropriate:

ACCOUNT
PROFILE
STUDY
FOCUS
APPEARANCE
PRIVACY
DATA
NOTIFICATIONS
ADVANCED

Expose:

timezone
reset time
daily target
theme
privacy
export
account deletion

No decorative Settings buttons.

# ================================================== 40. PRIVACY

Add meaningful social privacy controls.

Examples:

profile visibility
study-status visibility
leaderboard participation
group visibility

Default conservatively.

# ================================================== 41. DATA EXPORT

Preserve and polish:

CSV sessions
complete JSON export

Never export auth secrets.

# ================================================== 42. AI IMPLEMENTATION — NOW ONLY AFTER CORE WORK

Only begin AI after deterministic systems above are functional.

AI must be an intelligence layer over real structured data.

Not a generic chatbot pasted into Studiux.

# ================================================== 43. AI COACH

Build useful AI coach.

Ground context in:

exams
syllabus
tasks
study history
revision
mock results
mistakes
targets

Questions should include:

What should I study today?
What am I neglecting?
What should I revise?
Why was this week weak?
How should I rebalance tomorrow?

AI claims must be grounded.

# ================================================== 44. AI DAILY PLAN

Implement optional intelligent plan generation.

Inputs:

available time
due tasks
revision
weak chapters
exam proximity
recent allocation
priorities

Output:

structured proposed schedule.

USER MUST ACCEPT before persistent plan changes.

# ================================================== 45. AI REBALANCING

When work slips:

offer revised realistic plan.

Do not simply move everything to tomorrow.

Account for:

available time
priority
exam proximity
revision
existing workload

# ================================================== 46. AI SAFETY / RELIABILITY

AI must:

authenticate caller
derive user identity server-side
validate payload
rate limit
use structured output
validate output schema
timeout safely
fail independently

Never expose provider key.

Never send unnecessary entire database history.

# ================================================== 47. AI COST CONTROL

Compute deterministic metrics outside model.

Send compact structured summaries.

Avoid duplicate calls.

Cache when appropriate.

Core Studiux must work without AI.

# ================================================== 48. FINAL DESIGN DIRECTION

Now perform a comprehensive visual refinement.

Goal:

PREMIUM
INTENTIONAL
CALM
FAST
COHESIVE
HIGH-TRUST
DISTINCTIVE

NOT:

generic SaaS
AI template
vibecoded dashboard
component-library demo
glassmorphism showcase
gradient soup
card soup

# ================================================== 49. ZERO-VIBECODED AUDIT

Aggressively inspect and remove:

random gradients
purple-blue AI aesthetic
huge rounded cards everywhere
excessive shadows
excessive borders
nested cards
emoji headings
meaningless badges
meaningless metrics
fake charts
oversized headings
huge empty spaces
random font sizes
inconsistent spacing
inconsistent button heights
random icons
decorative controls
"AI-powered" marketing copy
generic startup copy

Every design decision must have purpose.

# ================================================== 50. DESIGN SYSTEM FINALIZATION

Create/refine coherent tokens for:

background
surface
surface elevated
border
text
muted text
accent
semantic states
subject colors
chart colors

Also:

spacing
radius
shadow
type scale
line height
control height
icons
motion
breakpoints
layers

Reduce arbitrary CSS values.

# ================================================== 51. CARD REDUCTION

Audit every card.

Replace unnecessary cards with:

sections
rows
dividers
tables
lists
inline metrics

Use cards only when container hierarchy adds value.

# ================================================== 52. TYPOGRAPHY

Make typography excellent.

Consistent:

page titles
section headings
labels
metrics
body
metadata
table content
timer numerals

Use tabular numbers where appropriate.

Avoid giant marketing typography inside app.

# ================================================== 53. LIGHT MODE

Design intentionally.

Ensure:

clear hierarchy
comfortable contrast
subtle surfaces
good chart readability

Do not make everything white-on-white.

# ================================================== 54. DARK MODE

Design intentionally.

Do not merely invert light mode.

Avoid:

pure black everywhere
glowing neon
excessive saturated borders

Maintain hierarchy.

# ================================================== 55. HOME FINAL POLISH

Within 3 seconds Home must answer:

How am I doing?
What matters next?
What should I do now?

One dominant CTA:

START FOCUS

Do not show ten equally weighted cards.

# ================================================== 56. TODAY FINAL POLISH

Today should feel like execution software.

Dense enough to be useful.

Simple enough to understand immediately.

Excellent desktop and mobile behavior.

# ================================================== 57. FOCUS FINAL POLISH

Active Focus should visually simplify the application.

Timer becomes dominant.

Remove unnecessary navigation distractions where appropriate.

Controls must be obvious but restrained.

# ================================================== 58. ANALYTICS FINAL POLISH

No chart for chart's sake.

Every visualization needs:

clear question
readable scale
tooltip where useful
empty state
responsive layout

Avoid 3D.
Avoid cluttered pies.
Avoid excessive gauges.

# ================================================== 59. PLANNER FINAL POLISH

Planner must not look like a generic calendar clone.

Optimize for:

study blocks
tasks
revision
exam preparation

Make drag/reorder interactions obvious if implemented.

# ================================================== 60. MOCK ANALYSIS FINAL POLISH

This should look serious and analytical.

Prioritize:

score
accuracy
marks lost
mistake patterns
weak chapters
next action

Not colorful decoration.

# ================================================== 61. GROUP UI FINAL POLISH

Keep social surfaces disciplined.

Study first.

No engagement bait.

No giant feed.

# ================================================== 62. MICROCOPY AUDIT

Rewrite weak copy.

Remove:

"Optimize your journey"
"Unlock your potential"
"Leverage AI"
"Supercharge productivity"

Prefer concrete information.

Example:

"3 revisions overdue."

"Physics accuracy fell 8% across your last two mocks."

# ================================================== 63. ICON SYSTEM

Use one coherent icon family.

No random emoji in core navigation.

No mixed icon styles.

# ================================================== 64. MOTION

Use restrained motion for:

dialogs
navigation
completion
timer
command palette
sync
reordering

No decorative perpetual motion.

Respect reduced-motion.

# ================================================== 65. DESKTOP RESPONSIVE PASS

Test:

1920
1440
1280
1024

Use width intentionally.

Avoid:

ultra-wide stretched cards
tiny central content
giant empty gutters
awkward tables

# ================================================== 66. TABLET PASS

Test:

820
768

Do not simply produce broken half-desktop layout.

# ================================================== 67. MOBILE PASS

Test:

430
390
375
360

Mobile must be first-class.

Check:

navigation
Today
task creation
Focus
Planner
Revision
Mocks
Groups
Analytics
Settings
dialogs
forms
keyboard
sheets

ZERO horizontal overflow.

# ================================================== 68. MOBILE NAVIGATION

Do not cram every feature into bottom navigation.

Prioritize frequent actions.

Use More/search/command patterns for secondary destinations.

# ================================================== 69. MOBILE FORMS

Keyboard opening must not hide important actions.

Dialogs should become sheets where appropriate.

Touch targets must be comfortable.

# ================================================== 70. ACCESSIBILITY

Audit:

keyboard
focus-visible
labels
contrast
semantic structure
dialogs
ARIA
screen-reader names
reduced motion
touch targets

Visual refinement must not regress accessibility.

# ================================================== 71. ROUTING

Preserve/fix deep links.

Browser back/forward should work.

Major areas should have stable navigation state.

If hash routing is currently deliberate, do not rewrite router architecture merely for preference.

# ================================================== 72. ROUTE-LEVEL CODE SPLITTING

Current Release 3 bundle was approximately:

471.69 KB JS
133.50 KB gzip

Implement meaningful splitting.

Candidates:

Analytics
Mocks
Groups
AI
large Planner sections

Do not over-split tiny modules.

Measure final result.

# ================================================== 73. PERFORMANCE

Audit:

duplicate renders
duplicate repository reads
waterfalls
large dependencies
multiple sync workers
duplicate listeners
expensive analytics recalculation
oversized initial JS

Fix real issues.

# ================================================== 74. APP.JSX

If App.jsx remains a meaningful maintenance bottleneck, decompose it carefully.

Do not perform another architecture rewrite.

Extract coherent features/components while preserving behavior.

# ================================================== 75. OFFLINE

Preserve local-first architecture.

Document each feature:

FULL OFFLINE
PARTIAL
ONLINE REQUIRED

Focus/tasks/planning should remain resilient.

AI/social realtime may require network.

# ================================================== 76. SYNC

Keep global sync state subtle and truthful.

Saved locally
Syncing
Offline
Sync issue
Synced where real remote acknowledgement exists

No fake cloud status.

# ================================================== 77. SECURITY — DO NOT REGRESS RELEASE 2

Every new user-owned table:

RLS.

Every group table:

membership/role authorization.

Every SECURITY DEFINER:

safe search\_path
auth check
minimal grants

Never trust client user\_id.

Never expose service-role key.

# ================================================== 78. SECURITY ADVISOR

Review the 5 remaining intentional authenticated SECURITY DEFINER notices.

For each:

identify function
reason it exists
auth boundary
grant boundary
search\_path status
whether it is safe

If safe:

document as intentional.

If not:

fix with forward migration.

Do not chase zero warnings by weakening functionality or creating unsafe workarounds.

# ================================================== 79. MIGRATION 006

Inspect:

202609020001\_release3\_query\_indexes.sql

If real Supabase project is accessible:

compare remote migration history first.

Deploy safely.

Verify actual indexes remotely.

Do not claim deployed based only on local file.

If inaccessible:

leave BLOCKED.

# ================================================== 80. NEW RELEASE 3 MIGRATIONS

If missing feature schema requires changes:

create forward migrations AFTER 006.

Do not modify deployed 001–005.

Do not create duplicate tables without inspecting existing schema.

# ================================================== 81. INDEXING

Index actual query patterns only.

Review:

user/date
status
due date
revision due
chapter
mock date
group membership

Avoid index spam.

# ================================================== 82. RELEASE 2D LIVE VERIFICATION — MUST ATTEMPT

If real Supabase access and QA credentials are available, finish remaining verification NOW.

Do not defer automatically.

# ================================================== 83. TWO-USER AUTH + RLS

Create/use isolated User A and User B.

Test real signup/login.

A creates private records.

B attempts:

SELECT
INSERT ownership spoof
UPDATE
DELETE

against A's:

profile/preferences
subjects
tasks
sessions
other private entities

Any leakage is release-blocking.

# ================================================== 84. RPC AUTHORIZATION

Test actual deployed RPCs.

Especially:

group join
leaderboard
account deletion
privileged helpers

Attack arbitrary user ID / privilege escalation.

# ================================================== 85. CROSS-DEVICE TIMER

Same User A.

Independent browser contexts.

Device A starts session.

Device B must detect active session.

Test:

Keep running there
Resume here

Then near-simultaneous Start.

Only one ACTIVE session may survive.

# ================================================== 86. OFFLINE → RECONNECT

Real backend test.

Offline:

finish session
perform supported mutation

Reconnect.

Verify:

outbox
ack
no duplicate
remote persistence
correct sync status

# ================================================== 87. CACHE ISOLATION

A login
→ hydrate data
→ logout
→ B login

ZERO A private data may appear for B, even briefly.

# ================================================== 88. ACCOUNT DELETION

Using disposable QA account:

verify self-delete.

Verify another user cannot delete it.

Verify intended cleanup.

# ================================================== 89. BROWSER QA

If browser environment is available, run authenticated QA.

Do not stop at "page loaded."

Interact.

Inspect console/network.

# ================================================== 90. SCREENSHOT-BASED VISUAL QA

Capture screenshots for major routes.

Desktop:

Home
Today
Tasks
Planner
Focus setup
Focus active
Syllabus
Chapter
Revision
Exams
Mocks
Mock analysis
Mistake Book
Analytics
Groups
Settings
AI

Mobile equivalents.

VISUALLY INSPECT.

Do not trust DOM correctness alone.

# ================================================== 91. VISUAL ITERATION

For each screenshot ask:

Is hierarchy obvious?
Is spacing intentional?
Too many cards?
Too many borders?
Too much empty space?
Poor density?
Weak typography?
Bad alignment?
Generic template appearance?
Mobile clipping?
Ugly controls?
Bad chart sizing?
Inconsistent radii?

Fix and recapture important screens.

# ================================================== 92. FUNCTIONAL E2E

Test realistic flow:

signup/login
→ onboarding
→ subject
→ chapter
→ task
→ planner
→ Focus
→ completion
→ question log
→ revision
→ exam
→ mock
→ mistake
→ analytics
→ group
→ challenge
→ AI plan
→ settings/export

Where live infrastructure unavailable, distinguish local/mock verification.

# ================================================== 93. DEVELOPMENT FIXTURES

If populated state is required for visual QA:

use explicit development-only fixtures.

Never activate in production.

Never mix fake data into real user accounts.

# ================================================== 94. ERROR STATES

Test:

offline
permission denied
validation
not found
sync conflict
active timer conflict
AI unavailable
empty analytics
failed group operation

No raw provider errors.

# ================================================== 95. LOADING STATES

Cached local data should render immediately where safe.

Avoid unnecessary full-screen skeletons.

Prevent layout shift.

# ================================================== 96. EMPTY STATES

Every empty state should explain:

what
why
next action

No dead screens.

# ================================================== 97. FORMS

Standardize:

labels
validation
errors
disabled
loading
help
keyboard

Do not use placeholder-only labeling.

# ================================================== 98. DIALOGS

Verify:

focus trap
Escape
background scroll
mobile behavior
destructive confirmation

# ================================================== 99. DATA INTEGRITY

Verify:

no negative durations
no duplicate logical sessions
historical associations survive archive
revision records remain coherent
mock calculations deterministic
challenge totals derived
leaderboards derived

# ================================================== 100. NO RANDOM PERSONALIZED DATA

Search entire production tree.

No:

Math.random personalized stats
hardcoded fake analytics
fake leaderboard users
fake AI insights
fake mock performance

# ================================================== 101. TESTS

Preserve all existing 55 tests.

Add high-value tests for completed features.

At minimum cover:

recurrence
planner calculations
revision scheduling
readiness
mock calculations
mistake aggregation
plan-vs-actual
challenge progress
leaderboard derivation
privacy rules
AI context
AI output validation
new adapters/mappings
migration-related domain assumptions

Do not chase arbitrary test count.

# ================================================== 102. SECURITY REGRESSION TESTS

Add regression coverage for every meaningful security bug fixed.

Do not weaken tests to get green.

# ================================================== 103. E2E TESTS

Add/extend browser E2E where practical.

Separate:

LOCAL E2E

from

LIVE SUPABASE E2E.

Credentials remain environment-only.

# ================================================== 104. FINAL STATIC SECURITY AUDIT

Search for:

service-role
secrets
direct Supabase UI calls
arbitrary user\_id
unsafe HTML
broad RLS
SECURITY DEFINER
unprotected RPC
cross-user cache
unsafe delete
raw provider error exposure

Fix real issues.

# ================================================== 105. FINAL PERFORMANCE AUDIT

Measure:

initial JS
lazy chunks
CSS
major dependency weight

Compare to Release 3 baseline:

471.69 KB JS
133.50 KB gzip
19.92 KB CSS
4.76 KB gzip

Report improvements/regressions.

# ================================================== 106. FINAL DEAD-CODE PASS

Remove verified obsolete:

components
styles
helpers
mock fixtures
unused imports
duplicate modules
abandoned feature code

Do not delete dynamically used code without evidence.

# ================================================== 107. FINAL UI PASS — NO FEATURE WORK

Once features are complete, perform a dedicated visual-only pass.

No new functionality during this phase.

Review every route as one product.

Normalize:

spacing
typography
radius
borders
buttons
forms
headers
tables
charts
dialogs
empty states
mobile sheets

# ================================================== 108. PREMIUM INTERACTION PASS

Inspect every common control state:

default
hover
pressed
selected
focus
disabled
loading
error
success
offline
syncing

This matters as much as screenshots.

# ================================================== 109. PRODUCT COPY PASS

Remove robotic/generic copy.

Use concise language.

No fake motivation.

No unnecessary exclamation marks.

No startup marketing inside productivity workflows.

# ================================================== 110. FINAL REALISTIC USER SIMULATION

Simulate a student over time.

DAY 1:

onboard
add subjects
plan
focus
finish tasks

DAY 3:

revision due
complete revision
log questions

WEEK 2:

take mock
analyze mistakes
review analytics
rebalance plan

SOCIAL:

join group
leaderboard
challenge

AI:

ask what to study
generate proposed plan
accept/reject

Look for disconnected workflows.

Fix them.

# ================================================== 111. AUTONOMY

Do not stop for minor implementation decisions.

Use repository evidence and make reasonable decisions.

Ask only when:

credentials are required and unavailable
a destructive remote action is ambiguous
real user data could be endangered
requirements are genuinely contradictory

Otherwise continue.

# ================================================== 112. DO NOT STOP JUST BECAUSE SCOPE IS LARGE

This is intentionally a large master specification.

Do NOT respond merely:

"too large for one pass."

Execute sequentially.

If execution/context/time limits eventually stop the work:

leave repository green
complete the current phase cleanly
produce an exact checkpoint
state the NEXT unfinished numbered section

Do not reduce the specification.

Do not silently skip sections.

# ================================================== 113. EXECUTION ORDER

PHASE 1
Audit

PHASE 2
Today / Tasks / Planner

PHASE 3
Syllabus / Chapter / Questions

PHASE 4
Revision

PHASE 5
Exams / Mocks / Mistake Book

PHASE 6
Focus / Session workflow

PHASE 7
Analytics / Insights

PHASE 8
Groups / Presence / Leaderboards / Challenges

PHASE 9
Notifications / Search / Settings / Privacy

PHASE 10
AI Coach / Planning / Rebalancing

PHASE 11
Migration / Security / Live verification

PHASE 12
Performance / code splitting / accessibility

PHASE 13
Desktop + tablet + mobile browser QA

PHASE 14
Zero-vibecoded visual refinement

PHASE 15
Full tests / build / final report

Do not start AI while core academic workflows remain incomplete.

# ================================================== 114. QUALITY GATES DURING DEVELOPMENT

Run periodically:

lint
tests
build

Do not wait until the very end.

Keep main branch/worktree runnable.

# ================================================== 115. FINAL QUALITY GATES

At completion run:

ESLint
full tests
production build
typecheck if available
migration validation
security audit
browser E2E where available
live verification where credentials permit

Report exact results.

# ================================================== 116. GITHUB

Previous security commit:

69bb80f

may still be local-only because of prior GitHub write limits.

If write access is available:

inspect history
preserve commit
commit new work logically
push safely

Do not force push.

Do not rewrite history.

If blocked:

report exact local commit hashes that need pushing.

# ================================================== 117. PRODUCTION BLOCKERS

These are hard blockers:

cross-user data leakage
ownership spoofing
RLS bypass
privilege escalation
unauthorized destructive RPC
multiple ACTIVE sessions
lost sessions
duplicate sessions
broken auth isolation
cross-user cache flash
secret exposure
corrupt migration history
fake production analytics
critical mobile workflow failure

Do not recommend launch with these unresolved.

# ================================================== 118. NON-BLOCKERS

Potential documented non-blockers:

minor animation polish
small bundle optimization
external email deliverability configuration
browser extension not yet distributed
advanced realtime polish
optional AI unavailable because provider credentials missing

Do not confuse optional polish with security/correctness.

# ================================================== 119. DEFINITION OF COMPLETE

Studiux is complete when workflows connect.

Example:

Student creates exam.

Exam affects priorities.

Syllabus shows coverage.

Planner schedules weak chapters.

Today surfaces the correct work.

Focus records execution.

Questions update chapter performance.

Revision schedules follow-up.

Mock reveals mistakes.

Mistake Book surfaces patterns.

Analytics shows plan vs actual.

Group provides accountability.

AI consumes these signals and proposes a grounded plan.

Everything persists safely.

Offline work survives.

Mobile works.

Security boundaries hold.

The UI feels intentionally designed.

That is the target.

# ================================================== 120. FINAL VERDICT FORMAT

Return exactly structured sections:

# STUDIUX FINAL VERDICT

Use:

PRODUCTION READY
CONDITIONAL
NOT READY
BLOCKED

# EXECUTIVE SUMMARY

# COMPLETION MATRIX

For every major feature:
COMPLETE / PARTIAL / BLOCKED / NOT IMPLEMENTED

# TODAY

# TASKS

# PLANNER

# SYLLABUS

# CHAPTER INTELLIGENCE

# QUESTION PRACTICE

# REVISION

# EXAMS

# MOCK TESTS

# MISTAKE BOOK

# FOCUS

# MANUAL LOGGING

# ANALYTICS

# DETERMINISTIC INSIGHTS

# GROUPS

# PRESENCE

# LEADERBOARDS

# CHALLENGES

# NOTIFICATIONS

# SEARCH / COMMAND PALETTE

# SETTINGS / PRIVACY

# AI COACH

# AI PLANNER

# OFFLINE / SYNC

# DESIGN SYSTEM

# ZERO-VIBECODED UI AUDIT

# DESKTOP QA

# TABLET QA

# MOBILE QA

# ACCESSIBILITY

# PERFORMANCE

Include before/after bundle sizes.

# DATABASE MIGRATIONS

# MIGRATION 006

# SECURITY

# SECURITY ADVISOR NOTICES

# TWO-USER RLS

# RPC AUTHORIZATION

# CROSS-DEVICE TIMER

# OFFLINE LIVE TEST

# CACHE ISOLATION

# ACCOUNT DELETION

# TESTS

Exact before/after/pass/fail counts.

# ESLINT

# BUILD

# LIVE VS LOCAL VERIFICATION

Explicitly distinguish:

VERIFIED LIVE
VERIFIED LOCALLY
BLOCKED

# BUGS FOUND

# BUGS FIXED

# REMAINING TECHNICAL DEBT

# GITHUB STATUS

# PRODUCTION BLOCKERS

# LAUNCH READINESS

# FINAL RECOMMENDATION

# ================================================== 120A. REQUIRED SOURCE-CONTROL HANDOFF

At completion, leave one unambiguous canonical source tree.

If GitHub write access works:

- commit changes in logical, reviewable commits
- preserve existing history
- push normally to the intended non-protected branch
- do not force-push
- report branch, commit hashes, and push result

If GitHub write access is unavailable or rate-limited:

- do not use an unauthorized workaround
- keep the working tree clean after committing locally where possible
- report exact commit hashes awaiting push
- provide a final source ZIP that excludes secrets, dependency directories, build caches, browser traces containing tokens, and environment files with credentials

Always provide:

1. final source ZIP
2. final implementation report in Markdown
3. migration inventory and live/local status
4. exact environment-variable checklist without values
5. exact commands run and their results
6. exact test counts
7. exact bundle sizes
8. remaining blockers and the next executable step

The source ZIP must contain the code, migrations, tests, configuration examples, and documentation required to continue. It must not contain `node_modules`, `.git`, production secrets, private keys, access tokens, service-role keys, or real QA credentials.

# ================================================== 120B. CLAIM BOUNDARIES

Use the following language precisely:

- `VERIFIED LIVE` only when exercised against the actual Supabase project during this pass.
- `VERIFIED LOCALLY` only when directly tested in the local application/test environment.
- `VERIFIED WITH MOCK REMOTE` only for controlled adapter/integration simulations.
- `STATICALLY VERIFIED` only for code, SQL, configuration, or policy inspection without runtime proof.
- `BLOCKED` when credentials, provider access, email delivery, remote browser access, or another required external capability is missing.

Never equate mocked verification with live Supabase verification.

Never claim the following unless actually exercised during this pass:

- live signup/login/password reset/logout
- email delivery
- two-user adversarial RLS isolation
- deployed migration 006
- RPC authorization with real users
- cross-device timer conflict/race handling
- real offline-to-cloud synchronization
- authenticated desktop/mobile browser QA
- production AI provider behavior
- production push notification delivery

No visible product feature may imply cloud synchronization when only local persistence is active. Wording must truthfully distinguish `Saved locally`, `Syncing`, `Offline`, `Sync issue`, and acknowledged remote synchronization.

# ================================================== 120C. CHECKPOINT DISCIPLINE IF EXECUTION LIMITS INTERRUPT WORK

This prompt is intentionally large. Continue autonomously for as long as the environment permits, but do not leave half-migrations, broken routes, failing tests, or an unusable branch.

If the run must stop before total completion:

1. finish or safely revert only the currently incomplete atomic change without discarding unrelated user work
2. run the relevant lint/tests/build gates
3. leave the repository runnable
4. produce an exact completion matrix
5. state the last fully completed numbered section
6. state the next unfinished numbered section
7. list modified files and pending migrations
8. create a clean checkpoint commit when possible
9. create an updated source ZIP and checkpoint report
10. distinguish implemented behavior from planned behavior

Do not compress a multi-phase unfinished state into the word `done`.

# ================================================== 120D. FINAL SUPABASE CONNECTION AND VERIFICATION CHECKLIST

Before declaring production readiness, complete and report this matrix against project `ybnopzaobfrnguwizbuy` when access and disposable QA accounts are available:

1. inspect remote migration history and schema drift
2. validate migration 006 locally
3. deploy migration 006 safely if absent
4. verify its indexes by querying the live catalog
5. deploy any later forward migrations in order
6. rerun security and performance advisors
7. document each remaining authenticated `SECURITY DEFINER` warning
8. verify auth providers, redirect URLs, site URL, and email settings
9. create disposable User A and User B
10. execute the two-user ownership/RLS matrix for every private entity
11. test group role/RPC authorization and spoofed identifiers
12. test Device A/Device B active-session conflict and near-simultaneous starts
13. test offline completion, reconnect, outbox acknowledgement, and deduplication
14. test A logout followed by B login with zero cache flash/leakage
15. test self-account deletion and denial of cross-user deletion
16. run authenticated desktop, tablet, and mobile browser QA
17. inspect console and network failures without exposing tokens
18. rerun lint, tests, typecheck if available, and production build after all fixes

Treat any private-data leakage, ownership spoofing, unauthorized RPC, duplicate active timer, lost session, secret exposure, or corrupt migration history as release-blocking.

# ================================================== 121. FINAL INSTRUCTION

Do not respond with a plan and stop.

Start inspecting the repository immediately.

Implement the work sequentially.

Preserve the proven Release 2 architecture.

Complete unfinished Release 3 features.

Connect workflows instead of creating isolated pages.

Use real data.

Use deterministic logic where deterministic logic is sufficient.

Use AI only where AI adds genuine value.

Keep AI grounded.

Keep security server-enforced.

Keep offline/local-first behavior intact.

Use forward migrations.

Test continuously.

Visually inspect the product.

Fix mobile.

Fix accessibility.

Fix performance.

Remove generic/vibecoded design patterns.

Do not fabricate verification.

Do not leave nonfunctional UI.

Do not sacrifice data integrity for polish.

Do not sacrifice polish for feature count.

Do not stop after making the application merely functional.

Finish it to the standard of a serious production product.
