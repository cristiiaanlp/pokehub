// GET   /api/teams/[id]/likes — count + whether current user liked
// POST  /api/teams/[id]/likes — toggle (like or unlike)

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { grantBadge } from '@/lib/profiles';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ count: 0, liked: false });
  const teamId = ctx.params.id;

  const [{ count }, { data: u }] = await Promise.all([
    sb
      .from('team_likes')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId),
    sb.auth.getUser(),
  ]);

  let liked = false;
  if (u?.user) {
    const { data: row } = await sb
      .from('team_likes')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('user_id', u.user.id)
      .maybeSingle();
    liked = !!row;
  }

  return NextResponse.json({ count: count ?? 0, liked });
}

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const teamId = ctx.params.id;

  // Toggle: si ya existe, borra; si no, inserta.
  const { data: existing } = await sb
    .from('team_likes')
    .select('user_id')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await sb.from('team_likes').delete().eq('team_id', teamId).eq('user_id', user.id);
    const { count } = await sb
      .from('team_likes')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);
    return NextResponse.json({ liked: false, count: count ?? 0 });
  }

  const { error } = await sb
    .from('team_likes')
    .insert({ team_id: teamId, user_id: user.id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notificar al dueño y grant badge si llega a 10 likes
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
        kind: 'like',
        title: 'Nuevo like',
        body: `A alguien le ha gustado tu equipo "${team.name}".`,
        link_url: `/teams/${teamId}`,
      });
    }
    if (team) {
      const { count } = await admin
        .from('team_likes')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);
      if ((count ?? 0) >= 10) {
        await grantBadge(team.user_id, 'liked_10');
      }
    }
  }

  const { count } = await sb
    .from('team_likes')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId);
  return NextResponse.json({ liked: true, count: count ?? 0 });
}
