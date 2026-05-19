// Public endpoint: returns active site announcements whose window covers now.
// Uses the anon client, which is gated by the RLS "public read active
// announcements" policy. Safe to call from any client.

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
// 60s — banners are not real-time critical and we want CDN caching.
export const revalidate = 60;

export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ items: [] });
  const { data, error } = await sb
    .from('site_announcements')
    .select('id, title, body, severity, link_url, link_label, ends_at')
    .eq('is_active', true)
    .order('starts_at', { ascending: false })
    .limit(3);
  if (error) {
    return NextResponse.json({ items: [], error: error.message });
  }
  return NextResponse.json(
    { items: data ?? [] },
    { headers: { 'cache-control': 's-maxage=60, stale-while-revalidate=120' } }
  );
}
