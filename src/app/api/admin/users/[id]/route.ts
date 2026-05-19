// DELETE /api/admin/users/[id]
// Hard delete user + cascade their teams + favorites. Audited.

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { logAdminAction } from '@/lib/admin-audit';

export const runtime = 'nodejs';

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'service_role_not_configured' },
      { status: 503 }
    );
  }

  const userId = ctx.params.id;
  const { data: u } = await admin.auth.admin.getUserById(userId);
  const email = u?.user?.email ?? null;

  // Cascade: rows that may have FK without ON DELETE CASCADE.
  const [{ count: teamsCount }, { count: favsCount }] = await Promise.all([
    admin.from('teams').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  await admin.from('teams').delete().eq('user_id', userId);
  await admin.from('favorites').delete().eq('user_id', userId);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    admin_email: guard.email,
    action: 'user.delete',
    target_type: 'user',
    target_id: userId,
    details: {
      email,
      teams_deleted: teamsCount ?? 0,
      favorites_deleted: favsCount ?? 0,
    },
  });

  return NextResponse.json({ ok: true });
}
