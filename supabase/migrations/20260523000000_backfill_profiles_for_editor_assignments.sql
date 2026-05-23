insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'user'
from auth.users
on conflict (id) do update
  set email = excluded.email;
