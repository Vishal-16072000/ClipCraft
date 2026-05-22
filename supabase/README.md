# Supabase setup for ClipCraft

## 1. Run the database schema

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**, paste and run the full contents of `schema.sql`.

This creates:

- `orders` — project title, status, notes
- `order_files` — file name, size, storage path
- `uploads` storage bucket + RLS policies

## 2. Where uploads appear

| What | Where in Supabase |
|------|-------------------|
| Video files | **Storage** → bucket `uploads` → `{user_id}/{order_id}/...` |
| Order metadata | **Table Editor** → `orders` |
| File records | **Table Editor** → `order_files` |
| Signed-in user | **Authentication** → **Users** |

## 3. Restart the dev server

After changing `.env`, run `npm run dev` again.
