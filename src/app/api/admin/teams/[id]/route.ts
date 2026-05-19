// Admin team moderation endpoints.
// DELETE  /api/admin/teams/[id]           — hard delete a team
// PATCH   /api/admin/teams/[id]           — body { is_public: boolean } to toggle

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

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
  const { error } = await admin.from('teams').delete().eq('id', ctx.params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
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
  let body: { is_public?: boolean };
  try {
    body = (await req.json()) as { is_public?: boolean };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const patch: { is_public?: boolean; share_slug?: string | null } = {};
  if (typeof body.is_public === 'boolean') {
    patch.is_public = body.is_public;
    if (!body.is_public) patch.share_slug = null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }
  const { error } = await admin
    .from('teams')
    .update(patch)
    .eq('id', ctx.params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
