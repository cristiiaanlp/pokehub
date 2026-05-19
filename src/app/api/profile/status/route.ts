// GET /api/profile/status — quick checks for the auth UI
// Returns whether the current user needs onboarding (no username or
// onboarded_at IS NULL) and their unread notification count.

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ needs_onboarding: false, unread: 0 });
  const { data: u } = await sb.auth.getUser();
  const user = u.user;
  if (!user) return NextResponse.json({ needs_onboarding: false, unread: 0 });

  const [{ data: profile }, { count: unread }] = await Promise.all([
    sb.from('profiles').select('username, onboarded_at').eq('id', user.id).maybeSingle(),
    sb
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false),
  ]);

  const needs = !profile?.username || !profile?.onboarded_at;
  return NextResponse.json({
    needs_onboarding: needs,
    unread: unread ?? 0,
  });
}
