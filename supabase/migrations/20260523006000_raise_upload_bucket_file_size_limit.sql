insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', false, 5368709120)
on conflict (id) do update
  set file_size_limit = 5368709120;

select
  id,
  name,
  public,
  file_size_limit
from storage.buckets
where id = 'uploads';
