import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { BEST_LISTS, getBestList } from '@/lib/best-lists';
import { artworkFor } from '@/lib/pokeapi';
import { SITE } from '@/lib/site';
import {
  ArrowRight,
  TrophyIcon,
  ClockIcon,
} from '@/components/ui/Icon';

export const dynamicParams = false;

export async function generateStaticParams() {
  return BEST_LISTS.map((l) => ({ slug: l.slug }));
}

interface PageProps {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const list = getBestList(params.slug);
  if (!list) return { title: 'Lista no encontrada' };
  const url = `${SITE.url}/best/${list.slug}`;
  return {
    title: list.title,
    description: list.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: list.title,
      description: list.description,
      url,
    },
  };
}

export default function BestListPage({ params }: PageProps) {
  const list = getBestList(params.slug);
  if (!list) notFound();

  // JSON-LD ItemList structured data — Google loves listicles with this
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.title,
    description: list.description,
    numberOfItems: list.entries.length,
    itemListElement: list.entries.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `#${entry.pokemonId}`,
      url: `${SITE.url}/pokedex/${entry.pokemonId}`,
    })),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/best"
        className="text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1 mb-4"
      >
        <TrophyIcon className="w-3.5 h-3.5" /> Todas las listas
      </Link>

      <header className="mb-6">
        <div className="text-3xl mb-2">{list.emoji}</div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {list.title}
        </h1>
        <p className="text-sm text-ink-dim mt-3 leading-relaxed">{list.intro}</p>
        <div className="mt-3 inline-flex items-center gap-1 text-[10px] text-ink-faint">
          <ClockIcon className="w-3 h-3" />
          Actualizado {new Date(list.updatedAt).toLocaleDateString('es', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </header>

      <div className="space-y-2">
        {list.entries.map((entry, i) => (
          <Link
            key={`${entry.pokemonId}-${i}`}
            href={`/pokedex/${entry.pokemonId}`}
            className="card-base card-hover p-4 flex items-start gap-4 group"
          >
            <div className="flex flex-col items-center shrink-0">
              <div className="font-display text-2xl font-bold text-brand-glow">
                #{i + 1}
              </div>
              <img
                src={artworkFor(entry.pokemonId)}
                alt={`#${entry.pokemonId}`}
                className="w-20 h-20 object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              {entry.highlight && (
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-yellow/15 text-accent-yellow mb-1.5">
                  {entry.highlight}
                </span>
              )}
              <p className="text-sm text-ink-soft leading-relaxed">
                {entry.reason}
              </p>
              <div className="text-xs text-brand-glow mt-2 inline-flex items-center gap-1">
                Ver ficha
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-white/[0.06]">
        <h3 className="font-display font-bold text-sm mb-3">Más listas</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {BEST_LISTS.filter((l) => l.slug !== list.slug)
            .slice(0, 4)
            .map((o) => (
              <Link
                key={o.slug}
                href={`/best/${o.slug}`}
                className="card-base card-hover p-3 text-sm group flex items-center gap-2"
              >
                <span className="text-base">{o.emoji}</span>
                <span className="flex-1 truncate font-semibold">{o.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
        </div>
      </div>
    </article>
  );
}
