alter table public.edited_videos
  add column if not exists drive_url text;

alter table public.edited_videos
  alter column storage_path drop not null;

alter table public.edited_videos
  drop constraint if exists edited_videos_source_check;

alter table public.edited_videos
  add constraint edited_videos_source_check
  check (
    (storage_path is not null and drive_url is null)
    or (storage_path is null and drive_url is not null)
  );

create or replace function public.editor_add_edited_video_drive_link(
  editor_token text,
  target_order_id uuid,
  video_drive_url text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_editor_id uuid;
  new_video_id uuid;
  clean_drive_url text;
begin
  current_editor_id := public.editor_id_from_token(editor_token);

  if current_editor_id is null then
    raise exception 'Editor access required';
  end if;

  clean_drive_url := nullif(trim(coalesce(video_drive_url, '')), '');

  if clean_drive_url is null then
    raise exception 'Google Drive link is required';
  end if;

  if not exists (
    select 1
    from public.orders o
    join public.editor_client_assignments a on a.user_id = o.user_id
    where o.id = target_order_id and a.editor_id = current_editor_id
  ) then
    raise exception 'Order is not assigned to this editor';
  end if;

  insert into public.edited_videos (
    order_id,
    editor_id,
    name,
    size_bytes,
    storage_path,
    drive_url
  )
  values (
    target_order_id,
    current_editor_id,
    'Edited video (Google Drive)',
    0,
    null,
    clean_drive_url
  )
  returning id into new_video_id;

  update public.orders
  set status = 'review'
  where id = target_order_id;

  return new_video_id;
end;
$$;

drop function if exists public.editor_list_orders(text);

create or replace function public.editor_list_orders(editor_token text)
returns table (
  id uuid,
  user_id uuid,
  customer_email text,
  title text,
  status text,
  footage_url text,
  reference_url text,
  style_notes text,
  created_at timestamptz,
  updated_at timestamptz,
  order_files jsonb,
  edited_videos jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    o.user_id,
    p.email as customer_email,
    o.title,
    o.status,
    o.footage_url,
    o.reference_url,
    o.style_notes,
    o.created_at,
    o.updated_at,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'size_bytes', f.size_bytes,
          'storage_path', f.storage_path
        )
        order by f.created_at asc
      )
      from public.order_files f
      where f.order_id = o.id
    ), '[]'::jsonb) as order_files,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'name', v.name,
          'size_bytes', v.size_bytes,
          'storage_path', v.storage_path,
          'drive_url', v.drive_url,
          'editor_id', v.editor_id,
          'review_status', v.review_status,
          'client_comment', v.client_comment,
          'created_at', v.created_at,
          'reviewed_at', v.reviewed_at
        )
        order by v.created_at desc
      )
      from public.edited_videos v
      where v.order_id = o.id
    ), '[]'::jsonb) as edited_videos
  from public.orders o
  join public.editor_client_assignments a on a.user_id = o.user_id
  left join public.profiles p on p.id = o.user_id
  where a.editor_id = public.editor_id_from_token(editor_token)
  order by o.created_at desc;
$$;

create or replace function public.admin_list_orders()
returns table (
  id uuid,
  user_id uuid,
  customer_email text,
  title text,
  status text,
  footage_url text,
  reference_url text,
  style_notes text,
  created_at timestamptz,
  updated_at timestamptz,
  order_files jsonb,
  edited_videos jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    o.user_id,
    p.email as customer_email,
    o.title,
    o.status,
    o.footage_url,
    o.reference_url,
    o.style_notes,
    o.created_at,
    o.updated_at,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'size_bytes', f.size_bytes,
          'storage_path', f.storage_path
        )
        order by f.created_at asc
      )
      from public.order_files f
      where f.order_id = o.id
    ), '[]'::jsonb) as order_files,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'name', v.name,
          'size_bytes', v.size_bytes,
          'storage_path', v.storage_path,
          'drive_url', v.drive_url,
          'editor_id', v.editor_id,
          'review_status', v.review_status,
          'client_comment', v.client_comment,
          'created_at', v.created_at,
          'reviewed_at', v.reviewed_at
        )
        order by v.created_at desc
      )
      from public.edited_videos v
      where v.order_id = o.id
    ), '[]'::jsonb) as edited_videos
  from public.orders o
  left join public.profiles p on p.id = o.user_id
  where public.is_admin()
  order by o.created_at desc;
$$;

grant execute on function public.editor_add_edited_video_drive_link(text, uuid, text) to anon, authenticated;
grant execute on function public.editor_list_orders(text) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
