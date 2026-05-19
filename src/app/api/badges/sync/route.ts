// POST /api/badges/sync — recalcula los badges del usuario actual basándose
// en su estado real (teams creados, publicados, favoritos, etc).
// Idempotente: solo añade los que faltan.

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  const { data: u } = await sb.auth.getUser();
  const user = u.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'service_role_not_configured' }, { status: 503 });

  // Estado actual del usuario
  const [
    { count: teamsCount },
    { count: publicTeamsCount },
    { count: favsCount },
    { data: profile },
    { count: commentsCount },
    { data: featuredTeams },
  ] = await Promise.all([
    admin.from('teams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    admin
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_public', true),
    admin.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    admin.from('profiles').select('badges, created_at').eq('id', user.id).maybeSingle(),
    admin.from('team_comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    admin.from('teams').select('id').eq('user_id', user.id).eq('is_featured', true).limit(1),
  ]);

  const current: string[] = Array.isArray(profile?.badges) ? profile!.badges : [];
  const earned = new Set(current);

  // Reglas
  if ((teamsCount ?? 0) >= 1) earned.add('first_team');
  if ((publicTeamsCount ?? 0) >= 1) earned.add('team_published');
  if ((featuredTeams?.length ?? 0) >= 1) earned.add('team_featured');
  if ((favsCount ?? 0) >= 20) earned.add('favorite_collector');
  if ((commentsCount ?? 0) >= 1) earned.add('social_butterfly');

  // Pionero: cuenta creada en los primeros 30 días desde el lanzamiento.
  // Como no tenemos fecha de lanzamiento, lo aplicamos a cualquier user
  // creado antes del 2026-07-01.
  if (profile?.created_at && new Date(profile.created_at) < new Date('2026-07-01')) {
    earned.add('pioneer');
  }

  // Likes >= 10 en algún equipo del user
  const { data: teamIds } = await admin
    .from('teams')
    .select('id')
    .eq('user_id', user.id);
  if (teamIds && teamIds.length > 0) {
    const ids = (teamIds as { id: string }[]).map((t) => t.id);
    const { data: likesAgg } = await admin
      .from('team_likes')
      .select('team_id')
      .in('team_id', ids);
    const byTeam: Record<string, number> = {};
    for (const l of (likesAgg ?? []) as { team_id: string }[]) {
      byTeam[l.team_id] = (byTeam[l.team_id] ?? 0) + 1;
    }
    const maxLikes = Math.max(0, ...Object.values(byTeam));
    if (maxLikes >= 10) earned.add('liked_10');
  }

  // TypeMaster — leemos puntos de su row en la tabla type_master_scores
  // (si existe). Falla en silencio si no hay tabla.
  try {
    const { data: tm } = await admin
      .from('type_master_scores')
      .select('best_score')
      .eq('user_id', user.id)
      .order('best_score', { ascending: false })
      .limit(1)
      .maybeSingle();
    const best = (tm as { best_score?: number } | null)?.best_score ?? 0;
    if (best >= 1000) earned.add('typemaster_gold');
    else if (best >= 500) earned.add('typemaster_silver');
  } catch {
    /* tabla no existe en esta instalación — ok */
  }

  // Solo update si hay cambios
  const next = Array.from(earned).sort();
  const changed =
    next.length !== current.length || next.some((b, i) => b !== current[i]);
  const newlyEarned = next.filter((b) => !current.includes(b));

  if (changed) {
    await admin
      .from('profiles')
      .update({ badges: next, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    // Notif por cada badge nuevo
    if (newlyEarned.length > 0) {
      await admin.from('notifications').insert(
        newlyEarned.map((b) => ({
          user_id: user.id,
          kind: 'badge',
          title: '¡Nuevo logro desbloqueado!',
          body: `Has conseguido el logro "${b}".`,
          link_url: '/me',
        }))
      );
    }
  }

  return NextResponse.json({ badges: next, newlyEarned });
}
