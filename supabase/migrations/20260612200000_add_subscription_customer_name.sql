-- Add customer name to subscriptions for admin visibility in Supabase.
-- Nullable column + trigger keeps existing inserts working unchanged.

alter table public.subscriptions
  add column if not exists customer_name text;

comment on column public.subscriptions.customer_name is
  'Customer display name captured from auth.users metadata at insert time.';

create or replace function public.subscription_customer_name_from_user(target_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), '')
  )
  from auth.users u
  where u.id = target_user_id;
$$;

create or replace function public.set_subscription_customer_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.customer_name is null or btrim(new.customer_name) = '' then
    new.customer_name := public.subscription_customer_name_from_user(new.user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists subscriptions_set_customer_name on public.subscriptions;
create trigger subscriptions_set_customer_name
  before insert on public.subscriptions
  for each row execute function public.set_subscription_customer_name();

-- Backfill existing rows.
update public.subscriptions s
set customer_name = public.subscription_customer_name_from_user(s.user_id)
where s.customer_name is null
  or btrim(s.customer_name) = '';
