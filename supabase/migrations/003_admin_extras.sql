-- ═══════════════════════════════════════════════════════════════════════
--  PokéHub · Migración 003 · Admin extras (audit + announcements + featured)
-- ═══════════════════════════════════════════════════════════════════════
--  Ejecuta esto en: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Log de acciones de admin (auditable)
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,                  -- ej: 'team.delete', 'announcement.publish'
  target_type text,                      -- ej: 'team', 'user'
  target_id text,                        -- id del recurso afectado
  details jsonb,                         -- contexto extra
  created_at timestamptz default now() not null
);
create index if not exists admin_audit_log_created_idx on admin_audit_log (created_at desc);
create index if not exists admin_audit_log_action_idx on admin_audit_log (action);

-- Solo service_role lee/escribe esta tabla
alter table admin_audit_log enable row level security;
-- (sin policies = bloqueado para todos. service_role bypassa RLS por defecto)

-- 2. Anuncios globales (banner site-wide + maintenance mode)
create table if not exists site_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  severity text default 'info' not null,           -- 'info' | 'warning' | 'error' | 'maintenance'
  link_url text,
  link_label text,
  is_active boolean default true not null,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  created_by text                                  -- email del admin que lo creó
);
create index if not exists site_announcements_active_idx
  on site_announcements (is_active, starts_at desc) where is_active = true;

alter table site_announcements enable row level security;

-- Cualquiera puede LEER anuncios activos vigentes (banner público)
drop policy if exists "public read active announcements" on site_announcements;
create policy "public read active announcements" on site_announcements
  for select
  using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

-- 3. Featured teams (curado por admin para landing/community)
alter table teams
  add column if not exists is_featured boolean default false not null,
  add column if not exists featured_at timestamptz,
  add column if not exists featured_note text;

create index if not exists teams_featured_idx
  on teams (is_featured, featured_at desc) where is_featured = true;

-- RLS: cualquiera lee teams featured (incluso si no son públicos — necesario
-- porque marcamos featured para destacarlos en /community y la landing).
drop policy if exists "anyone reads featured teams" on teams;
create policy "anyone reads featured teams" on teams
  for select
  using (is_featured = true);
