// POST /api/activity/log — endpoint para que el cliente registre eventos
// que SOLO suceden client-side (ej. publicar un team via makeTeamPublic).
//
// Solo aceptamos un set limitado de `kind` para que el client no pueda
// inyectar tipos arbitrarios. La verificación de "el user realmente hizo
// lo que dice" se hace por la verdad del estado en BBDD.

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { logActivity } from '@/lib/activity';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const ALLOWED_KINDS = new Set(['team_published', 'first_team', 'profile_created']);

export async function POST(req: Request) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // 30 events / 10 min per user. Más que de sobra para uso normal.
  const rl = await rateLimit(`activity:${getRateLimitKey(req, user.id)}`, 30, 600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many events. Wait ${rl.resetIn}s.` },
      { status: 429 }
    );
  }

  let body: { kind?: string; teamId?: string; teamName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.kind || !ALLOWED_KINDS.has(body.kind)) {
    return NextResponse.json({ error: 'invalid_kind' }, { status: 400 });
  }

  // Verificación adicional para team_published: el team debe existir + ser
  // del user + estar marcado como público.
  if (body.kind === 'team_published') {
    if (!body.teamId) {
      return NextResponse.json({ error: 'teamId_required' }, { status: 400 });
    }
    const { data: team } = await sb
      .from('teams')
      .select('user_id, is_public, name')
      .eq('id', body.teamId)
      .maybeSingle();
    if (!team || team.user_id !== user.id || !team.is_public) {
      return NextResponse.json({ error: 'not_eligible' }, { status: 403 });
    }
    await logActivity(user.id, 'team_published', {
      teamId: body.teamId,
      teamName: team.name,
    });
  } else {
    await logActivity(user.id, body.kind as any, {
      teamId: body.teamId,
      teamName: body.teamName,
    });
  }

  return NextResponse.json({ ok: true });
}
