// Cron weekly: ejecuta lunes 09:00 UTC (configurado en vercel.json).
//
// Genera el digest semanal y lo envía a los suscriptores confirmed.
//
// Envío: usa RESEND_API_KEY si está disponible (resend.com). Si no, hace
// dry-run y devuelve la cuenta de suscriptores + el HTML — útil para
// debugging y para integrar con otros providers más adelante.
//
// Vercel envía un header `Authorization: Bearer ${CRON_SECRET}` automáticamente.
// Si CRON_SECRET está set, validamos. Si no, asumimos llamada legítima de Vercel
// y delegamos en x-vercel-cron header.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { buildWeeklyDigest } from '@/lib/newsletter/digest';
import { SITE } from '@/lib/site';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Subscriber {
  email: string;
  locale: string;
}

export async function GET(req: Request) {
  // 1) Autorización: vercel cron envía bearer; si CRON_SECRET set, validamos.
  const auth = req.headers.get('authorization');
  const cronHeader = req.headers.get('x-vercel-cron');
  const secret = process.env.CRON_SECRET;

  if (secret) {
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  } else if (!cronHeader && process.env.NODE_ENV === 'production') {
    // En prod sin secret configurado, exigir al menos el header de Vercel
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2) Construir el digest
  const digest = buildWeeklyDigest('es');

  // 3) Fetch suscriptores
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'service_role_not_configured' },
      { status: 503 }
    );
  }

  const { data: subscribers, error } = await admin
    .from('newsletter_subscribers')
    .select('email, locale')
    .eq('confirmed', true)
    .is('unsubscribed_at', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = (subscribers ?? []) as Subscriber[];

  // 4) Enviar via Resend si está configurado, si no dry-run
  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.NEWSLETTER_FROM || 'PokéHub <hello@pokehub.app>';

  if (!resendKey) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      subject: digest.subject,
      subscriberCount: list.length,
      highlights: digest.highlights,
      note: 'RESEND_API_KEY no configurado — no se envió email. Set la env var para activar envíos reales.',
    });
  }

  // Resend: BCC en batches de 50 (límite seguro)
  const batches: string[][] = [];
  for (let i = 0; i < list.length; i += 50) {
    batches.push(list.slice(i, i + 50).map((s) => s.email));
  }

  const results: { batch: number; ok: boolean; error?: string }[] = [];
  for (let i = 0; i < batches.length; i++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${resendKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: fromAddress, // To es la propia cuenta (BCC efectivo)
          bcc: batches[i],
          subject: digest.subject,
          html: digest.html,
          text: digest.text,
        }),
      });
      const ok = res.ok;
      if (!ok) {
        const errBody = await res.text();
        results.push({ batch: i, ok: false, error: errBody.slice(0, 200) });
      } else {
        results.push({ batch: i, ok: true });
      }
    } catch (e) {
      results.push({
        batch: i,
        ok: false,
        error: e instanceof Error ? e.message : 'unknown',
      });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  return NextResponse.json({
    ok: true,
    subject: digest.subject,
    subscriberCount: list.length,
    batches: batches.length,
    sentBatches: sent,
    failedBatches: failed,
    siteUrl: SITE.url,
    results,
  });
}
