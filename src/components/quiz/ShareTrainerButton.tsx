'use client';

import { useState } from 'react';
import { CheckIcon } from '@/components/ui/Icon';

interface Props {
  arch: string;
  title: string;
  emoji: string;
}

export function ShareTrainerButton({ arch, title, emoji }: Props) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/quiz/trainer-type/${arch}`
      : '';

  const tweetText = encodeURIComponent(
    `${emoji} Soy ${title} en Pokémon competitivo. ¿Y tú? Descúbrelo en PokéHub:`
  );
  const twitterShare = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(url)}`;
  const whatsappShare = `https://wa.me/?text=${tweetText}%20${encodeURIComponent(url)}`;

  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copia este enlace:', url);
    }
  };

  return (
    <div className="card-base p-4 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink-faint text-center">
        Compártelo
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <a
          href={twitterShare}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 rounded-xl bg-[#1d9bf0] text-white text-sm font-bold inline-flex items-center justify-center hover:opacity-90"
        >
          𝕏 Twitter
        </a>
        <a
          href={whatsappShare}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 rounded-xl bg-[#25d366] text-white text-sm font-bold inline-flex items-center justify-center hover:opacity-90"
        >
          WhatsApp
        </a>
        <button
          onClick={copyLink}
          className={`h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
            copied
              ? 'bg-accent-green/20 text-accent-green'
              : 'glass hover:bg-white/[0.08]'
          }`}
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" /> Copiado
            </>
          ) : (
            <>🔗 Copiar</>
          )}
        </button>
      </div>
    </div>
  );
}
