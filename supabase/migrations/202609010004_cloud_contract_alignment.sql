begin;

alter table public.profiles
  add column if not exists onboarded boolean not null default false;

revoke all on function public.handle_new_user() from public;
revoke all on function public.add_group_owner() from public;
revoke all on function public.is_group_member(uuid) from public;
revoke all on function public.is_group_admin(uuid) from public;

grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_admin(uuid) to authenticated;

grant select,insert,update,delete on table
  public.profiles,
  public.user_preferences,
  public.subjects,
  public.tasks,
  public.study_sessions
to authenticated;

commit;
