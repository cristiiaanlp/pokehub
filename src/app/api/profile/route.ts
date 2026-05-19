// PATCH /api/profile — update current user's profile.
// Uses the user's own session (not service_role), so RLS handles auth.

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateUsername } from '@/lib/profiles';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

interface PatchBody {
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  avatar_pokemon_id?: number | null;
  onboarded_at?: string | null;
}

export async function PATCH(req: Request) {
  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  }
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // 20 profile updates / 5 min — uso normal son 1-2, evita ataques de username squatting
  const rl = await rateLimit(`profile:${getRateLimitKey(req, user.id)}`, 20, 300);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Demasiadas actualizaciones de perfil. Espera ${rl.resetIn}s.` },
      { status: 429, headers: { 'retry-after': String(rl.resetIn) } }
    );
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ('username' in body) {
    if (body.username === null || body.username === '' || body.username === undefined) {
      update.username = null;
    } else {
      const v = validateUsername(body.username);
      if (!v.ok) {
        return NextResponse.json({ error: v.reason }, { status: 400 });
      }
      // Comprobamos disponibilidad (case-insensitive)
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data: taken } = await admin
          .from('profiles')
          .select('id')
          .ilike('username', v.normalized)
          .neq('id', user.id)
          .maybeSingle();
        if (taken) {
          return NextResponse.json(
            { error: 'Ese username ya está cogido' },
            { status: 409 }
          );
        }
      }
      update.username = v.normalized;
    }
  }
  if ('display_name' in body) {
    update.display_name = body.display_name ? String(body.display_name).slice(0, 40) : null;
  }
  if ('bio' in body) {
    update.bio = body.bio ? String(body.bio).slice(0, 200) : null;
  }
  if ('avatar_pokemon_id' in body) {
    update.avatar_pokemon_id =
      typeof body.avatar_pokemon_id === 'number' && body.avatar_pokemon_id > 0
        ? body.avatar_pokemon_id
        : null;
  }
  if ('onboarded_at' in body) {
    update.onboarded_at = body.onboarded_at;
  }

  // Upsert por si no existe aún la row del profile.
  const { error } = await sb.from('profiles').upsert({
    id: user.id,
    ...update,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
