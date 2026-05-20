'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Link } from '@/i18n/routing';

interface Props {
  slug: string;
  teamName: string;
}

export function TeamQrCode({ slug, teamName }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const teamUrl = `${window.location.origin}/teams/${slug}`;
    setUrl(teamUrl);
    QRCode.toDataURL(teamUrl, {
      width: 280,
      margin: 2,
      color: {
        // Tema oscuro: invierte para que el QR sea legible
        dark: '#0B0F17',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl);
  }, [slug]);

  if (!qrDataUrl) {
    return (
      <div className="card-base p-6 text-center text-ink-faint text-sm">
        Generando QR…
      </div>
    );
  }

  return (
    <div className="card-base p-5 sm:p-6">
      <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
        <div className="bg-white rounded-xl p-3 shrink-0 mx-auto sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`QR para compartir equipo ${teamName}`}
            width={180}
            height={180}
            className="block"
          />
        </div>
        <div className="space-y-3 min-w-0">
          <div>
            <h3 className="font-display font-bold text-base mb-1">
              📱 Comparte en persona
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Escanea con el móvil del rival en torneos presenciales. Te lleva
              directamente al equipo sin teclear URLs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={qrDataUrl}
              download={`pokehub-${slug}.png`}
              className="text-xs font-bold px-3 h-9 rounded-lg glass hover:bg-white/[0.08] inline-flex items-center gap-1.5"
            >
              ⬇ Descargar QR
            </a>
            <Link
              href={`/teams/${slug}/print`}
              className="text-xs font-bold px-3 h-9 rounded-lg bg-brand text-white hover:bg-brand-hover inline-flex items-center gap-1.5"
            >
              🖨️ Hoja imprimible
            </Link>
          </div>
          <div className="text-[10px] text-ink-faint font-mono truncate">
            {url}
          </div>
        </div>
      </div>
    </div>
  );
}
