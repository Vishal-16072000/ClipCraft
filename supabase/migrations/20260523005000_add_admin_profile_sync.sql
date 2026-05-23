create or replace function public.admin_sync_profiles()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.profiles (id, email, role)
  select id, coalesce(email, ''), 'user'
  from auth.users
  on conflict (id) do update
    set email = excluded.email;
end;
$$;

grant execute on function public.admin_sync_profiles() to authenticated;

select pg_notify('pgrst', 'reload schema');
