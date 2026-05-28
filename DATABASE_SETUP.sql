-- AI Bug Assistant Supabase setup
-- Run this in the Supabase SQL editor for development/demo use.

create table if not exists public.bug_reports (
  id text primary key,
  title varchar(255) not null,
  description text not null,
  screenshot_url text,
  severity varchar(20) not null default 'medium',
  affected_module varchar(255) not null default 'Unknown',
  reproduction_steps jsonb not null default '[]'::jsonb,
  expected_result text not null default '',
  actual_result text not null default '',
  status varchar(20) not null default 'todo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id text not null default 'default_user'
);

create table if not exists public.screenshots (
  id text primary key,
  bug_id text not null references public.bug_reports(id) on delete cascade,
  filename text not null,
  file_path text not null,
  file_url text not null,
  file_size bigint,
  mime_type text not null,
  uploaded_by text not null default 'default_user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists screenshots_bug_id_idx on public.screenshots(bug_id);
create index if not exists bug_reports_created_at_idx on public.bug_reports(created_at desc);

update public.bug_reports
set status = case status
  when 'pending' then 'todo'
  when 'analyzing' then 'inprogress'
  when 'completed' then 'resolved'
  else status
end
where status in ('pending', 'analyzing', 'completed');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bug-screenshots',
  'bug-screenshots',
  true,
  52428800,
  array[
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.bug_reports disable row level security;
alter table public.screenshots disable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'bug evidence public read'
  ) then
    create policy "bug evidence public read"
      on storage.objects for select
      using (bucket_id = 'bug-screenshots');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'bug evidence public upload'
  ) then
    create policy "bug evidence public upload"
      on storage.objects for insert
      with check (bucket_id = 'bug-screenshots');
  end if;
end $$;
