'use client';

import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { TypeBadge, TYPE_HEX } from '@/components/ui/TypeBadge';
import { HeartIcon } from '@/components/ui/Icon';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { formatPokemonName, padId } from '@/lib/utils';
import type { PokemonListItem } from '@/types/pokemon';
import { artworkFor } from '@/lib/pokeapi';

interface Props {
  p: PokemonListItem;
  index?: number;
}

export function PokemonCard({ p, index = 0 }: Props) {
  const isFav = useFavoritesStore((s) => s.ids.includes(p.id));
  const toggle = useFavoritesStore((s) => s.toggle);

  const primary = p.types[0];
  const accent = primary ? TYPE_HEX(primary) : '#3B82F6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.2) }}
    >
      <Link
        href={`/pokedex/${p.id}`}
        className="group relative block rounded-2xl glass card-hover overflow-hidden p-4 pb-3"
      >
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 group-hover:opacity-50 blur-2xl transition-opacity"
          style={{ background: accent }}
        />
        <div className="relative flex items-start justify-between mb-2">
          <span className="text-[10px] font-mono text-ink-faint">
            #{padId(p.id)}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(p.id);
            }}
            aria-label="Favorito"
            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-colors ${
              isFav
                ? 'bg-accent-red/15 text-accent-red'
                : 'bg-white/[0.04] text-ink-faint hover:text-accent-red hover:bg-accent-red/10'
            }`}
          >
            <HeartIcon filled={isFav} className="w-4 h-4" />
          </button>
        </div>
        <div className="relative h-28 sm:h-32 flex items-center justify-center">
          <img
            src={artworkFor(p.id)}
            alt={p.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = p.sprite;
            }}
          />
        </div>
        <div className="relative mt-2">
          <div className="font-display text-base font-bold truncate">
            {formatPokemonName(p.name)}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {p.types.length === 0 ? (
              <div className="h-5 w-12 rounded-md shimmer-bg" />
            ) : (
              p.types.map((t) => <TypeBadge key={t} type={t} size="xs" />)
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
