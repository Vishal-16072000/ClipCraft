create or replace function public.client_get_assigned_editor()
returns table (
  id uuid,
  email text,
  assigned_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id,
    e.email,
    a.created_at as assigned_at
  from public.editor_client_assignments a
  join public.editors e on e.id = a.editor_id
  where a.user_id = auth.uid()
  order by a.created_at desc
  limit 1;
$$;

grant execute on function public.client_get_assigned_editor() to authenticated;

select pg_notify('pgrst', 'reload schema');
