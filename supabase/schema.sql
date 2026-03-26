-- ============================================
-- PART 1: Create all tables (order matters for foreign keys)
-- ============================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.teacher_links (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamptz default now(),
  unique(student_id, teacher_id)
);

create table if not exists public.lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.game_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  game_id text not null,
  score integer not null,
  max_score integer not null,
  accuracy real not null,
  attempted_at timestamptz default now()
);

-- ============================================
-- PART 2: Enable RLS and create policies
-- ============================================

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.game_attempts enable row level security;
alter table public.teacher_links enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Lesson progress policies
create policy "Users can view own progress"
  on public.lesson_progress for select using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.lesson_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.lesson_progress for update using (auth.uid() = user_id);

create policy "Teachers can view shared student progress"
  on public.lesson_progress for select using (
    exists (
      select 1 from public.teacher_links
      where teacher_id = auth.uid()
        and student_id = lesson_progress.user_id
        and status = 'accepted'
    )
  );

-- Game attempts policies
create policy "Users can view own attempts"
  on public.game_attempts for select using (auth.uid() = user_id);

create policy "Users can insert own attempts"
  on public.game_attempts for insert with check (auth.uid() = user_id);

create policy "Teachers can view shared student attempts"
  on public.game_attempts for select using (
    exists (
      select 1 from public.teacher_links
      where teacher_id = auth.uid()
        and student_id = game_attempts.user_id
        and status = 'accepted'
    )
  );

-- Teacher links policies
create policy "Users can view own links as student"
  on public.teacher_links for select using (auth.uid() = student_id);

create policy "Users can view own links as teacher"
  on public.teacher_links for select using (auth.uid() = teacher_id);

create policy "Students can create links"
  on public.teacher_links for insert with check (auth.uid() = student_id);

create policy "Teachers can update link status"
  on public.teacher_links for update using (auth.uid() = teacher_id);

create policy "Students can delete own links"
  on public.teacher_links for delete using (auth.uid() = student_id);

-- ============================================
-- PART 3: Auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
