'use client';

import { useState } from 'react';
import { SaveIcon, CheckIcon, SparklesIcon } from '@/components/ui/Icon';

export function TrainerCardPreview({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  if (!username) return null;

  const cardUrl = `/api/trainer-card?username=${encodeURIComponent(username)}`;

  const copyUrl = async () => {
    try {
      const fullUrl = `${window.location.origin}${cardUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="card-base p-5 space-y-3">
      <div>
        <h2 className="font-display font-bold text-sm flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-accent-yellow" />
          Trainer Card
        </h2>
        <p className="text-xs text-ink-dim mt-1">
          Una tarjeta cuadrada con tu avatar, badges y mejor equipo. Compártela
          en Twitter, Discord o como avatar de perfil.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden bg-bg-950 border border-white/[0.06] max-w-md mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardUrl}
          alt="Mi Trainer Card"
          className="w-full h-auto block"
        />
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <a
          href={cardUrl}
          download={`pokehub-${username}.png`}
          className="h-10 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover inline-flex items-center gap-1.5"
        >
          <SaveIcon className="w-4 h-4" />
          Descargar PNG
        </a>
        <button
          onClick={copyUrl}
          className="h-10 px-4 rounded-lg bg-accent-green/15 text-accent-green text-xs font-bold uppercase tracking-widest hover:bg-accent-green/25 inline-flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              URL copiada
            </>
          ) : (
            'Copiar URL'
          )}
        </button>
      </div>
      <p className="text-[10px] text-ink-faint text-center">
        Cambia tu avatar Pokémon o publica un team → la card se actualiza sola.
      </p>
    </div>
  );
}
