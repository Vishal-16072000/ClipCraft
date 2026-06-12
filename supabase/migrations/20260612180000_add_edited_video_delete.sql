create or replace function public.client_delete_edited_video(
  target_edited_video_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.edited_videos v
  where v.id = target_edited_video_id
    and exists (
      select 1
      from public.orders o
      where o.id = v.order_id and o.user_id = auth.uid()
    );

  if not found then
    raise exception 'Edited video not found';
  end if;
end;
$$;

create or replace function public.editor_delete_edited_video(
  editor_token text,
  target_edited_video_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_editor_id uuid;
begin
  current_editor_id := public.editor_id_from_token(editor_token);

  if current_editor_id is null then
    raise exception 'Editor access required';
  end if;

  delete from public.edited_videos v
  where v.id = target_edited_video_id
    and exists (
      select 1
      from public.orders o
      join public.editor_client_assignments a on a.user_id = o.user_id
      where o.id = v.order_id and a.editor_id = current_editor_id
    );

  if not found then
    raise exception 'Edited video not found';
  end if;
end;
$$;

create or replace function public.admin_delete_edited_video(
  target_edited_video_id uuid
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

  delete from public.edited_videos v
  where v.id = target_edited_video_id;

  if not found then
    raise exception 'Edited video not found';
  end if;
end;
$$;

grant execute on function public.client_delete_edited_video(uuid) to authenticated;
grant execute on function public.editor_delete_edited_video(text, uuid) to anon, authenticated;
grant execute on function public.admin_delete_edited_video(uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');
