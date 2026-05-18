// Supabase client preparado — sin conectar todavía.
// Rellena NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local
// y descomenta el bloque createClient cuando estés listo.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_client) {
    _client = createClient(url!, anon!, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return _client;
}

// Tablas previstas (crear en Supabase cuando se conecte):
//
// create table teams (
//   id uuid primary key default gen_random_uuid(),
//   user_id uuid references auth.users not null,
//   name text not null,
//   format text,
//   members jsonb not null,
//   created_at timestamptz default now(),
//   updated_at timestamptz default now()
// );
//
// create table favorites (
//   user_id uuid references auth.users not null,
//   pokemon_id int not null,
//   created_at timestamptz default now(),
//   primary key (user_id, pokemon_id)
// );
