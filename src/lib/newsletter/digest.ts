// Generador del digest semanal del newsletter.
//
// Combina: top Pokémon del meta, último guide, último best-list y un highlight
// de novedades. Construye versión HTML + texto plano (multipart). No envía —
// devuelve el payload listo para pasar a tu mail provider preferido.

import { CHAMPIONS_TOP_USAGE } from '@/lib/champions/data';
import { GUIDES } from '@/lib/guides';
import { BEST_LISTS } from '@/lib/best-lists';
import { SITE } from '@/lib/site';

export interface DigestPayload {
  subject: string;
  html: string;
  text: string;
  /** Highlights estructurados — útil si en el futuro hay otros canales (RSS, Discord webhook) */
  highlights: {
    topPokemon: { name: string; usagePct: number }[];
    latestGuide?: { title: string; slug: string; description: string };
    latestBestList?: { title: string; slug: string; description: string };
  };
}

export function buildWeeklyDigest(locale = 'es'): DigestPayload {
  const top3 = CHAMPIONS_TOP_USAGE.slice(0, 3);
  const guides = [...GUIDES].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const lists = [...BEST_LISTS].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const latestGuide = guides[0];
  const latestBestList = lists[0];

  const dateLabel = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subject = `PokéHub Weekly · ${dateLabel} · ${top3.map((p) => p.name).join(', ')} dominan el meta`;

  // Plain text (fallback)
  const text = [
    `PokéHub Weekly — ${dateLabel}`,
    '',
    '═══════════════════════════════════════',
    'TOP 3 DEL META ESTA SEMANA',
    '═══════════════════════════════════════',
    ...top3.map(
      (p, i) =>
        `${i + 1}. ${p.name} — ${p.usagePct.toFixed(1)}% usage${
          p.winRatePct !== undefined ? ` · ${p.winRatePct.toFixed(1)}% WR` : ''
        }`
    ),
    '',
    latestGuide
      ? [
          '═══════════════════════════════════════',
          'GUÍA NUEVA',
          '═══════════════════════════════════════',
          latestGuide.title,
          latestGuide.description,
          `${SITE.url}/guides/${latestGuide.slug}`,
          '',
        ].join('\n')
      : '',
    latestBestList
      ? [
          '═══════════════════════════════════════',
          'LISTA RECOMENDADA',
          '═══════════════════════════════════════',
          latestBestList.title,
          latestBestList.description,
          `${SITE.url}/best/${latestBestList.slug}`,
          '',
        ].join('\n')
      : '',
    '',
    '¿Ya no quieres recibir esto? Desuscríbete: ' +
      `${SITE.url}/api/newsletter/unsubscribe`,
  ]
    .filter(Boolean)
    .join('\n');

  // HTML — minimal, sin tracking, mobile-friendly
  const html = `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0B0F17;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0B0F17;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#0f1623;border-radius:16px;border:1px solid rgba(255,255,255,0.06);">
        <tr><td style="padding:32px 32px 24px;">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#7eb6ff;font-weight:700;">PokéHub Weekly</div>
          <h1 style="margin:8px 0 0;font-size:28px;font-weight:800;letter-spacing:-0.5px;color:#f8fafc;">${escapeHtml(dateLabel)}</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Lo más relevante del meta SV esta semana.</p>
        </td></tr>

        <tr><td style="padding:8px 32px 8px;">
          <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
        </td></tr>

        <tr><td style="padding:24px 32px 8px;">
          <h2 style="margin:0;font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#fbbf24;font-weight:700;">🏆 Top 3 del meta</h2>
        </td></tr>
        ${top3
          .map(
            (p, i) => `
        <tr><td style="padding:6px 32px;">
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:11px;color:#94a3b8;font-weight:600;">#${i + 1}</div>
              <div style="font-size:18px;font-weight:700;color:#f8fafc;margin-top:2px;">${escapeHtml(p.name)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:#94a3b8;">Usage / WR</div>
              <div style="font-size:14px;font-weight:700;color:#fbbf24;font-family:monospace;">${p.usagePct.toFixed(1)}%${p.winRatePct !== undefined ? ` / ${p.winRatePct.toFixed(1)}%` : ''}</div>
            </div>
          </div>
        </td></tr>`
          )
          .join('')}

        ${
          latestGuide
            ? `
        <tr><td style="padding:24px 32px 8px;">
          <h2 style="margin:0;font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#7eb6ff;font-weight:700;">📚 Guía destacada</h2>
        </td></tr>
        <tr><td style="padding:6px 32px;">
          <a href="${SITE.url}/guides/${latestGuide.slug}" style="display:block;text-decoration:none;color:inherit;">
            <div style="background:rgba(126,182,255,0.06);border:1px solid rgba(126,182,255,0.2);border-radius:12px;padding:16px;">
              <div style="font-size:16px;font-weight:700;color:#f8fafc;">${escapeHtml(latestGuide.title)}</div>
              <div style="font-size:13px;color:#94a3b8;margin-top:6px;line-height:1.5;">${escapeHtml(latestGuide.description)}</div>
              <div style="margin-top:10px;font-size:12px;color:#7eb6ff;font-weight:700;">Leer la guía →</div>
            </div>
          </a>
        </td></tr>`
            : ''
        }

        ${
          latestBestList
            ? `
        <tr><td style="padding:24px 32px 8px;">
          <h2 style="margin:0;font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:#86efac;font-weight:700;">🏅 Lista recomendada</h2>
        </td></tr>
        <tr><td style="padding:6px 32px;">
          <a href="${SITE.url}/best/${latestBestList.slug}" style="display:block;text-decoration:none;color:inherit;">
            <div style="background:rgba(134,239,172,0.06);border:1px solid rgba(134,239,172,0.2);border-radius:12px;padding:16px;">
              <div style="font-size:16px;font-weight:700;color:#f8fafc;">${escapeHtml(latestBestList.title)}</div>
              <div style="font-size:13px;color:#94a3b8;margin-top:6px;line-height:1.5;">${escapeHtml(latestBestList.description)}</div>
              <div style="margin-top:10px;font-size:12px;color:#86efac;font-weight:700;">Ver la lista →</div>
            </div>
          </a>
        </td></tr>`
            : ''
        }

        <tr><td style="padding:32px;text-align:center;">
          <a href="${SITE.url}" style="display:inline-block;padding:12px 28px;border-radius:12px;background:#3b82f6;color:#fff;text-decoration:none;font-weight:700;font-size:14px;">
            Visitar PokéHub
          </a>
        </td></tr>

        <tr><td style="padding:16px 32px 28px;border-top:1px solid rgba(255,255,255,0.05);">
          <div style="font-size:11px;color:#64748b;text-align:center;">
            Recibes esto porque te suscribiste en pokehub.app.<br>
            <a href="${SITE.url}/api/newsletter/unsubscribe" style="color:#64748b;text-decoration:underline;">Desuscribirme</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return {
    subject,
    html,
    text,
    highlights: {
      topPokemon: top3.map((p) => ({ name: p.name, usagePct: p.usagePct })),
      latestGuide: latestGuide
        ? {
            title: latestGuide.title,
            slug: latestGuide.slug,
            description: latestGuide.description,
          }
        : undefined,
      latestBestList: latestBestList
        ? {
            title: latestBestList.title,
            slug: latestBestList.slug,
            description: latestBestList.description,
          }
        : undefined,
    },
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
