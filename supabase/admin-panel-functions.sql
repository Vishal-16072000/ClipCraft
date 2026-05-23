-- Run this in Supabase SQL Editor to enable the ClipCraft admin panel.

alter table public.orders
add column if not exists footage_url text;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'user'
from auth.users
on conflict (id) do update
  set email = excluded.email;

create table if not exists public.editors (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists editors_created_at_idx on public.editors (created_at desc);

create table if not exists public.editor_client_assignments (
  editor_id uuid not null references public.editors (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (editor_id, user_id)
);

create index if not exists editor_client_assignments_user_id_idx
  on public.editor_client_assignments (user_id);

create table if not exists public.editor_sessions (
  id uuid primary key default gen_random_uuid(),
  editor_id uuid not null references public.editors (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index if not exists editor_sessions_editor_id_idx
  on public.editor_sessions (editor_id);

create index if not exists editor_sessions_expires_at_idx
  on public.editor_sessions (expires_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists editors_updated_at on public.editors;
create trigger editors_updated_at
  before update on public.editors
  for each row execute function public.set_updated_at();

alter table public.editors enable row level security;
alter table public.editor_client_assignments enable row level security;
alter table public.editor_sessions enable row level security;

drop policy if exists "Admins read editors" on public.editors;
create policy "Admins read editors"
  on public.editors for select
  using (public.is_admin());

drop policy if exists "Admins read editor assignments" on public.editor_client_assignments;
create policy "Admins read editor assignments"
  on public.editor_client_assignments for select
  using (public.is_admin());

drop policy if exists "Admins read editor sessions" on public.editor_sessions;
create policy "Admins read editor sessions"
  on public.editor_sessions for select
  using (public.is_admin());

create or replace function public.admin_create_editor(
  editor_email text,
  editor_password text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_editor_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if nullif(trim(editor_email), '') is null then
    raise exception 'Editor email is required';
  end if;

  if length(editor_password) < 6 then
    raise exception 'Editor password must be at least 6 characters';
  end if;

  insert into public.editors (email, password_hash)
  values (
    lower(trim(editor_email)),
    extensions.crypt(editor_password, extensions.gen_salt('bf'))
  )
  returning id into new_editor_id;

  return new_editor_id;
end;
$$;

drop function if exists public.editor_sign_in(text, text);

create or replace function public.editor_sign_in(
  editor_email text,
  editor_password text
)
returns table (
  id uuid,
  email text,
  access_token text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  matched_editor public.editors%rowtype;
  raw_token text;
begin
  select *
  into matched_editor
  from public.editors e
  where e.email = lower(trim(editor_email))
    and e.password_hash = extensions.crypt(editor_password, e.password_hash)
  limit 1;

  if not found then
    return;
  end if;

  raw_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.editor_sessions (editor_id, token_hash)
  values (matched_editor.id, encode(extensions.digest(raw_token, 'sha256'), 'hex'));

  id := matched_editor.id;
  email := matched_editor.email;
  access_token := raw_token;
  created_at := matched_editor.created_at;
  updated_at := matched_editor.updated_at;

  return next;
end;
$$;

create or replace function public.editor_id_from_token(editor_token text)
returns uuid
language sql
stable
security definer
set search_path = public, extensions
as $$
  select s.editor_id
  from public.editor_sessions s
  where s.token_hash = encode(extensions.digest(editor_token, 'sha256'), 'hex')
    and s.expires_at > now()
  limit 1;
$$;

create or replace function public.admin_list_editors()
returns table (
  id uuid,
  email text,
  password_set boolean,
  assigned_clients jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id,
    e.email,
    e.password_hash <> '' as password_set,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'email', p.email,
          'assigned_at', a.created_at
        )
        order by a.created_at desc
      ) filter (where p.id is not null),
      '[]'::jsonb
    ) as assigned_clients,
    e.created_at,
    e.updated_at
  from public.editors e
  left join public.editor_client_assignments a on a.editor_id = e.id
  left join public.profiles p on p.id = a.user_id
  where public.is_admin()
  group by e.id
  order by e.created_at desc;
$$;

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

create or replace function public.editor_list_clients(editor_token text)
returns table (
  id uuid,
  email text,
  assigned_at timestamptz,
  order_count bigint,
  active_order_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.email,
    a.created_at as assigned_at,
    count(o.id) as order_count,
    count(o.id) filter (where o.status <> 'done') as active_order_count
  from public.editor_client_assignments a
  join public.profiles p on p.id = a.user_id
  left join public.orders o on o.user_id = a.user_id
  where a.editor_id = public.editor_id_from_token(editor_token)
  group by p.id, p.email, a.created_at
  order by a.created_at desc;
$$;

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
  order_files jsonb
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
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'size_bytes', f.size_bytes,
          'storage_path', f.storage_path
        )
        order by f.created_at asc
      ) filter (where f.id is not null),
      '[]'::jsonb
    ) as order_files
  from public.orders o
  join public.editor_client_assignments a on a.user_id = o.user_id
  left join public.profiles p on p.id = o.user_id
  left join public.order_files f on f.order_id = o.id
  where a.editor_id = public.editor_id_from_token(editor_token)
  group by o.id, p.email
  order by o.created_at desc;
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

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  email text,
  role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.email, p.role, p.created_at
  from public.profiles p
  where public.is_admin()
  order by p.created_at desc;
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
  order_files jsonb
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
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'size_bytes', f.size_bytes,
          'storage_path', f.storage_path
        )
        order by f.created_at asc
      ) filter (where f.id is not null),
      '[]'::jsonb
    ) as order_files
  from public.orders o
  left join public.profiles p on p.id = o.user_id
  left join public.order_files f on f.order_id = o.id
  where public.is_admin()
  group by o.id, p.email
  order by o.created_at desc;
$$;

create or replace function public.admin_update_order_status(
  order_id uuid,
  next_status text
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

  if next_status not in ('received', 'editing', 'review', 'done') then
    raise exception 'Invalid order status';
  end if;

  update public.orders
  set status = next_status
  where id = order_id;
end;
$$;

grant execute on function public.admin_list_editors() to authenticated;
grant execute on function public.admin_create_editor(text, text) to authenticated;
grant execute on function public.admin_assign_editor_client(uuid, uuid) to authenticated;
grant execute on function public.admin_remove_editor_client(uuid, uuid) to authenticated;
grant execute on function public.client_get_assigned_editor() to authenticated;
grant execute on function public.editor_sign_in(text, text) to anon, authenticated;
grant execute on function public.editor_list_clients(text) to anon, authenticated;
grant execute on function public.editor_list_orders(text) to anon, authenticated;
grant execute on function public.editor_update_order_status(text, uuid, text) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
