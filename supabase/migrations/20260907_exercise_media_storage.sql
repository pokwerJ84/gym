-- Private user-owned media for exercise photos and videos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-media',
  'exercise-media',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload their own exercise media" on storage.objects;
create policy "Users upload their own exercise media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'exercise-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users view their own exercise media" on storage.objects;
create policy "Users view their own exercise media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'exercise-media'
  and owner_id = (select auth.uid())::text
);

drop policy if exists "Users delete their own exercise media" on storage.objects;
create policy "Users delete their own exercise media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'exercise-media'
  and owner_id = (select auth.uid())::text
);
