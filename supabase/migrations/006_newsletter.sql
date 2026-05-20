-- ═══════════════════════════════════════════════════════════════════════
--  PokéHub · Migración 006 · Newsletter
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists newsletter_subscribers (
  email text primary key,
  user_id uuid references auth.users on delete set null,   -- nullable: anónimos también pueden suscribirse
  locale text default 'es' not null,                       -- 'es' | 'en' | 'fr' | 'de' | 'it'
  confirmed boolean default false not null,
  confirm_token text,                                       -- single-use, expira tras 7d
  confirm_expires_at timestamptz,
  unsubscribe_token text not null default encode(gen_random_bytes(16), 'hex'),
  subscribed_at timestamptz default now() not null,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

create index if not exists newsletter_subscribers_confirmed_idx
  on newsletter_subscribers (confirmed) where confirmed = true;
create index if not exists newsletter_subscribers_locale_idx
  on newsletter_subscribers (locale, confirmed);

alter table newsletter_subscribers enable row level security;

-- Solo service_role lee/escribe. INSERT públicos van via endpoint server
-- que valida email + envía confirmación.
-- (sin policies = bloqueado para anon)
