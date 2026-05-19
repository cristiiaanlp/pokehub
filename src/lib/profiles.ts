// Profile helpers — server-side reads of the public.profiles table.

import { getSupabaseServer } from './supabase-server';
import { getSupabaseAdmin } from './supabase-admin';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_pokemon_id: number | null;
  badges: string[];
  onboarded_at: string | null;
  created_at: string;
}

export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const sb = getSupabaseServer();
  if (!sb) return null;
  const { data } = await sb
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const sb = getSupabaseServer();
  if (!sb) return null;
  const { data } = await sb
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/;
const RESERVED = new Set([
  'admin',
  'login',
  'logout',
  'signup',
  'me',
  'settings',
  'api',
  'auth',
  'user',
  'users',
  'pokehub',
  'public',
  'static',
  'support',
  'about',
]);

export function validateUsername(raw: string): {
  ok: boolean;
  normalized: string;
  reason?: string;
} {
  const normalized = raw.trim().toLowerCase();
  if (!USERNAME_RE.test(normalized)) {
    return {
      ok: false,
      normalized,
      reason:
        '3-20 chars · solo letras minúsculas, números, guion bajo y medio',
    };
  }
  if (RESERVED.has(normalized)) {
    return { ok: false, normalized, reason: 'Nombre reservado' };
  }
  return { ok: true, normalized };
}

// Admin-only: increment-and-fetch badges via service_role.
export async function grantBadge(
  userId: string,
  badge: string
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const { data: prev } = await admin
    .from('profiles')
    .select('badges')
    .eq('id', userId)
    .maybeSingle();
  const current: string[] = Array.isArray(prev?.badges) ? prev!.badges : [];
  if (current.includes(badge)) return false;
  const next = [...current, badge];
  await admin.from('profiles').update({ badges: next }).eq('id', userId);
  return true;
}
