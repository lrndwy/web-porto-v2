-- Storage buckets.
--
-- Reads never go through RLS: public buckets are served by the /object/public/
-- endpoint, and the private `documents` bucket is only ever read through a
-- signed URL minted with the service-role client. Uploads also use the service
-- role (see server/api/admin/upload.post.ts). The anon SELECT policies below
-- exist so that listing a public bucket is possible without a service key.

insert into storage.buckets (id, name, public) values
  ('avatars',            'avatars',            true),
  ('site-assets',        'site-assets',        true),
  ('blog-images',        'blog-images',        true),
  ('achievement-images', 'achievement-images', true),
  ('documents',          'documents',          false)
on conflict (id) do nothing;

drop policy if exists "public_buckets_anon_select" on storage.objects;
create policy "public_buckets_anon_select" on storage.objects
  for select to anon
  using (
    bucket_id in ('avatars', 'site-assets', 'blog-images', 'achievement-images')
  );

-- `documents` deliberately has no policy: RLS with no policy is unreadable to
-- every client role, which is the intended state for the private bucket.
