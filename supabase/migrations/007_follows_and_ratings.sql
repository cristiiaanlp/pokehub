-- ═══════════════════════════════════════════════════════════════════════
--  PokéHub · Migración 007 · Follow system + Team ratings
-- ═══════════════════════════════════════════════════════════════════════
--  Ejecuta en: Supabase Dashboard → SQL Editor → New query → Run
--  ANTES: ejecuta 002, 003, 004, 005 y 006.
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Follow system
create table if not exists follows (
  follower_id uuid references auth.users on delete cascade not null,
  followed_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create index if not exists follows_follower_idx on follows (follower_id);
create index if not exists follows_followed_idx on follows (followed_id);

alter table follows enable row level security;

drop policy if exists "anyone reads follows" on follows;
create policy "anyone reads follows" on follows for select using (true);

drop policy if exists "auth users follow" on follows;
create policy "auth users follow" on follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists "auth users unfollow" on follows;
create policy "auth users unfollow" on follows
  for delete using (auth.uid() = follower_id);


-- 2. Team ratings (1-10 stars)
create table if not exists team_ratings (
  user_id uuid references auth.users on delete cascade not null,
  team_id uuid references teams on delete cascade not null,
  rating int not null check (rating between 1 and 10),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  primary key (user_id, team_id)
);

create index if not exists team_ratings_team_idx on team_ratings (team_id);

alter table team_ratings enable row level security;

drop policy if exists "anyone reads ratings" on team_ratings;
create policy "anyone reads ratings" on team_ratings for select using (true);

drop policy if exists "auth users rate" on team_ratings;
create policy "auth users rate" on team_ratings
  for insert with check (auth.uid() = user_id);

drop policy if exists "auth users update rating" on team_ratings;
create policy "auth users update rating" on team_ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "auth users delete rating" on team_ratings;
create policy "auth users delete rating" on team_ratings
  for delete using (auth.uid() = user_id);


-- 3. View materializada-like: aggregated ratings por team
-- (No usamos materialized views por simplicidad; calculamos on-read).
-- Para optimizar si hay mucho tráfico, se puede convertir a MV con
-- refresh cada 5min.
