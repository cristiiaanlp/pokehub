// Server-side admin verification. Use at the top of every privileged API
// route handler. Returns null when access is allowed, or a NextResponse with
// the appropriate 401/403 status when not.

import { NextResponse } from 'next/server';
import { getSupabaseServer } from './supabase-server';
import { isAdminEmail } from './admin';

export async function requireAdmin(): Promise<{
  ok: true;
  email: string;
} | NextResponse> {
  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json(
      { error: 'supabase_not_configured' },
      { status: 503 }
    );
  }
  const { data } = await sb.auth.getUser();
  const email = data.user?.email ?? null;
  if (!email) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return { ok: true, email };
}
