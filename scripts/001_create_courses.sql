-- Create courses table
create table if not exists public.courses (
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
  user_id uuid not null references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.courses enable row level security;

-- Public can read courses with status = 'Public'
create policy "Anyone can view public courses"
  on public.courses for select
  using (status = 'Public');

-- Authenticated admin can read ALL courses (including Draft/Archive)
create policy "Admin can view all courses"
  on public.courses for select
  using (auth.uid() = user_id);

-- Admin can insert their own courses
create policy "Admin can insert courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

-- Admin can update their own courses
create policy "Admin can update courses"
  on public.courses for update
  using (auth.uid() = user_id);

-- Admin can delete their own courses
create policy "Admin can delete courses"
  on public.courses for delete
  using (auth.uid() = user_id);
