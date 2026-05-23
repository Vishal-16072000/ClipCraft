drop policy if exists "Editor workspace reads uploaded footage" on storage.objects;
create policy "Editor workspace reads uploaded footage"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'uploads');
