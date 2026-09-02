begin;

-- Keep extensions outside the exposed public schema.
create schema if not exists extensions;
alter extension citext set schema extensions;

-- Trigger-only functions are not client RPCs.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.add_group_owner() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Authenticated-only helpers and RPCs. Supabase's default function grants include
-- anon, so revoke it explicitly rather than relying on a PUBLIC revoke alone.
revoke execute on function public.is_group_member(uuid) from public, anon, authenticated;
revoke execute on function public.is_group_admin(uuid) from public, anon, authenticated;
revoke execute on function public.join_group_by_code(text) from public, anon, authenticated;
revoke execute on function public.group_leaderboard(uuid,timestamptz,timestamptz) from public, anon, authenticated;
revoke execute on function public.delete_my_account() from public, anon, authenticated;

grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_admin(uuid) to authenticated;
grant execute on function public.join_group_by_code(text) to authenticated;
grant execute on function public.group_leaderboard(uuid,timestamptz,timestamptz) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- Scope every application policy to signed-in users and make auth.uid() an
-- init-plan expression so it is evaluated once per statement, not once per row.
do $policy_hardening$
declare
  policy_record record;
  statement text;
begin
  for policy_record in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
  loop
    statement := format(
      'alter policy %I on %I.%I to authenticated',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );

    if policy_record.qual is not null then
      statement := statement || format(
        ' using (%s)',
        replace(policy_record.qual, 'auth.uid()', '(select auth.uid())')
      );
    end if;

    if policy_record.with_check is not null then
      statement := statement || format(
        ' with check (%s)',
        replace(policy_record.with_check, 'auth.uid()', '(select auth.uid())')
      );
    end if;

    execute statement;
  end loop;
end
$policy_hardening$;

-- Cover every currently advisor-reported public foreign key. These indexes
-- support joins and prevent parent updates/deletes from scanning child tables.
create index if not exists challenge_participants_user_id_idx on public.challenge_participants(user_id);
create index if not exists challenges_group_id_idx on public.challenges(group_id);
create index if not exists challenges_owner_id_idx on public.challenges(owner_id);
create index if not exists chapters_owner_id_idx on public.chapters(owner_id);
create index if not exists chapters_subject_id_idx on public.chapters(subject_id);
create index if not exists chapters_unit_id_idx on public.chapters(unit_id);
create index if not exists exams_owner_id_idx on public.exams(owner_id);
create index if not exists friendships_addressee_id_idx on public.friendships(addressee_id);
create index if not exists group_invites_group_id_idx on public.group_invites(group_id);
create index if not exists group_invites_invitee_id_idx on public.group_invites(invitee_id);
create index if not exists group_invites_inviter_id_idx on public.group_invites(inviter_id);
create index if not exists group_members_user_id_idx on public.group_members(user_id);
create index if not exists groups_owner_id_idx on public.groups(owner_id);
create index if not exists mock_test_mistakes_chapter_id_idx on public.mock_test_mistakes(chapter_id);
create index if not exists mock_test_mistakes_mock_test_id_idx on public.mock_test_mistakes(mock_test_id);
create index if not exists mock_test_mistakes_owner_id_idx on public.mock_test_mistakes(owner_id);
create index if not exists mock_test_sections_mock_test_id_idx on public.mock_test_sections(mock_test_id);
create index if not exists mock_test_sections_owner_id_idx on public.mock_test_sections(owner_id);
create index if not exists mock_test_sections_subject_id_idx on public.mock_test_sections(subject_id);
create index if not exists mock_tests_exam_id_idx on public.mock_tests(exam_id);
create index if not exists notifications_owner_id_idx on public.notifications(owner_id);
create index if not exists planner_events_subject_id_idx on public.planner_events(subject_id);
create index if not exists planner_events_task_id_idx on public.planner_events(task_id);
create index if not exists revision_history_owner_id_idx on public.revision_history(owner_id);
create index if not exists revision_history_revision_item_id_idx on public.revision_history(revision_item_id);
create index if not exists revision_items_topic_id_idx on public.revision_items(topic_id);
create index if not exists study_sessions_chapter_id_idx on public.study_sessions(chapter_id);
create index if not exists study_sessions_subject_id_idx on public.study_sessions(subject_id);
create index if not exists study_sessions_task_id_idx on public.study_sessions(task_id);
create index if not exists study_sessions_topic_id_idx on public.study_sessions(topic_id);
create index if not exists subtasks_owner_id_idx on public.subtasks(owner_id);
create index if not exists subtasks_task_id_idx on public.subtasks(task_id);
create index if not exists tasks_chapter_id_idx on public.tasks(chapter_id);
create index if not exists tasks_subject_id_idx on public.tasks(subject_id);
create index if not exists topics_chapter_id_idx on public.topics(chapter_id);
create index if not exists topics_owner_id_idx on public.topics(owner_id);
create index if not exists units_owner_id_idx on public.units(owner_id);
create index if not exists units_subject_id_idx on public.units(subject_id);

commit;
