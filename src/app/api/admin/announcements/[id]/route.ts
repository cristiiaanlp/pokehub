// PATCH  /api/admin/announcements/[id]  — toggle active, etc.
// DELETE /api/admin/announcements/[id]

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { logAdminAction } from '@/lib/admin-audit';

export const runtime = 'nodejs';

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
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const allowed = [
    'title',
    'body',
    'severity',
    'link_url',
    'link_label',
    'is_active',
    'starts_at',
    'ends_at',
  ] as const;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of allowed) {
    if (k in body) patch[k] = body[k];
  }

  const { error } = await admin
    .from('site_announcements')
    .update(patch)
    .eq('id', ctx.params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    admin_email: guard.email,
    action: 'announcement.update',
    target_type: 'announcement',
    target_id: ctx.params.id,
    details: patch,
  });

  return NextResponse.json({ ok: true });
}

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
  const { data: prev } = await admin
    .from('site_announcements')
    .select('title, severity')
    .eq('id', ctx.params.id)
    .maybeSingle();

  const { error } = await admin
    .from('site_announcements')
    .delete()
    .eq('id', ctx.params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    admin_email: guard.email,
    action: 'announcement.delete',
    target_type: 'announcement',
    target_id: ctx.params.id,
    details: prev ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
