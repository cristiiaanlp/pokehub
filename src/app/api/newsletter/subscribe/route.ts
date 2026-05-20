// POST /api/newsletter/subscribe { email, locale? }
//
// Suscripción al newsletter semanal. Por ahora SIN double-opt-in para
// no requerir cuenta de email transaccional — el confirmed se marca a
// true directamente. Si en el futuro queremos meter Resend/Postmark,
// el flow ya está preparado (confirm_token, confirm_expires_at).

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSupabaseServer } from '@/lib/supabase-server';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_LOCALES = ['es', 'en', 'fr', 'de', 'it'];

export async function POST(req: Request) {
  // 3 intentos por IP/min — evita scrapers añadiendo emails al azar
  const rl = await rateLimit(`newsletter:${getRateLimitKey(req)}`, 3, 60);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Demasiados intentos. Espera ${rl.resetIn}s.` },
      { status: 429 }
    );
  }

  let body: { email?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const locale = VALID_LOCALES.includes(body.locale ?? '') ? body.locale! : 'es';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'service_role_not_configured' },
      { status: 503 }
    );
  }

  // Si el user está logueado, asociamos al row
  const sb = getSupabaseServer();
  const userId = sb ? (await sb.auth.getUser()).data.user?.id ?? null : null;

  // Upsert: si vuelve a suscribirse tras desuscribirse, lo reactivamos
  const { error } = await admin.from('newsletter_subscribers').upsert(
    {
      email,
      locale,
      user_id: userId,
      confirmed: true, // single-opt-in por ahora
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
    },
    { onConflict: 'email' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
