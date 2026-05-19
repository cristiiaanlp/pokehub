// Admin team moderation endpoints.
// DELETE  /api/admin/teams/[id]   — hard delete a team
// PATCH   /api/admin/teams/[id]   — body { is_public?, is_featured?, featured_note? }
//
// Every action is recorded in admin_audit_log via logAdminAction().

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
  // Read first so we can stamp the audit log with team metadata.
  const { data: team } = await admin
    .from('teams')
    .select('id, name, owner_email, is_public, is_featured')
    .eq('id', ctx.params.id)
    .maybeSingle();

  const { error } = await admin.from('teams').delete().eq('id', ctx.params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    admin_email: guard.email,
    action: 'team.delete',
    target_type: 'team',
    target_id: ctx.params.id,
    details: team ?? undefined,
  });

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
  let body: {
    is_public?: boolean;
    is_featured?: boolean;
    featured_note?: string | null;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const patch: {
    is_public?: boolean;
    share_slug?: string | null;
    is_featured?: boolean;
    featured_at?: string | null;
    featured_note?: string | null;
  } = {};
  const actions: string[] = [];

  if (typeof body.is_public === 'boolean') {
    patch.is_public = body.is_public;
    if (!body.is_public) patch.share_slug = null;
    actions.push(body.is_public ? 'team.publish' : 'team.unpublish');
  }
  if (typeof body.is_featured === 'boolean') {
    patch.is_featured = body.is_featured;
    patch.featured_at = body.is_featured ? new Date().toISOString() : null;
    if (!body.is_featured) patch.featured_note = null;
    actions.push(body.is_featured ? 'team.feature' : 'team.unfeature');
  }
  if (typeof body.featured_note === 'string' || body.featured_note === null) {
    patch.featured_note = body.featured_note;
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

  for (const a of actions) {
    await logAdminAction({
      admin_email: guard.email,
      action: a,
      target_type: 'team',
      target_id: ctx.params.id,
      details: patch,
    });
  }

  return NextResponse.json({ ok: true });
}
