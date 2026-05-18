import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPokemon, artworkFor } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { effectivenessAgainst } from '@/lib/type-effectiveness';
import { bst, formatPokemonName, padId } from '@/lib/utils';
import {
  ArrowRight,
  BoltIcon,
  ShieldIcon,
  SwordIcon,
} from '@/components/ui/Icon';
import type { PokemonDetail } from '@/types/pokemon';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: { a: string; b: string };
}) {
  return {
    title: `${params.a} vs ${params.b} · Comparar`,
    description: `Compara stats, tipos y matchups de ${params.a} contra ${params.b}.`,
  };
}

interface CompareRow {
  label: string;
  a: number;
  b: number;
  max: number;
}

export default async function ComparePage({
  params,
}: {
  params: { a: string; b: string };
}) {
  let a: PokemonDetail;
  let b: PokemonDetail;
  try {
    [a, b] = await Promise.all([getPokemon(params.a), getPokemon(params.b)]);
  } catch {
    return notFound();
  }

  const rows: CompareRow[] = [
    { label: 'HP', a: a.stats.hp, b: b.stats.hp, max: 255 },
    { label: 'Ataque', a: a.stats.attack, b: b.stats.attack, max: 255 },
    { label: 'Defensa', a: a.stats.defense, b: b.stats.defense, max: 255 },
    {
      label: 'Atq. Esp.',
      a: a.stats.specialAttack,
      b: b.stats.specialAttack,
      max: 255,
    },
    {
      label: 'Def. Esp.',
      a: a.stats.specialDefense,
      b: b.stats.specialDefense,
      max: 255,
    },
    { label: 'Velocidad', a: a.stats.speed, b: b.stats.speed, max: 255 },
  ];

  const bstA = bst(a.stats);
  const bstB = bst(b.stats);

  // Matchup: a attacking b and vice versa
  // For each Pokémon's STABs, what's the multiplier against the other?
  const aHitsB = a.types
    .map((t) => {
      const r = effectivenessAgainst(b.types);
      const row = r.find((x) => x.type === t);
      return { type: t, mult: row?.multiplier ?? 1 };
    })
    .reduce((max, x) => (x.mult > max.mult ? x : max), {
      type: a.types[0],
      mult: 0,
    });
  const bHitsA = b.types
    .map((t) => {
      const r = effectivenessAgainst(a.types);
      const row = r.find((x) => x.type === t);
      return { type: t, mult: row?.multiplier ?? 1 };
    })
    .reduce((max, x) => (x.mult > max.mult ? x : max), {
      type: b.types[0],
      mult: 0,
    });

  const winsCount = (color: 'a' | 'b') =>
    rows.filter((r) => (color === 'a' ? r.a > r.b : r.b > r.a)).length;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
          Comparativa Pokémon
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {formatPokemonName(a.name)}{' '}
          <span className="text-ink-faint">vs</span>{' '}
          {formatPokemonName(b.name)}
        </h1>
      </div>

      {/* Header cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <ComparePokeHeader p={a} bst={bstA} winsRow={winsCount('a')} side="left" />
        <ComparePokeHeader p={b} bst={bstB} winsRow={winsCount('b')} side="right" />
      </div>

      {/* Stats grid */}
      <section className="card-base p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <BoltIcon className="w-4 h-4 text-accent-yellow" />
          Stats base
        </h2>
        <div className="space-y-3">
          {rows.map((r) => {
            const aWin = r.a > r.b;
            const bWin = r.b > r.a;
            const aPct = (r.a / r.max) * 100;
            const bPct = (r.b / r.max) * 100;
            return (
              <div key={r.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={`font-mono tabular-nums ${
                      aWin
                        ? 'text-accent-green font-bold'
                        : 'text-ink-soft'
                    }`}
                  >
                    {r.a}
                  </span>
                  <span className="text-ink-faint font-semibold uppercase tracking-widest text-[10px]">
                    {r.label}
                  </span>
                  <span
                    className={`font-mono tabular-nums ${
                      bWin
                        ? 'text-accent-green font-bold'
                        : 'text-ink-soft'
                    }`}
                  >
                    {r.b}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden flex flex-row-reverse">
                    <div
                      className={`h-full ${
                        aWin
                          ? 'bg-gradient-to-l from-accent-green to-emerald-600'
                          : 'bg-gradient-to-l from-brand/70 to-brand/40'
                      }`}
                      style={{ width: `${aPct}%` }}
                    />
                  </div>
                  <div className="w-1 h-3 bg-white/[0.10] rounded" />
                  <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        bWin
                          ? 'bg-gradient-to-r from-accent-green to-emerald-600'
                          : 'bg-gradient-to-r from-brand/70 to-brand/40'
                      }`}
                      style={{ width: `${bPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
            <div
              className={`font-display text-2xl font-bold tabular-nums ${
                bstA > bstB ? 'text-accent-green' : 'text-ink'
              }`}
            >
              {bstA}
            </div>
            <div className="text-xs text-ink-faint uppercase tracking-widest font-semibold">
              BST total
            </div>
            <div
              className={`font-display text-2xl font-bold tabular-nums ${
                bstB > bstA ? 'text-accent-green' : 'text-ink'
              }`}
            >
              {bstB}
            </div>
          </div>
        </div>
      </section>

      {/* Matchup */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <SwordIcon className="w-4 h-4 text-accent-red" />
            {formatPokemonName(a.name)} → {formatPokemonName(b.name)}
          </h3>
          <div className="flex items-center gap-3">
            <TypeBadge type={aHitsB.type} size="md" />
            <div>
              <div
                className={`font-display text-3xl font-bold ${
                  aHitsB.mult >= 2
                    ? 'text-accent-green'
                    : aHitsB.mult === 0
                    ? 'text-accent-red'
                    : 'text-ink-soft'
                }`}
              >
                {aHitsB.mult}×
              </div>
              <div className="text-xs text-ink-faint">
                {aHitsB.mult >= 2
                  ? 'super-eficaz'
                  : aHitsB.mult === 0
                  ? 'inmune'
                  : aHitsB.mult < 1
                  ? 'resiste'
                  : 'daño normal'}
              </div>
            </div>
          </div>
        </div>
        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <ShieldIcon className="w-4 h-4 text-brand-glow" />
            {formatPokemonName(b.name)} → {formatPokemonName(a.name)}
          </h3>
          <div className="flex items-center gap-3">
            <TypeBadge type={bHitsA.type} size="md" />
            <div>
              <div
                className={`font-display text-3xl font-bold ${
                  bHitsA.mult >= 2
                    ? 'text-accent-green'
                    : bHitsA.mult === 0
                    ? 'text-accent-red'
                    : 'text-ink-soft'
                }`}
              >
                {bHitsA.mult}×
              </div>
              <div className="text-xs text-ink-faint">
                {bHitsA.mult >= 2
                  ? 'super-eficaz'
                  : bHitsA.mult === 0
                  ? 'inmune'
                  : bHitsA.mult < 1
                  ? 'resiste'
                  : 'daño normal'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          href={`/pokedex/${a.id}`}
          className="text-sm text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
        >
          Ver {formatPokemonName(a.name)} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-ink-faint">·</span>
        <Link
          href={`/pokedex/${b.id}`}
          className="text-sm text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
        >
          Ver {formatPokemonName(b.name)} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function ComparePokeHeader({
  p,
  bst,
  side,
}: {
  p: PokemonDetail;
  bst: number;
  winsRow: number;
  side: 'left' | 'right';
}) {
  return (
    <div className="card-base p-5 relative overflow-hidden">
      <div
        className={`absolute top-0 ${
          side === 'left' ? '-left-12' : '-right-12'
        } w-44 h-44 rounded-full bg-brand/15 blur-3xl pointer-events-none`}
      />
      <div className="relative flex items-center gap-4">
        <img
          src={artworkFor(p.id)}
          alt={p.name}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain shrink-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-mono text-ink-faint">
            #{padId(p.id)}
          </div>
          <Link
            href={`/pokedex/${p.id}`}
            className="font-display text-xl font-bold hover:text-brand-glow"
          >
            {formatPokemonName(p.name)}
          </Link>
          <div className="flex flex-wrap gap-1 mt-1">
            {p.types.map((t) => (
              <TypeBadge key={t} type={t} size="xs" />
            ))}
          </div>
          <div className="text-xs text-ink-dim mt-2">
            BST <span className="font-bold text-ink">{bst}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
