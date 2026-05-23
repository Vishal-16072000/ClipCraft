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

grant execute on function public.editor_list_orders(text) to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
