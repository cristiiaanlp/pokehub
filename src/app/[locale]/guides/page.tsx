import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { GUIDES } from '@/lib/guides';
import { artworkFor } from '@/lib/pokeapi';
import { ArrowRight, BookOpenIcon } from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Guías Pokémon competitivas · PokéHub',
  description:
    'Guías de estrategia: counters, tier lists, leads de Trick Room, top usage VGC. Pikalytics + Smogon en español.',
  openGraph: {
    title: 'Guías Pokémon competitivas · PokéHub',
    description:
      'Counters, tier lists, leads y el meta competitivo SV explicado.',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  VGC: 'bg-brand/15 text-brand-glow border-brand/30',
  OU: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  Estrategia: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  Casual: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1 inline-flex items-center gap-1">
          <BookOpenIcon className="w-3 h-3" />
          Guías
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Guías Pokémon competitivas
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Counters explicados, tier lists, leads y el meta SV actualizado.
          Hechas con datos de Pikalytics, Smogon y comunidad.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="card-base card-hover p-5 group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${CATEGORY_COLORS[g.category] ?? ''}`}
              >
                {g.category}
              </span>
              <span className="text-[10px] text-ink-faint">{g.readingTime}</span>
            </div>
            <h2 className="font-display font-bold text-lg leading-tight">
              {g.title}
            </h2>
            <p className="text-sm text-ink-dim mt-2 line-clamp-2">
              {g.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-2">
                {g.heroPokemon.slice(0, 4).map((id) => (
                  <img
                    key={id}
                    src={artworkFor(id)}
                    alt={`#${id}`}
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
