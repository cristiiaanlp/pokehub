// GET    /api/collection — devuelve la colección del usuario autenticado
// PATCH  /api/collection { pokemon_id, owned?, shiny?, notes? } — toggle/update

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ entries: [] });
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return NextResponse.json({ entries: [] });
  const { data } = await sb
    .from('pokemon_collection')
    .select('pokemon_id, owned, shiny, notes')
    .eq('user_id', u.user.id);
  return NextResponse.json({ entries: data ?? [] });
}

export async function PATCH(req: Request) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // 100 cambios / 5 min — coleccionistas pueden marcar muchos en batch
  const rl = await rateLimit(`coll:${getRateLimitKey(req, user.id)}`, 100, 300);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Demasiados cambios. Espera ${rl.resetIn}s.` },
      { status: 429 }
    );
  }

  let body: {
    pokemon_id?: number;
    owned?: boolean;
    shiny?: boolean;
    notes?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const id = body.pokemon_id;
  if (typeof id !== 'number' || id < 1 || id > 1025) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    user_id: user.id,
    pokemon_id: id,
    updated_at: new Date().toISOString(),
  };
  if (typeof body.owned === 'boolean') patch.owned = body.owned;
  if (typeof body.shiny === 'boolean') patch.shiny = body.shiny;
  if (typeof body.notes === 'string' || body.notes === null) patch.notes = body.notes;

  // Upsert
  const { error } = await sb
    .from('pokemon_collection')
    .upsert(patch, { onConflict: 'user_id,pokemon_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
