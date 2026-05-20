// GET    /api/follows/[userId] — devuelve { followers, following, isFollowing }
// POST   /api/follows/[userId] — toggle follow del user actual al [userId]

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: { userId: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ followers: 0, following: 0, isFollowing: false });

  const targetId = ctx.params.userId;
  const { data: userData } = await sb.auth.getUser();
  const me = userData.user?.id;

  const [{ count: followers }, { count: following }, mine] = await Promise.all([
    sb.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', targetId),
    sb.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetId),
    me
      ? sb.from('follows').select('follower_id').eq('follower_id', me).eq('followed_id', targetId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return NextResponse.json({
    followers: followers ?? 0,
    following: following ?? 0,
    isFollowing: !!mine?.data,
  });
}

export async function POST(req: Request, ctx: { params: { userId: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });

  const { data: userData } = await sb.auth.getUser();
  const me = userData.user;
  if (!me) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const targetId = ctx.params.userId;
  if (me.id === targetId) {
    return NextResponse.json({ error: 'cannot_follow_self' }, { status: 400 });
  }

  // 20 follow toggles / 10 min
  const rl = await rateLimit(`follow:${getRateLimitKey(req, me.id)}`, 20, 600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Demasiados follows. Espera ${rl.resetIn}s.` },
      { status: 429 }
    );
  }

  // Toggle: si existe, borra; si no, inserta
  const { data: existing } = await sb
    .from('follows')
    .select('follower_id')
    .eq('follower_id', me.id)
    .eq('followed_id', targetId)
    .maybeSingle();

  if (existing) {
    await sb.from('follows').delete().eq('follower_id', me.id).eq('followed_id', targetId);
    return NextResponse.json({ following: false });
  }

  const { error } = await sb
    .from('follows')
    .insert({ follower_id: me.id, followed_id: targetId });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notif al followed via service_role
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from('notifications').insert({
      user_id: targetId,
      kind: 'admin', // reusamos kind genérico
      title: '¡Nuevo follower!',
      body: 'Alguien empezó a seguirte.',
      link_url: `/u/${me.user_metadata?.username ?? ''}`,
    });
  }

  return NextResponse.json({ following: true });
}
