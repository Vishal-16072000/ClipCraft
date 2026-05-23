create or replace function public.admin_remove_editor_client(
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

  delete from public.editor_client_assignments
  where editor_id = target_editor_id and user_id = target_user_id;
end;
$$;

grant execute on function public.admin_remove_editor_client(uuid, uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');
