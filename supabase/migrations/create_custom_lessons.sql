-- ============================================
-- Custom Lessons — user-created lessons via the visual creator
-- ============================================

-- 1. Tables

create table if not exists public.custom_lessons (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text not null default '',
  category    text not null default 'primary'
    check (category in ('primary', 'highschool')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_custom_lessons_creator
  on public.custom_lessons(creator_id);

create table if not exists public.custom_sections (
  id         uuid primary key default gen_random_uuid(),
  lesson_id  uuid not null references public.custom_lessons(id) on delete cascade,
  position   int not null default 0,
  type       text not null check (type in ('match_pairs', 'comparison', 'latex')),
  title      text not null default '',
  config     jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_sections_lesson
  on public.custom_sections(lesson_id, position);

create table if not exists public.lesson_shares (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.custom_lessons(id) on delete cascade,
  shared_with uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(lesson_id, shared_with)
);

create index if not exists idx_lesson_shares_user
  on public.lesson_shares(shared_with);
create index if not exists idx_lesson_shares_lesson
  on public.lesson_shares(lesson_id);

-- 2. RLS

alter table public.custom_lessons enable row level security;
alter table public.custom_sections enable row level security;
alter table public.lesson_shares enable row level security;

-- custom_lessons: creator full access
create policy "Creator full access on custom_lessons"
  on public.custom_lessons for all
  using (creator_id = auth.uid());

-- custom_lessons: shared users can read
create policy "Shared users can read custom_lessons"
  on public.custom_lessons for select
  using (
    id in (select lesson_id from public.lesson_shares where shared_with = auth.uid())
  );

-- custom_sections: readable if lesson is visible
create policy "Sections readable via lesson access"
  on public.custom_sections for select
  using (
    lesson_id in (
      select id from public.custom_lessons
      where creator_id = auth.uid()
         or id in (select lesson_id from public.lesson_shares where shared_with = auth.uid())
    )
  );

-- custom_sections: creator can write
create policy "Creator can insert sections"
  on public.custom_sections for insert
  with check (
    lesson_id in (select id from public.custom_lessons where creator_id = auth.uid())
  );

create policy "Creator can update sections"
  on public.custom_sections for update
  using (
    lesson_id in (select id from public.custom_lessons where creator_id = auth.uid())
  );

create policy "Creator can delete sections"
  on public.custom_sections for delete
  using (
    lesson_id in (select id from public.custom_lessons where creator_id = auth.uid())
  );

-- lesson_shares: creator manages shares
create policy "Creator manages shares"
  on public.lesson_shares for all
  using (
    lesson_id in (select id from public.custom_lessons where creator_id = auth.uid())
  );

-- lesson_shares: shared user can see own shares
create policy "Shared user can see own shares"
  on public.lesson_shares for select
  using (shared_with = auth.uid());
