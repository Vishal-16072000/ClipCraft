create table if not exists public.edited_video_comments (
  id uuid primary key default gen_random_uuid(),
  edited_video_id uuid not null references public.edited_videos (id) on delete cascade,
  author_type text not null check (author_type in ('client', 'editor')),
  author_user_id uuid references auth.users (id) on delete set null,
  author_editor_id uuid references public.editors (id) on delete set null,
  comment_type text not null check (comment_type in ('text', 'voice')),
  body text,
  audio_storage_path text,
  audio_duration_ms integer,
  created_at timestamptz not null default now(),
  constraint edited_video_comments_content_check check (
    (comment_type = 'text' and nullif(trim(coalesce(body, '')), '') is not null)
    or (
      comment_type = 'voice'
      and audio_storage_path is not null
      and nullif(trim(audio_storage_path), '') is not null
    )
  ),
  constraint edited_video_comments_author_check check (
    (author_type = 'client' and author_user_id is not null)
    or (author_type = 'editor' and author_editor_id is not null)
  )
);

create index if not exists edited_video_comments_video_id_idx
  on public.edited_video_comments (edited_video_id, created_at asc);

alter table public.edited_video_comments enable row level security;

drop policy if exists "Users read own edited video comments" on public.edited_video_comments;
create policy "Users read own edited video comments"
  on public.edited_video_comments for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.edited_videos v
      join public.orders o on o.id = v.order_id
      where v.id = edited_video_comments.edited_video_id
        and o.user_id = auth.uid()
    )
  );

insert into public.edited_video_comments (
  edited_video_id,
  author_type,
  author_user_id,
  comment_type,
  body,
  created_at
)
select
  v.id,
  'client',
  o.user_id,
  'text',
  v.client_comment,
  coalesce(v.reviewed_at, v.created_at)
from public.edited_videos v
join public.orders o on o.id = v.order_id
where nullif(trim(coalesce(v.client_comment, '')), '') is not null
  and not exists (
    select 1
    from public.edited_video_comments c
    where c.edited_video_id = v.id
  );

create or replace function public.client_add_edited_video_comment(
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
    join public.orders o on o.id = v.order_id
    where v.id = target_edited_video_id and o.user_id = auth.uid()
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
    'client',
    auth.uid(),
    next_comment_type,
    clean_body,
    clean_audio_path,
    comment_audio_duration_ms
  )
  returning id into new_comment_id;

  if next_comment_type = 'text' then
    update public.edited_videos
    set client_comment = clean_body
    where id = target_edited_video_id;
  end if;

  return new_comment_id;
end;
$$;

create or replace function public.editor_add_edited_video_comment(
  editor_token text,
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
  current_editor_id uuid;
  new_comment_id uuid;
  clean_body text;
  clean_audio_path text;
begin
  current_editor_id := public.editor_id_from_token(editor_token);

  if current_editor_id is null then
    raise exception 'Editor access required';
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
    join public.orders o on o.id = v.order_id
    join public.editor_client_assignments a on a.user_id = o.user_id
    where v.id = target_edited_video_id and a.editor_id = current_editor_id
  ) then
    raise exception 'Edited video not found';
  end if;

  insert into public.edited_video_comments (
    edited_video_id,
    author_type,
    author_editor_id,
    comment_type,
    body,
    audio_storage_path,
    audio_duration_ms
  )
  values (
    target_edited_video_id,
    'editor',
    current_editor_id,
    next_comment_type,
    clean_body,
    clean_audio_path,
    comment_audio_duration_ms
  )
  returning id into new_comment_id;

  return new_comment_id;
end;
$$;

create or replace function public.client_review_edited_video(
  target_edited_video_id uuid,
  next_review_status text,
  review_comment text default null,
  review_comment_type text default 'text',
  review_audio_storage_path text default null,
  review_audio_duration_ms integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_body text;
  clean_audio_path text;
  clean_comment_type text;
begin
  if next_review_status not in ('satisfied', 'changes_requested') then
    raise exception 'Invalid review status';
  end if;

  clean_comment_type := coalesce(nullif(trim(review_comment_type), ''), 'text');

  if clean_comment_type not in ('text', 'voice') then
    raise exception 'Invalid comment type';
  end if;

  clean_body := nullif(trim(coalesce(review_comment, '')), '');
  clean_audio_path := nullif(trim(coalesce(review_audio_storage_path, '')), '');

  update public.edited_videos v
  set
    review_status = next_review_status,
    client_comment = case
      when clean_comment_type = 'text' then clean_body
      else v.client_comment
    end,
    reviewed_at = now()
  where v.id = target_edited_video_id
    and exists (
      select 1
      from public.orders o
      where o.id = v.order_id and o.user_id = auth.uid()
    );

  if not found then
    raise exception 'Edited video not found';
  end if;

  if clean_comment_type = 'text' and clean_body is not null then
    perform public.client_add_edited_video_comment(
      target_edited_video_id,
      'text',
      clean_body
    );
  elsif clean_comment_type = 'voice' and clean_audio_path is not null then
    perform public.client_add_edited_video_comment(
      target_edited_video_id,
      'voice',
      null,
      clean_audio_path,
      review_audio_duration_ms
    );
  end if;
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

drop policy if exists "Upload comment audio" on storage.objects;
create policy "Upload comment audio"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = 'comment-audio'
  );

drop policy if exists "Read comment audio" on storage.objects;
create policy "Read comment audio"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = 'comment-audio'
  );

grant execute on function public.client_add_edited_video_comment(uuid, text, text, text, integer) to authenticated;
grant execute on function public.editor_add_edited_video_comment(text, uuid, text, text, text, integer) to anon, authenticated;
grant execute on function public.client_review_edited_video(uuid, text, text, text, text, integer) to authenticated;
grant execute on function public.editor_list_orders(text) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
