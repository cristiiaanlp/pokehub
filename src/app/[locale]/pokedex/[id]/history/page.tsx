import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  POKEMON_HISTORY,
  ALL_HISTORY_IDS,
  GEN_LABELS,
  type Gen,
} from '@/lib/gen-history';
import { getPokemon, artworkFor } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { formatPokemonName, padId } from '@/lib/utils';
import { SITE } from '@/lib/site';
import {
  ClockIcon,
  ArrowRight,
  BookOpenIcon,
  SwordIcon,
} from '@/components/ui/Icon';
import type { PokemonDetail } from '@/types/pokemon';

export const dynamicParams = false;
export const revalidate = 604800; // 1 week — historia cambia raramente

export async function generateStaticParams() {
  return ALL_HISTORY_IDS.map((id) => ({ id: String(id) }));
}

interface PageProps {
  params: { id: string; locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const p = await getPokemon(params.id);
    const name = formatPokemonName(p.name);
    return {
      title: `${name} a través de las generaciones · Historia competitiva · PokéHub`,
      description: `Cómo cambió ${name} desde su debut hasta Gen 9: stats, habilidades, banlist, sets meta y momentos clave.`,
      alternates: { canonical: `${SITE.url}/pokedex/${p.id}/history` },
      openGraph: {
        type: 'article',
        title: `${name} a través de las generaciones · PokéHub`,
        description: `Cambios de ${name} en cada generación Pokémon.`,
        images: [{ url: artworkFor(p.id), width: 800, height: 800 }],
      },
    };
  } catch {
    return { title: 'Historia de Pokémon · PokéHub' };
  }
}

export default async function HistoryPage({ params }: PageProps) {
  const history = POKEMON_HISTORY[Number(params.id)];
  if (!history) notFound();

  let pokemon: PokemonDetail;
  try {
    pokemon = await getPokemon(params.id);
  } catch {
    return notFound();
  }

  const name = formatPokemonName(pokemon.name);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${name} a través de las generaciones`,
    description: history.summary,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/icon` },
    },
    image: artworkFor(pokemon.id),
    mainEntityOfPage: `${SITE.url}/pokedex/${pokemon.id}/history`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-ink-faint flex items-center gap-2">
        <Link href={`/pokedex/${pokemon.id}`} className="hover:text-ink">
          {name}
        </Link>
        <span>/</span>
        <span className="text-ink-dim">Historia</span>
      </nav>

      {/* Header */}
      <header className="card-base p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <img
            src={artworkFor(pokemon.id)}
            alt={name}
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.3em] text-purple-300 font-bold mb-1 inline-flex items-center gap-1">
              <ClockIcon className="w-3 h-3" /> Historia competitiva
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {name} a través de las generaciones
            </h1>
            <div className="flex gap-1.5 mt-2 flex-wrap items-center">
              {pokemon.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
              <span className="text-xs text-ink-faint font-mono ml-1">
                #{padId(pokemon.id)} · Introducido en {GEN_LABELS[history.introducedIn]}
              </span>
            </div>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              {history.summary}
            </p>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <section>
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-brand-glow" /> Línea de tiempo
        </h2>
        <div className="relative pl-6 border-l-2 border-white/[0.06] space-y-5">
          {history.timeline.map((evt, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <div
                className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand ring-4 ring-bg-950"
                aria-hidden
              />
              <div className="card-base p-4">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                  <div className="text-[10px] uppercase tracking-widest text-brand-glow font-bold">
                    {GEN_LABELS[evt.gen]}
                  </div>
                  <div className="text-[10px] font-mono text-ink-faint">
                    {evt.game}
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {evt.changes.map((change, j) => (
                    <li
                      key={j}
                      className="flex gap-2 text-sm text-ink-soft leading-relaxed"
                    >
                      <span className="text-brand-glow shrink-0 mt-0.5">▸</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-links */}
      <div className="card-base p-4 grid sm:grid-cols-2 gap-2">
        <Link
          href={`/pokedex/${pokemon.id}/competitive`}
          className="card-base card-hover p-3 group"
        >
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-4 h-4 text-brand-glow" />
            <div className="flex-1">
              <div className="font-display font-bold text-sm">
                Análisis competitivo actual
              </div>
              <div className="text-[11px] text-ink-dim">
                Sets, EV spreads, partners SV
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
        <Link
          href={`/pokedex/${pokemon.id}/counters`}
          className="card-base card-hover p-3 group"
        >
          <div className="flex items-center gap-2">
            <SwordIcon className="w-4 h-4 text-accent-red" />
            <div className="flex-1">
              <div className="font-display font-bold text-sm">
                Counters de {name}
              </div>
              <div className="text-[11px] text-ink-dim">
                Quién lo vence en el meta actual
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </article>
  );
}
