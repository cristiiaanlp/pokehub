-- ═══════════════════════════════════════════════════════════════════════
--  PokéHub · Migración 005 · Activity feed
-- ═══════════════════════════════════════════════════════════════════════
--  Ejecuta esto en: Supabase Dashboard → SQL Editor → New query → Run
--  ANTES: ejecuta 002, 003 y 004 si aún no lo hiciste.
-- ═══════════════════════════════════════════════════════════════════════

-- Tabla pública de eventos de actividad. Visible en perfiles públicos.
create table if not exists activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  kind text not null,                     -- 'team_published' | 'badge_earned' | 'team_featured' | 'first_team'
  payload jsonb default '{}'::jsonb not null,  -- contexto: { teamId, teamName, badgeId, ... }
  created_at timestamptz default now() not null
);

create index if not exists activity_events_user_idx
  on activity_events (user_id, created_at desc);
create index if not exists activity_events_recent_idx
  on activity_events (created_at desc);

alter table activity_events enable row level security;

-- Cualquiera puede LEER el activity feed (es público — son perfiles públicos)
drop policy if exists "anyone reads activity" on activity_events;
create policy "anyone reads activity" on activity_events for select using (true);

-- INSERT solo desde el backend (service_role bypassa RLS). Los users
-- no pueden inyectar eventos directamente — los crea el servidor en
-- respuesta a acciones reales.

-- No exponemos UPDATE/DELETE públicos. Si en el futuro queremos "borrar
-- mi actividad", añadiremos endpoint admin con policy específica.
