-- Run in Supabase Dashboard → SQL Editor (once per project)

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'received'
    check (status in ('received', 'editing', 'review', 'done')),
  reference_url text,
  style_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Uploaded video files (metadata + storage path)
create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  name text not null,
  size_bytes bigint not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_files_order_id_idx on public.order_files (order_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- RLS: orders
alter table public.orders enable row level security;

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own orders" on public.orders;
create policy "Users update own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- RLS: order_files
alter table public.order_files enable row level security;

drop policy if exists "Users read own order files" on public.order_files;
create policy "Users read own order files"
  on public.order_files for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_files.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own order files" on public.order_files;
create policy "Users insert own order files"
  on public.order_files for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_files.order_id and o.user_id = auth.uid()
    )
  );

-- Storage bucket for raw footage
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own footage" on storage.objects;
create policy "Users upload own footage"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

drop policy if exists "Users read own footage" on storage.objects;
create policy "Users read own footage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername (name))[1] = auth.uid()::text
  );
