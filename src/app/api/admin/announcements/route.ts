// POST /api/admin/announcements — create
// GET  /api/admin/announcements — list (admin only; public uses /api/announcements)

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { logAdminAction } from '@/lib/admin-audit';

export const runtime = 'nodejs';

interface AnnouncementInput {
  title: string;
  body?: string | null;
  severity?: 'info' | 'warning' | 'error' | 'maintenance';
  link_url?: string | null;
  link_label?: string | null;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'service_role_not_configured' },
      { status: 503 }
    );
  }
  let body: AnnouncementInput;
  try {
    body = (await req.json()) as AnnouncementInput;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ error: 'title_required' }, { status: 400 });
  }

  const insert = {
    title: body.title.trim(),
    body: body.body?.trim() || null,
    severity: body.severity ?? 'info',
    link_url: body.link_url?.trim() || null,
    link_label: body.link_label?.trim() || null,
    is_active: body.is_active ?? true,
    starts_at: body.starts_at || null,
    ends_at: body.ends_at || null,
    created_by: guard.email,
  };

  const { data, error } = await admin
    .from('site_announcements')
    .insert(insert)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    admin_email: guard.email,
    action: 'announcement.create',
    target_type: 'announcement',
    target_id: data.id,
    details: { title: data.title, severity: data.severity },
  });

  return NextResponse.json({ ok: true, announcement: data });
}
