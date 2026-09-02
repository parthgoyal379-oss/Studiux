-- Release 3 forward migration: indexes match the new syllabus, revision and mock query paths.
-- No deployed migration is edited; every statement is safe to re-run.
create index if not exists chapters_owner_subject_position on public.chapters(owner_id, subject_id, position) where deleted_at is null and archived_at is null;
create index if not exists topics_owner_chapter_position on public.topics(owner_id, chapter_id, position) where deleted_at is null and archived_at is null;
create index if not exists revision_history_owner_item_date on public.revision_history(owner_id, revision_item_id, revised_at desc);
create index if not exists mock_sections_owner_test on public.mock_test_sections(owner_id, mock_test_id);
create index if not exists mock_mistakes_owner_test on public.mock_test_mistakes(owner_id, mock_test_id);
create index if not exists groups_owner_created on public.groups(owner_id, created_at desc);
create index if not exists notifications_owner_unread on public.notifications(owner_id, created_at desc) where read_at is null;
