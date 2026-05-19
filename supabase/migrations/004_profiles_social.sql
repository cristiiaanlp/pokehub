-- ═══════════════════════════════════════════════════════════════════════
--  PokéHub · Migración 004 · Perfiles + Social (likes/comments) + Notif
-- ═══════════════════════════════════════════════════════════════════════
--  Ejecuta esto en: Supabase Dashboard → SQL Editor → New query → Run
--  ANTES: ejecuta 002 y 003 si aún no lo hiciste.
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Perfiles públicos (1:1 con auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_pokemon_id int,                              -- pokémon que usa como avatar
  onboarded_at timestamptz,                           -- null = aún no ha hecho onboarding
  badges jsonb default '[]'::jsonb not null,          -- ['first_team', 'meta_10', ...]
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists profiles_username_idx on profiles (lower(username));

alter table profiles enable row level security;

-- Cualquiera lee perfiles (son páginas públicas)
drop policy if exists "anyone reads profiles" on profiles;
create policy "anyone reads profiles" on profiles
  for select using (true);

-- Solo el dueño edita su perfil
drop policy if exists "owner writes own profile" on profiles;
create policy "owner writes own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles para users existentes
insert into profiles (id)
  select id from auth.users
  on conflict do nothing;


-- 2. Likes en teams compartidos
create table if not exists team_likes (
  user_id uuid references auth.users on delete cascade not null,
  team_id uuid references teams on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (user_id, team_id)
);

create index if not exists team_likes_team_idx on team_likes (team_id);

alter table team_likes enable row level security;

-- Cualquiera lee likes (para counts agregados)
drop policy if exists "anyone reads likes" on team_likes;
create policy "anyone reads likes" on team_likes for select using (true);

-- Solo logged-in inserta/borra su propio like
drop policy if exists "auth users like" on team_likes;
create policy "auth users like" on team_likes
  for insert with check (auth.uid() = user_id);
drop policy if exists "auth users unlike" on team_likes;
create policy "auth users unlike" on team_likes
  for delete using (auth.uid() = user_id);


-- 3. Comentarios en teams
create table if not exists team_comments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  body text not null check (length(trim(body)) between 1 and 1000),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists team_comments_team_idx
  on team_comments (team_id, created_at desc);

alter table team_comments enable row level security;

drop policy if exists "anyone reads comments" on team_comments;
create policy "anyone reads comments" on team_comments for select using (true);

drop policy if exists "auth users post comments" on team_comments;
create policy "auth users post comments" on team_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "owner edits comment" on team_comments;
create policy "owner edits comment" on team_comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "owner deletes comment" on team_comments;
create policy "owner deletes comment" on team_comments
  for delete using (auth.uid() = user_id);


-- 4. Notificaciones in-app
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  kind text not null,                                 -- 'comment' | 'like' | 'badge' | 'admin'
  title text not null,
  body text,
  link_url text,
  is_read boolean default false not null,
  created_at timestamptz default now() not null
);

create index if not exists notifications_user_idx
  on notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on notifications (user_id) where is_read = false;

alter table notifications enable row level security;

-- Solo el dueño lee/escribe sus propias notificaciones
drop policy if exists "owner reads notifs" on notifications;
create policy "owner reads notifs" on notifications
  for select using (auth.uid() = user_id);

drop policy if exists "owner updates notifs" on notifications;
create policy "owner updates notifs" on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "owner deletes notifs" on notifications;
create policy "owner deletes notifs" on notifications
  for delete using (auth.uid() = user_id);

-- INSERT lo hace el service_role desde el backend (bypassa RLS).
-- No exponemos una policy de INSERT pública para que los users no puedan
-- spamear notifs a otros usuarios.
