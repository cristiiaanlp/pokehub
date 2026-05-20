-- ═══════════════════════════════════════════════════════════════════════
--  PokéHub · Migración 008 · Pokémon Collection Tracker (Living Pokédex)
-- ═══════════════════════════════════════════════════════════════════════
--  Ejecuta en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════

-- Cada user puede marcar cualquiera de los 1025 Pokémon como "tenido"
-- y/o "shiny tenido". Trackea progreso hacia Living Pokédex.

create table if not exists pokemon_collection (
  user_id uuid references auth.users on delete cascade not null,
  pokemon_id int not null check (pokemon_id between 1 and 1025),
  owned boolean default false not null,
  shiny boolean default false not null,
  notes text,
  updated_at timestamptz default now() not null,
  primary key (user_id, pokemon_id)
);

create index if not exists pokemon_collection_user_idx
  on pokemon_collection (user_id) where owned = true;

alter table pokemon_collection enable row level security;

-- Cualquiera lee colecciones (las páginas /u/[username] muestran progreso)
drop policy if exists "anyone reads collection" on pokemon_collection;
create policy "anyone reads collection" on pokemon_collection
  for select using (true);

-- Solo el dueño escribe su propia colección
drop policy if exists "owner writes collection" on pokemon_collection;
create policy "owner writes collection" on pokemon_collection
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
