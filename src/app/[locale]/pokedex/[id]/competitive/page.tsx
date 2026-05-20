import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getPokemon, artworkFor, TOTAL_POKEMON } from '@/lib/pokeapi';
import { POPULAR_SETS } from '@/lib/meta/sets';
import {
  weakTypes,
  typeChecks,
  getSpecificCounters,
} from '@/lib/meta/counters';
import { effectivenessAgainst } from '@/lib/type-effectiveness';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { bst, formatPokemonName, padId } from '@/lib/utils';
import { SITE } from '@/lib/site';
import {
  TrophyIcon,
  ShieldIcon,
  SwordIcon,
  BoltIcon,
  ChartIcon,
  ArrowRight,
  BookOpenIcon,
} from '@/components/ui/Icon';
import type { PokemonDetail } from '@/types/pokemon';

export const revalidate = 86400; // 24h

interface PageProps {
  params: { id: string; locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const p = await getPokemon(params.id);
    const name = formatPokemonName(p.name);
    const types = p.types.join('/');
    return {
      title: `${name} Competitivo · Sets · Counters · Partners`,
      description: `Análisis competitivo de ${name} (${types}) en Pokémon SV: mejores sets, counters, partners ideales y rol en el meta.`,
      openGraph: {
        title: `${name} Competitivo · PokéHub`,
        description: `Sets, counters, partners y rol meta de ${name}.`,
      },
      alternates: {
        canonical: `${SITE.url}/pokedex/${p.id}/competitive`,
      },
    };
  } catch {
    return { title: 'Pokémon Competitivo · PokéHub' };
  }
}

function inferRole(p: PokemonDetail): {
  label: string;
  emoji: string;
  description: string;
} {
  const { hp, attack, defense, specialAttack, specialDefense, speed } = p.stats;
  const total = bst(p.stats);
  const physAtk = attack;
  const specAtk = specialAttack;
  const bulk = (hp + defense + specialDefense) / 3;

  // Heurística: priority + speed + offense
  if (speed >= 100 && Math.max(physAtk, specAtk) >= 110) {
    return {
      label: physAtk > specAtk ? 'Physical Sweeper' : 'Special Sweeper',
      emoji: physAtk > specAtk ? '⚔️' : '✨',
      description:
        'Velocidad alta + ataque alto. Diseñado para limpiar equipos tras un setup o boost.',
    };
  }
  if (speed <= 50 && bulk >= 90) {
    return {
      label: 'Wall / TR Tank',
      emoji: '🛡️',
      description:
        'Bulky con poca velocidad. Aguanta hits, ideal bajo Trick Room o como wall mixto.',
    };
  }
  if (bulk >= 100 && total >= 500) {
    return {
      label: 'Bulky Attacker',
      emoji: '🪨',
      description: 'Combina daño con resistencia. Pivote ofensivo flexible.',
    };
  }
  if (total <= 480) {
    return {
      label: 'NFE / Untiered',
      emoji: '📉',
      description: 'BST bajo. Compite en formatos más bajos o como utility.',
    };
  }
  return {
    label: 'Generalist',
    emoji: '🎯',
    description: 'Stats balanceadas. Versátil pero sin nicho extremo.',
  };
}

