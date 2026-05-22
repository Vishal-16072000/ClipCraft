# Supabase setup for ClipCraft

## 1. Run the database schema

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**, paste and run the full contents of `schema.sql`.

This creates:

- `profiles` — user email + role (`user` / `admin`)
- `orders` — project title, status, notes
- `order_files` — file name, size, storage path
- `uploads` storage bucket + RLS policies
- admin RLS access for `/admin`

## 2. Make a user admin

Create the user in **Authentication** → **Users**, then run:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

If the profile row does not exist yet, use the user's UID from Authentication:

```sql
insert into public.profiles (id, email, role)
values ('USER_UID_HERE', 'admin@example.com', 'admin')
on conflict (id)
do update set email = excluded.email, role = excluded.role;
```

After signing in, admins can open `/admin`.

## 3. Where uploads appear

| What | Where in Supabase |
|------|-------------------|
| Video files | **Storage** → bucket `uploads` → `{user_id}/{order_id}/...` |
| Order metadata | **Table Editor** → `orders` |
| File records | **Table Editor** → `order_files` |
| User roles | **Table Editor** → `profiles` |
| Signed-in user | **Authentication** → **Users** |

## 4. Restart the dev server

After changing `.env`, run `npm run dev` again.
