-- Run this in Supabase SQL Editor to enable the ClipCraft admin panel.

alter table public.orders
add column if not exists footage_url text;

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
