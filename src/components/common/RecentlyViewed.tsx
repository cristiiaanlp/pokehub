'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { getRecent, type RecentEntry } from '@/lib/recent';
import { spriteFor } from '@/lib/pokeapi';
import { ClockIcon } from '@/components/ui/Icon';

/**
 * Pequeña barra que muestra los últimos Pokémon vistos. Aparece en la home
 * y otras páginas no-pokédex. NO se muestra si la lista está vacía.
 */
export function RecentlyViewed() {
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRecent(getRecent());
    // Sync entre tabs
    const handler = (e: StorageEvent) => {
      if (e.key === 'pokehub-recent-pokemon') {
        setRecent(getRecent());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!mounted || recent.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
      <div className="card-base p-3 flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <ClockIcon className="w-3.5 h-3.5 text-ink-faint" />
          <span className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">
            Recientes
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1">
          {recent.map((e) => (
            <Link
              key={e.id}
              href={`/pokedex/${e.id}`}
              className="shrink-0 group"
              title={e.name}
            >
              <div className="w-12 h-12 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all border border-white/[0.06] group-hover:border-brand/30">
                <img
                  src={spriteFor(e.id)}
                  alt={e.name}
                  className="w-10 h-10 object-contain [image-rendering:pixelated] group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
