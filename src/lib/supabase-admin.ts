// Server-only Supabase client with full admin access (SERVICE ROLE KEY).
// BYPASSES ALL ROW LEVEL SECURITY. Use only inside route handlers AFTER
// verifying the caller is an admin.
//
// Required env vars (server-only, NOT prefixed with NEXT_PUBLIC_):
//   SUPABASE_SERVICE_ROLE_KEY  — get from Supabase Dashboard → Settings → API
//                                 (the "service_role" "secret" key, NOT anon)

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isAdminClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
