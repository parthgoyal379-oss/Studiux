begin;

alter table public.study_sessions
  add column if not exists intention text,
  add column if not exists target_minutes integer check (target_minutes is null or target_minutes between 1 and 1440),
  add column if not exists timer_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(timer_metadata) = 'object');

alter table public.revision_items
  add column if not exists confidence text check (confidence is null or confidence in ('WEAK','OKAY','STRONG')),
  add column if not exists estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 1 and 480),
  add column if not exists last_revised_at timestamptz;

alter table public.mock_test_mistakes
  add column if not exists marks_lost numeric not null default 0 check (marks_lost >= 0),
  add column if not exists resolved_at timestamptz;

create index if not exists mock_mistakes_owner_type_created
  on public.mock_test_mistakes(owner_id, type, created_at desc);

commit;
