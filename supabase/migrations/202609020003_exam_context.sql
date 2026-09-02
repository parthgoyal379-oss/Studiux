alter table public.exams
  add column if not exists exam_type text,
  add column if not exists subject_ids uuid[] not null default '{}';

comment on column public.exams.subject_ids is 'User-selected subject scope for deterministic readiness calculations. Subject ownership is validated by application choices and exam-row RLS.';
