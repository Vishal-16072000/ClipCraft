alter table public.edited_video_comments
  drop constraint if exists edited_video_comments_author_check;

alter table public.edited_video_comments
  drop constraint if exists edited_video_comments_author_type_check;

alter table public.edited_video_comments
  add constraint edited_video_comments_author_type_check
  check (author_type in ('client', 'editor', 'admin'));

alter table public.edited_video_comments
  add constraint edited_video_comments_author_check
  check (
    (author_type = 'client' and author_user_id is not null)
    or (author_type = 'editor' and author_editor_id is not null)
    or (author_type = 'admin' and author_user_id is not null)
  );

create or replace function public.admin_add_edited_video_comment(
  target_edited_video_id uuid,
  next_comment_type text,
  comment_body text default null,
  comment_audio_storage_path text default null,
  comment_audio_duration_ms integer default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_comment_id uuid;
  clean_body text;
  clean_audio_path text;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if next_comment_type not in ('text', 'voice') then
    raise exception 'Invalid comment type';
  end if;

  clean_body := nullif(trim(coalesce(comment_body, '')), '');
  clean_audio_path := nullif(trim(coalesce(comment_audio_storage_path, '')), '');

  if next_comment_type = 'text' and clean_body is null then
    raise exception 'Comment text is required';
  end if;

  if next_comment_type = 'voice' and clean_audio_path is null then
    raise exception 'Voice comment audio is required';
  end if;

  if not exists (
    select 1
    from public.edited_videos v
    where v.id = target_edited_video_id
  ) then
    raise exception 'Edited video not found';
  end if;

  insert into public.edited_video_comments (
    edited_video_id,
    author_type,
    author_user_id,
    comment_type,
    body,
    audio_storage_path,
    audio_duration_ms
  )
  values (
    target_edited_video_id,
    'admin',
    auth.uid(),
    next_comment_type,
    clean_body,
    clean_audio_path,
    comment_audio_duration_ms
  )
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

create or replace function public.editor_delete_order_file(
  editor_token text,
  target_order_id uuid,
  target_file_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_editor_id uuid;
  target_storage_path text;
begin
  current_editor_id := public.editor_id_from_token(editor_token);

  if current_editor_id is null then
    raise exception 'Editor access required';
  end if;

  if not exists (
    select 1
    from public.orders o
    join public.editor_client_assignments a on a.user_id = o.user_id
    where o.id = target_order_id and a.editor_id = current_editor_id
  ) then
    raise exception 'Order is not assigned to this editor';
  end if;

  select f.storage_path
  into target_storage_path
  from public.order_files f
  where f.id = target_file_id and f.order_id = target_order_id;

  if not found then
    raise exception 'Clip not found';
  end if;

  delete from public.order_files
  where id = target_file_id and order_id = target_order_id;

  update public.orders
  set updated_at = now()
  where id = target_order_id;
end;
$$;

create or replace function public.admin_delete_order_file(
  target_order_id uuid,
  target_file_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_storage_path text;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select f.storage_path
  into target_storage_path
  from public.order_files f
  where f.id = target_file_id and f.order_id = target_order_id;

  if not found then
    raise exception 'Clip not found';
  end if;

  delete from public.order_files
  where id = target_file_id and order_id = target_order_id;

  update public.orders
  set updated_at = now()
  where id = target_order_id;
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
          'reviewed_at', v.reviewed_at,
          'comments', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', c.id,
                'author_type', c.author_type,
                'author_user_id', c.author_user_id,
                'author_editor_id', c.author_editor_id,
                'comment_type', c.comment_type,
                'body', c.body,
                'audio_storage_path', c.audio_storage_path,
                'audio_duration_ms', c.audio_duration_ms,
                'created_at', c.created_at
              )
              order by c.created_at asc
            )
            from public.edited_video_comments c
            where c.edited_video_id = v.id
          ), '[]'::jsonb)
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
          'reviewed_at', v.reviewed_at,
          'comments', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', c.id,
                'author_type', c.author_type,
                'author_user_id', c.author_user_id,
                'author_editor_id', c.author_editor_id,
                'comment_type', c.comment_type,
                'body', c.body,
                'audio_storage_path', c.audio_storage_path,
                'audio_duration_ms', c.audio_duration_ms,
                'created_at', c.created_at
              )
              order by c.created_at asc
            )
            from public.edited_video_comments c
            where c.edited_video_id = v.id
          ), '[]'::jsonb)
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

grant execute on function public.admin_add_edited_video_comment(uuid, text, text, text, integer) to authenticated;
grant execute on function public.editor_delete_order_file(text, uuid, uuid) to anon, authenticated;
grant execute on function public.admin_delete_order_file(uuid, uuid) to authenticated;
grant execute on function public.editor_list_orders(text) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
