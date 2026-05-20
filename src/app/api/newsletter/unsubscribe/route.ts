// GET /api/newsletter/unsubscribe?token=xxx
//
// Endpoint público con token único — el link del email apuntará aquí.
// Si el token es válido marca al subscriber como unsubscribed.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return new Response('Missing token', { status: 400 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return new Response('not configured', { status: 503 });

  const { error } = await admin
    .from('newsletter_subscribers')
    .update({
      confirmed: false,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('unsubscribe_token', token);

  if (error) {
    return new Response('Token inválido o ya desuscrito.', { status: 404 });
  }

  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Desuscrito · PokéHub</title></head><body style="font-family:system-ui;text-align:center;padding:80px 20px;background:#0B0F17;color:#fff;"><h1>Desuscrito ✓</h1><p style="color:#94A3B8">Ya no recibirás más correos del newsletter de PokéHub.</p><p><a href="/" style="color:#60A5FA">Volver al sitio</a></p></body></html>`,
    {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }
  );
}
