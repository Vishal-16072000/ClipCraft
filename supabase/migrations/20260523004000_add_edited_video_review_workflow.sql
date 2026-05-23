create table if not exists public.edited_videos (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  editor_id uuid references public.editors (id) on delete set null,
  name text not null,
  size_bytes bigint not null,
  storage_path text not null,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'satisfied', 'changes_requested')),
  client_comment text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists edited_videos_order_id_idx
  on public.edited_videos (order_id, created_at desc);

alter table public.edited_videos enable row level security;

drop policy if exists "Users read own edited videos" on public.edited_videos;
create policy "Users read own edited videos"
  on public.edited_videos for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id = edited_videos.order_id and o.user_id = auth.uid()
    )
  );

create or replace function public.editor_add_edited_video(
  editor_token text,
  target_order_id uuid,
  video_name text,
  video_size_bytes bigint,
  video_storage_path text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_editor_id uuid;
  new_video_id uuid;
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

  insert into public.edited_videos (
    order_id,
    editor_id,
    name,
    size_bytes,
    storage_path
  )
  values (
    target_order_id,
    current_editor_id,
    video_name,
    video_size_bytes,
    video_storage_path
  )
  returning id into new_video_id;

  update public.orders
  set status = 'review'
  where id = target_order_id;

  return new_video_id;
end;
$$;

create or replace function public.client_review_edited_video(
  target_edited_video_id uuid,
  next_review_status text,
  review_comment text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if next_review_status not in ('satisfied', 'changes_requested') then
    raise exception 'Invalid review status';
  end if;

  update public.edited_videos v
  set
    review_status = next_review_status,
    client_comment = nullif(trim(coalesce(review_comment, '')), ''),
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
end;
$$;

create or replace function public.editor_update_order_status(
  editor_token text,
  order_id uuid,
  next_status text
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

  if next_status not in ('received', 'editing', 'review', 'done') then
    raise exception 'Invalid order status';
  end if;

  if next_status = 'done' and not exists (
    select 1
    from public.edited_videos v
    where v.order_id = editor_update_order_status.order_id
      and v.review_status = 'satisfied'
  ) then
    raise exception 'Client satisfaction is required before delivery';
  end if;

  update public.orders o
  set status = next_status
  where o.id = order_id
    and exists (
      select 1
      from public.editor_client_assignments a
      where a.editor_id = current_editor_id and a.user_id = o.user_id
    );
end;
$$;

drop policy if exists "Editor workspace uploads edited videos" on storage.objects;
create policy "Editor workspace uploads edited videos"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = 'edited'
  );

grant execute on function public.editor_add_edited_video(text, uuid, text, bigint, text) to anon, authenticated;
grant execute on function public.client_review_edited_video(uuid, text, text) to authenticated;

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

select pg_notify('pgrst', 'reload schema');
