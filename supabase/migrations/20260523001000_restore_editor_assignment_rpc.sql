create or replace function public.admin_assign_editor_client(
  target_editor_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.editor_client_assignments (editor_id, user_id)
  values (target_editor_id, target_user_id)
  on conflict (editor_id, user_id) do nothing;
end;
$$;

grant execute on function public.admin_assign_editor_client(uuid, uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');
