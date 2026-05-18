-- ═══════════════════════════════════════════════════════════════════════
--  PokéHub · Migración 002 · Team sharing público
-- ═══════════════════════════════════════════════════════════════════════
--  Añade soporte para hacer equipos públicos con URL única.
--  Ejecuta esto en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Nuevas columnas en teams
alter table teams
  add column if not exists is_public boolean default false not null,
  add column if not exists share_slug text;

-- 2. Slug único para evitar colisiones
create unique index if not exists teams_share_slug_unique
  on teams (share_slug)
  where share_slug is not null;

-- 3. Política RLS: cualquiera puede LEER equipos marcados como públicos
--    (los privados siguen solo accesibles por el dueño)
drop policy if exists "anyone reads public teams" on teams;
create policy "anyone reads public teams" on teams
  for select
  using (is_public = true);

-- 4. Verifica que las políticas anteriores siguen activas para owners
--    (esto NO sobrescribe la política "users see own teams" — coexisten)
