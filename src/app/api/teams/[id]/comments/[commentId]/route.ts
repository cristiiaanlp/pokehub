// DELETE /api/teams/[id]/comments/[commentId] — owner of comment can delete

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string; commentId: string } }
) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // RLS bloquea borrar comentarios de otros automáticamente.
  const { error } = await sb
    .from('team_comments')
    .delete()
    .eq('id', ctx.params.commentId)
    .eq('user_id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
