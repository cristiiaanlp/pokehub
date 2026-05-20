import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { BEST_LISTS } from '@/lib/best-lists';
import { artworkFor } from '@/lib/pokeapi';
import { ArrowRight, TrophyIcon } from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Best Pokémon listas · Por tipo, rol y formato · PokéHub',
  description:
    'Listas curadas de mejores Pokémon por tipo, rol y formato competitivo: Water, Trick Room, Stealth Rock setters, sweepers rápidos y más.',
};

const CATEGORY_COLORS: Record<string, string> = {
  Type: 'bg-brand/15 text-brand-glow',
  Role: 'bg-accent-yellow/15 text-accent-yellow',
  Format: 'bg-accent-green/15 text-accent-green',
  Beginner: 'bg-purple-500/15 text-purple-300',
};

export default function BestListsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1 inline-flex items-center gap-1">
          <TrophyIcon className="w-3 h-3" />
          Best lists
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Mejores Pokémon por tipo, rol y formato
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Listas curadas de los Pokémon más fuertes del competitivo SV. Por
          tipo, por rol (sweeper, wall, lead, TR setter) y por nivel de juego
          (principiante o avanzado).
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {BEST_LISTS.map((list) => (
          <Link
            key={list.slug}
            href={`/best/${list.slug}`}
            className="card-base card-hover p-5 group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{list.emoji}</span>
              <span
                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  CATEGORY_COLORS[list.category] ?? ''
                }`}
              >
                {list.category}
              </span>
            </div>
            <h2 className="font-display font-bold text-lg leading-tight">
              {list.title}
            </h2>
            <p className="text-xs text-ink-dim mt-2 line-clamp-2">
              {list.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-2">
                {list.entries.slice(0, 4).map((e) => (
                  <img
                    key={e.pokemonId}
                    src={artworkFor(e.pokemonId)}
                    alt=""
                    className="w-10 h-10 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
                  />
                ))}
              </div>
              <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
