import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getPokemon, artworkFor } from '@/lib/pokeapi';
import { COUNTERS_DB, ALL_COUNTER_IDS } from '@/lib/meta/counters-detail';
import { effectivenessAgainst } from '@/lib/type-effectiveness';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { formatPokemonName, padId } from '@/lib/utils';
import { SITE } from '@/lib/site';
import {
  ShieldIcon,
  SwordIcon,
  TargetIcon,
  ArrowRight,
  BookOpenIcon,
} from '@/components/ui/Icon';
import type { PokemonDetail } from '@/types/pokemon';

export const revalidate = 86400;
export const dynamicParams = false;

export async function generateStaticParams() {
  return ALL_COUNTER_IDS.map((id) => ({ id: String(id) }));
}

interface PageProps {
  params: { id: string; locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const p = await getPokemon(params.id);
    const name = formatPokemonName(p.name);
    return {
      title: `Counters de ${name} · Cómo vencer a ${name} en competitivo`,
      description: `Lista de counters duros y checks situacionales contra ${name}. Estrategias, sets recomendados y matchups en Pokémon SV.`,
      alternates: { canonical: `${SITE.url}/pokedex/${p.id}/counters` },
      openGraph: {
        type: 'article',
        title: `Counters de ${name} · PokéHub`,
        description: `Cómo vencer a ${name}: counters, checks y estrategia.`,
        images: [{ url: artworkFor(p.id), width: 800, height: 800 }],
      },
    };
  } catch {
    return { title: 'Counters · PokéHub' };
  }
}

