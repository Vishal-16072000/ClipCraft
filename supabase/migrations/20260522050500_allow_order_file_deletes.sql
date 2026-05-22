drop policy if exists "Users delete own order files" on public.order_files;
create policy "Users delete own order files"
  on public.order_files for delete
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_files.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own footage" on storage.objects;
create policy "Users delete own footage"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername (name))[1] = auth.uid()::text
  );