export default async function CompetitivePage({ params }: PageProps) {
  let pokemon: PokemonDetail;
  try {
    pokemon = await getPokemon(params.id);
  } catch {
    return notFound();
  }

  const role = inferRole(pokemon);
  const sets = POPULAR_SETS[pokemon.id] ?? [];
  const weaks = weakTypes(pokemon.types);
  const checks = typeChecks(pokemon.types).slice(0, 8);
  const specificCounterIds = getSpecificCounters(pokemon.id);
  const effectiveness = effectivenessAgainst(pokemon.types);
  const resistsX4 = effectiveness.filter((r) => r.multiplier === 0.25);
  const immunities = effectiveness.filter((r) => r.multiplier === 0);
  const weakX4 = effectiveness.filter((r) => r.multiplier === 4);

  // JSON-LD para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${formatPokemonName(pokemon.name)} Competitivo`,
    description: `Análisis competitivo de ${formatPokemonName(pokemon.name)}: sets, counters, partners.`,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/icon` },
    },
    image: artworkFor(pokemon.id),
    mainEntityOfPage: `${SITE.url}/pokedex/${pokemon.id}/competitive`,
  };

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/pokedex/${pokemon.id}`}
        className="text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1"
      >
        ← Volver a la Pokédex de {formatPokemonName(pokemon.name)}
      </Link>

      {/* Hero */}
      <header className="card-base p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-5 flex-wrap">
          <img
            src={artworkFor(pokemon.id)}
            alt={pokemon.name}
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-ink-faint">
              #{padId(pokemon.id)} · Análisis competitivo
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">
              {formatPokemonName(pokemon.name)}
            </h1>
            <div className="flex items-center gap-1.5 mt-2">
              {pokemon.types.map((t) => (
                <TypeBadge key={t} type={t} size="md" />
              ))}
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-sm bg-white/[0.04] rounded-lg px-3 py-1.5">
              <span className="text-base">{role.emoji}</span>
              <span className="font-display font-bold">{role.label}</span>
            </div>
          </div>
        </div>
        <p className="relative text-sm text-ink-soft mt-4 leading-relaxed">
          {role.description}
        </p>
      </header>

      {/* Stats core */}
      <section className="grid grid-cols-3 gap-2">
        <StatCard label="BST" value={bst(pokemon.stats)} Icon={ChartIcon} tone="text-brand-glow" />
        <StatCard
          label="Velocidad"
          value={pokemon.stats.speed}
          Icon={BoltIcon}
          tone="text-accent-yellow"
        />
        <StatCard
          label="Mejor stat ofensiva"
          value={Math.max(pokemon.stats.attack, pokemon.stats.specialAttack)}
          Icon={SwordIcon}
          tone="text-accent-red"
        />
      </section>

      {/* Sets competitivos */}
      <section>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-brand-glow" /> Sets competitivos
        </h2>
        {sets.length === 0 ? (
          <div className="card-base p-5 text-sm text-ink-dim text-center">
            Aún no tenemos sets curados para este Pokémon. Mientras tanto,
            puedes generar uno con nuestro{' '}
            <Link href="/tools/moveset-wizard" className="text-brand-glow underline">
              Moveset Wizard
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-3">
            {sets.map((set, i) => (
              <div key={i} className="card-base p-4">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                  <div className="font-display font-bold">{set.setName}</div>
                  <div className="text-[10px] font-mono text-ink-faint">
                    {set.item} · {set.ability} · {set.nature}
                  </div>
                </div>
                <p className="text-xs text-ink-dim mb-3">{set.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {set.moves.map((m) => (
                    <div
                      key={m}
                      className="text-xs px-2 py-1 rounded bg-white/[0.04] font-mono"
                    >
                      {m}
                    </div>
                  ))}
                </div>
                {set.teraType && (
                  <div className="mt-2 text-[10px] text-ink-faint">
                    Tera Type recomendado:{' '}
                    <span className="text-purple-300 font-bold">
                      {set.teraType}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Defensive profile */}
      <section className="grid sm:grid-cols-2 gap-3">
        <div className="card-base p-4">
          <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2 text-accent-red">
            <ShieldIcon className="w-4 h-4" />
            Débil contra
          </h3>
          {weaks.length === 0 && weakX4.length === 0 ? (
            <p className="text-xs text-ink-dim">Sin debilidades — bestia.</p>
          ) : (
            <>
              {weakX4.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] text-accent-red font-bold uppercase tracking-widest mb-1">
                    ×4 weak
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {weakX4.map((w) => (
                      <TypeBadge key={w.type} type={w.type} size="xs" />
                    ))}
                  </div>
                </div>
              )}
              <div className="text-[10px] text-ink-faint font-bold uppercase tracking-widest mb-1">
                ×2 weak
              </div>
              <div className="flex flex-wrap gap-1">
                {weaks
                  .filter(
                    (w) => !weakX4.some((x) => x.type === w)
                  )
                  .map((w) => (
                    <TypeBadge key={w} type={w} size="xs" />
                  ))}
              </div>
            </>
          )}
        </div>

        <div className="card-base p-4">
          <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2 text-accent-green">
            <ShieldIcon className="w-4 h-4" />
            Resistencias notables
          </h3>
          {resistsX4.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] text-accent-green font-bold uppercase tracking-widest mb-1">
                ×¼ super resists
              </div>
              <div className="flex flex-wrap gap-1">
                {resistsX4.map((r) => (
                  <TypeBadge key={r.type} type={r.type} size="xs" />
                ))}
              </div>
            </div>
          )}
          {immunities.length > 0 && (
            <>
              <div className="text-[10px] text-brand-glow font-bold uppercase tracking-widest mb-1">
                ×0 inmune
              </div>
              <div className="flex flex-wrap gap-1">
                {immunities.map((r) => (
                  <TypeBadge key={r.type} type={r.type} size="xs" />
                ))}
              </div>
            </>
          )}
          {resistsX4.length === 0 && immunities.length === 0 && (
            <p className="text-xs text-ink-dim">Sin resistencias notables.</p>
          )}
        </div>
      </section>

      {/* Counters */}
      {specificCounterIds.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
            <SwordIcon className="w-5 h-5 text-accent-red" /> Counters meta
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {specificCounterIds.map((cid) => (
              <Link
                key={cid}
                href={`/pokedex/${cid}`}
                className="card-base card-hover p-2 text-center group"
              >
                <img
                  src={artworkFor(cid)}
                  alt={`#${cid}`}
                  className="w-16 h-16 mx-auto object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
                <div className="text-[10px] font-mono text-ink-faint mt-1">
                  #{padId(cid)}
                </div>
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-ink-faint mt-2">
            Counters específicos del meta SV — Pokémon que ganan el matchup
            consistentemente.
          </p>
        </section>
      )}

      {/* Type checks (calculated) */}
      {checks.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-brand-glow" /> Tipos que lo
            checkean
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {checks.map((c) => (
              <div
                key={c.type}
                className="card-base p-2 flex items-center gap-2"
              >
                <TypeBadge type={c.type} size="xs" />
                <div className="text-[10px] flex-1">
                  <div className="text-ink-soft">
                    Recibe {c.defendsBest}×
                  </div>
                  {c.hitsBack && (
                    <div className="text-accent-green">
                      Pega +{c.hitsBack} ×2
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-ink-faint mt-2">
            Tipos defensivos que resisten todas las STABs de{' '}
            {formatPokemonName(pokemon.name)} y le pueden devolver el golpe.
          </p>
        </section>
      )}

      {/* CTA */}
      <section className="card-base p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <div className="font-display font-bold text-sm">
            ¿Quieres probarlo en tu equipo?
          </div>
          <p className="text-xs text-ink-dim mt-0.5">
            Llévalo al Team Builder y mira su matchup vs todo el meta.
          </p>
        </div>
        <Link
          href="/team-builder"
          className="h-10 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover inline-flex items-center gap-1.5"
        >
          Ir al Team Builder
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    </article>
  );
}

function StatCard({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  Icon: any;
  tone: string;
}) {
  return (
    <div className="card-base p-3 text-center">
      <Icon className={`w-4 h-4 mx-auto ${tone}`} />
      <div className={`font-display text-2xl font-bold mt-1 tabular-nums ${tone}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-ink-faint mt-0.5">
        {label}
      </div>
    </div>
  );
}