export default async function CountersPage({ params }: PageProps) {
  const entry = COUNTERS_DB[Number(params.id)];
  if (!entry) notFound();

  let pokemon: PokemonDetail;
  try {
    pokemon = await getPokemon(params.id);
  } catch {
    return notFound();
  }

  // Hidratamos los counter Pokémon (sprites, tipos)
  const counterDetails = await Promise.all(
    entry.counters.map(async (c) => {
      try {
        const p = await getPokemon(c.id);
        return { ...c, name: formatPokemonName(p.name), types: p.types };
      } catch {
        return { ...c, name: `#${c.id}`, types: [] };
      }
    })
  );

  const hardCounters = counterDetails.filter((c) => c.tier === 'hard');
  const checks = counterDetails.filter((c) => c.tier === 'check');

  const effectiveness = effectivenessAgainst(pokemon.types);
  const weakX4 = effectiveness.filter((r) => r.multiplier === 4);
  const weakX2 = effectiveness.filter((r) => r.multiplier === 2);

  const name = formatPokemonName(pokemon.name);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Counters de ${name}`,
    description: `Cómo vencer a ${name} en Pokémon competitivo SV: counters duros, checks y estrategia.`,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/icon` },
    },
    image: artworkFor(pokemon.id),
    mainEntityOfPage: `${SITE.url}/pokedex/${pokemon.id}/counters`,
  };

  // FAQ schema — capta "People Also Ask" en Google
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `¿Cuál es el mejor counter para ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: hardCounters[0]
            ? `${hardCounters[0].name}: ${hardCounters[0].reason}`
            : `Tipos super-efectivos contra ${name}: ${weakX2.map((w) => w.type).join(', ')}.`,
        },
      },
      {
        '@type': 'Question',
        name: `¿A qué tipos es débil ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            weakX4.length > 0
              ? `${name} es doblemente débil a ${weakX4.map((w) => w.type).join(', ')} (4× daño) y normalmente débil a ${weakX2.map((w) => w.type).join(', ')}.`
              : `${name} es débil a ${weakX2.map((w) => w.type).join(', ')}.`,
        },
      },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* Breadcrumb / back */}
      <nav className="text-xs text-ink-faint flex items-center gap-2">
        <Link href={`/pokedex/${pokemon.id}`} className="hover:text-ink">
          {name}
        </Link>
        <span>/</span>
        <Link
          href={`/pokedex/${pokemon.id}/competitive`}
          className="hover:text-ink"
        >
          Competitivo
        </Link>
        <span>/</span>
        <span className="text-ink-dim">Counters</span>
      </nav>

      {/* Header */}
      <header className="card-base p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-accent-red/20 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <img
            src={artworkFor(pokemon.id)}
            alt={name}
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-ink-faint font-mono">
              {padId(pokemon.id)}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Counters de {name}
            </h1>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {pokemon.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              {entry.overview}
            </p>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {entry.threat.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded glass text-ink-soft"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Type weaknesses quick view */}
      <section className="card-base p-5">
        <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
          <TargetIcon className="w-4 h-4 text-accent-red" /> Débil contra
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {weakX4.length > 0 && (
            <div className="col-span-2 sm:col-span-4">
              <div className="text-[10px] uppercase tracking-widest text-accent-red font-bold mb-1.5">
                4× daño
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {weakX4.map((w) => (
                  <TypeBadge key={w.type} type={w.type} />
                ))}
              </div>
            </div>
          )}
          {weakX2.length > 0 && (
            <div className="col-span-2 sm:col-span-4">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1.5">
                2× daño
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {weakX2.map((w) => (
                  <TypeBadge key={w.type} type={w.type} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Hard counters */}
      {hardCounters.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-accent-green" /> Counters duros
            <span className="text-[10px] text-ink-faint font-normal tracking-widest">
              ({hardCounters.length} Pokémon)
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {hardCounters.map((c) => (
              <Link
                key={c.id}
                href={`/pokedex/${c.id}`}
                className="card-base card-hover p-4 group"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={artworkFor(c.id)}
                    alt={c.name}
                    className="w-16 h-16 object-contain shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-display font-bold text-sm">
                        {c.name}
                      </span>
                      <span className="text-[9px] font-mono text-ink-faint">
                        #{c.id}
                      </span>
                    </div>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {c.types.map((t) => (
                        <TypeBadge key={t} type={t} size="xs" />
                      ))}
                    </div>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {c.reason}
                    </p>
                    {c.set && (
                      <div className="text-[10px] font-mono text-brand-glow mt-1.5">
                        ➜ {c.set}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Checks situacionales */}
      {checks.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
            <SwordIcon className="w-5 h-5 text-accent-yellow" /> Checks situacionales
            <span className="text-[10px] text-ink-faint font-normal tracking-widest">
              ({checks.length} Pokémon)
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {checks.map((c) => (
              <Link
                key={c.id}
                href={`/pokedex/${c.id}`}
                className="card-base card-hover p-3 group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={artworkFor(c.id)}
                    alt={c.name}
                    className="w-12 h-12 object-contain shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-sm">{c.name}</div>
                    <p className="text-xs text-ink-dim leading-snug mt-0.5">
                      {c.reason}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Estrategias generales */}
      {entry.strategies.length > 0 && (
        <section className="card-base p-5">
          <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
            <BookOpenIcon className="w-4 h-4 text-brand-glow" /> Cómo vencerlo
          </h2>
          <ul className="space-y-2.5">
            {entry.strategies.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-soft leading-relaxed">
                <span className="text-brand-glow shrink-0 mt-0.5">▸</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sets comunes que te vas a encontrar */}
      {entry.commonSets && entry.commonSets.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold mb-3">
            Sets que te vas a encontrar
          </h2>
          <div className="space-y-2">
            {entry.commonSets.map((set, i) => (
              <div key={i} className="card-base p-4">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                  <span className="font-display font-bold text-sm">
                    {set.name}
                  </span>
                  <span className="text-[10px] font-mono text-ink-faint">
                    {set.item} · {set.ability}
                  </span>
                </div>
                <div className="text-xs font-mono text-ink-dim mt-1">
                  {set.movesHint}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cross-links */}
      <div className="card-base p-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <span className="text-sm text-ink-dim">
          ¿Quieres más detalle competitivo?
        </span>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/pokedex/${pokemon.id}/competitive`}
            className="inline-flex items-center gap-1 text-xs font-bold px-3 h-9 rounded-lg bg-brand text-white hover:bg-brand-hover"
          >
            Sets + análisis completo
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/pokedex/${pokemon.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold px-3 h-9 rounded-lg glass hover:bg-white/[0.08]"
          >
            Pokédex
          </Link>
        </div>
      </div>
    </article>
  );
}
