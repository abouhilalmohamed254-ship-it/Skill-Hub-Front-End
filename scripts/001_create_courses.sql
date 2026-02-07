-- Drop existing table and policies if they exist (clean slate)
drop policy if exists "Anyone can view public courses" on public.courses;
drop policy if exists "Admin can view all courses" on public.courses;
drop policy if exists "Admin can insert courses" on public.courses;
drop policy if exists "Admin can update courses" on public.courses;
drop policy if exists "Admin can delete courses" on public.courses;
drop table if exists public.courses;

-- Create courses table
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  level text not null,
  status text not null default 'Draft',
  instructor text not null,
  price integer not null default 0,
  duration integer not null default 0,
  description text not null default '',
  students_number integer not null default 0,
  certification text not null default 'Not Certificated',
  created_at timestamptz not null default now(),
  user_id uuid
);

-- Enable RLS
alter table public.courses enable row level security;

-- Anyone can read all courses (public catalogue)
create policy "Anyone can view courses"
  on public.courses for select
  using (true);

-- Authenticated users can insert courses
create policy "Auth users can insert courses"
  on public.courses for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated users can update their own courses
create policy "Auth users can update courses"
  on public.courses for update
  to authenticated
  using (auth.uid() = user_id);

-- Authenticated users can delete their own courses
create policy "Auth users can delete courses"
  on public.courses for delete
  to authenticated
  using (auth.uid() = user_id);
