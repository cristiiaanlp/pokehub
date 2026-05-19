// GET  /api/teams/[id]/comments — list with author profile data
// POST /api/teams/[id]/comments — create (auth required)

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { grantBadge } from '@/lib/profiles';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ items: [] });
  const teamId = ctx.params.id;

  const { data, error } = await sb
    .from('team_comments')
    .select('id, user_id, body, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ items: [], error: error.message });

  const rows = (data ?? []) as {
    id: string;
    user_id: string;
    body: string;
    created_at: string;
  }[];

  // Resolve author profiles in one shot
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  let profilesMap: Record<
    string,
    { username: string | null; display_name: string | null; avatar_pokemon_id: number | null }
  > = {};
  if (ids.length > 0) {
    const { data: profs } = await sb
      .from('profiles')
      .select('id, username, display_name, avatar_pokemon_id')
      .in('id', ids);
    for (const p of (profs ?? []) as any[]) {
      profilesMap[p.id] = {
        username: p.username,
        display_name: p.display_name,
        avatar_pokemon_id: p.avatar_pokemon_id,
      };
    }
  }

  const items = rows.map((r) => ({
    id: r.id,
    body: r.body,
    created_at: r.created_at,
    author: profilesMap[r.user_id] ?? {
      username: null,
      display_name: null,
      avatar_pokemon_id: null,
    },
    author_id: r.user_id,
  }));

  return NextResponse.json({ items });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // Max 10 comments/min per user → previene spam
  const rl = await rateLimit(`comments:${getRateLimitKey(req, user.id)}`, 10, 60);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Demasiados comentarios. Espera ${rl.resetIn}s.` },
      { status: 429, headers: { 'retry-after': String(rl.resetIn) } }
    );
  }

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const text = (body.body ?? '').trim();
  if (text.length < 1 || text.length > 1000) {
    return NextResponse.json(
      { error: 'El comentario debe tener entre 1 y 1000 caracteres' },
      { status: 400 }
    );
  }

  const teamId = ctx.params.id;
  const { data: inserted, error } = await sb
    .from('team_comments')
    .insert({ team_id: teamId, user_id: user.id, body: text })
    .select('id, body, created_at')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notif al dueño + grant badge si es el primer comentario del user
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: team } = await admin
      .from('teams')
      .select('user_id, name')
      .eq('id', teamId)
      .maybeSingle();
    if (team && team.user_id !== user.id) {
      await admin.from('notifications').insert({
        user_id: team.user_id,
        kind: 'comment',
        title: 'Nuevo comentario',
        body: `Alguien comentó en "${team.name}".`,
        link_url: `/teams/${teamId}`,
      });
    }
    // primer comentario → social_butterfly
    const { count } = await admin
      .from('team_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if (count === 1) {
      await grantBadge(user.id, 'social_butterfly');
    }
  }

  // Devuelve el comentario con su author embebido
  const { data: prof } = await sb
    .from('profiles')
    .select('username, display_name, avatar_pokemon_id')
    .eq('id', user.id)
    .maybeSingle();

  return NextResponse.json({
    comment: {
      id: inserted.id,
      body: inserted.body,
      created_at: inserted.created_at,
      author: prof ?? {
        username: null,
        display_name: null,
        avatar_pokemon_id: null,
      },
      author_id: user.id,
    },
  });
}
