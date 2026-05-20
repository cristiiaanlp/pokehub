// GET /api/teams/[id]/rating — devuelve {average, count, myRating}
// POST /api/teams/[id]/rating { rating: 1-10 } — set/update tu rating

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ average: null, count: 0, myRating: null });

  const teamId = ctx.params.id;
  const { data: userData } = await sb.auth.getUser();
  const userId = userData.user?.id;

  // Avg + count via select
  const { data: allRatings } = await sb
    .from('team_ratings')
    .select('rating')
    .eq('team_id', teamId);

  const ratings = (allRatings ?? []) as { rating: number }[];
  const count = ratings.length;
  const average =
    count === 0 ? null : ratings.reduce((s, r) => s + r.rating, 0) / count;

  let myRating: number | null = null;
  if (userId) {
    const { data: mine } = await sb
      .from('team_ratings')
      .select('rating')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .maybeSingle();
    myRating = mine?.rating ?? null;
  }

  return NextResponse.json({
    average,
    count,
    myRating,
  });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });

  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // 30 rating changes / 10 min
  const rl = await rateLimit(`rating:${getRateLimitKey(req, user.id)}`, 30, 600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Demasiados ratings. Espera ${rl.resetIn}s.` },
      { status: 429 }
    );
  }

  let body: { rating?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const rating = body.rating;
  if (typeof rating !== 'number' || rating < 1 || rating > 10 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: 'rating_must_be_1_to_10' }, { status: 400 });
  }

  // Don't allow self-rating
  const { data: team } = await sb
    .from('teams')
    .select('user_id')
    .eq('id', ctx.params.id)
    .maybeSingle();
  if (!team) return NextResponse.json({ error: 'team_not_found' }, { status: 404 });
  if (team.user_id === user.id) {
    return NextResponse.json(
      { error: 'cannot_rate_own_team' },
      { status: 400 }
    );
  }

  // Upsert
  const { error } = await sb
    .from('team_ratings')
    .upsert(
      {
        user_id: user.id,
        team_id: ctx.params.id,
        rating,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,team_id' }
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  await sb
    .from('team_ratings')
    .delete()
    .eq('user_id', user.id)
    .eq('team_id', ctx.params.id);
  return NextResponse.json({ ok: true });
}
