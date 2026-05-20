import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getPokemon, artworkFor } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { bst, formatPokemonName, padId } from '@/lib/utils';
import { CompareControls } from '@/components/compare/CompareControls';
import { BoltIcon, ArrowRight } from '@/components/ui/Icon';
import type { PokemonDetail } from '@/types/pokemon';

export const revalidate = 86400;

interface PageProps {
  searchParams: { ids?: string };
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const ids = parseIds(searchParams.ids ?? '');
  if (ids.length === 0) {
    return {
      title: 'Comparar Pokémon · PokéHub',
      description:
        'Compara hasta 6 Pokémon lado a lado: stats, tipos, BST. Encuentra al ganador en cada métrica.',
    };
  }
  return {
    title: `Comparar ${ids.length} Pokémon · PokéHub`,
    description: 'Comparativa Pokémon side-by-side: HP, Atk, Def, SpA, SpD, Spe.',
  };
}

function parseIds(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => parseInt(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 1025)
    .slice(0, 6);
}

const STAT_ROWS = [
  { key: 'hp' as const, label: 'HP' },
  { key: 'attack' as const, label: 'Atk' },
  { key: 'defense' as const, label: 'Def' },
  { key: 'specialAttack' as const, label: 'SpA' },
  { key: 'specialDefense' as const, label: 'SpD' },
  { key: 'speed' as const, label: 'Spe' },
];

export default async function ComparePage({ searchParams }: PageProps) {
  const ids = parseIds(searchParams.ids ?? '');

  // Sin IDs → muestra picker vacío
  if (ids.length === 0) {
    return <EmptyState />;
  }

  // Solo 1 → redirige a la pokédex
  if (ids.length === 1) {
    redirect(`/pokedex/${ids[0]}`);
  }

  // Fetch en paralelo
  let pokemons: PokemonDetail[] = [];
  try {
    pokemons = await Promise.all(ids.map((id) => getPokemon(String(id))));
  } catch {
    return <EmptyState error="No se pudieron cargar todos los Pokémon. Revisa los IDs." />;
  }

  // Max por stat para coloreado
  const maxByStat = STAT_ROWS.reduce((acc, r) => {
    acc[r.key] = Math.max(...pokemons.map((p) => p.stats[r.key]));
    return acc;
  }, {} as Record<(typeof STAT_ROWS)[number]['key'], number>);
  const maxBst = Math.max(...pokemons.map((p) => bst(p.stats)));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
          Comparativa
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Comparando {pokemons.length} Pokémon
        </h1>
        <p className="text-sm text-ink-dim mt-1">
          El valor más alto de cada stat se resalta en verde. Click en cualquier
          Pokémon para ver su Pokédex.
        </p>
      </div>

      <CompareControls currentIds={ids} />

      {/* Header row: avatares */}
      <div
        className="card-base p-3 sm:p-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${pokemons.length}, minmax(0, 1fr))` }}
      >
        {pokemons.map((p) => (
          <Link
            key={p.id}
            href={`/pokedex/${p.id}`}
            className="card-base card-hover p-3 text-center group"
          >
            <div className="text-[10px] font-mono text-ink-faint">
              #{padId(p.id)}
            </div>
            <img
              src={artworkFor(p.id)}
              alt={p.name}
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain group-hover:scale-110 transition-transform"
            />
            <div className="font-display font-bold text-sm mt-1 truncate">
              {formatPokemonName(p.name)}
            </div>
            <div className="flex items-center gap-1 justify-center mt-1.5 flex-wrap">
              {p.types.map((t) => (
                <TypeBadge key={t} type={t} size="xs" />
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      <section className="card-base p-4 sm:p-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <BoltIcon className="w-4 h-4 text-accent-yellow" />
          Stats base comparativos
        </h2>
        <div className="space-y-4">
          {STAT_ROWS.map((row) => {
            const max = maxByStat[row.key];
            return (
              <div key={row.key}>
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1.5">
                  {row.label}
                </div>
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${pokemons.length}, minmax(0, 1fr))`,
                  }}
                >
                  {pokemons.map((p) => {
                    const val = p.stats[row.key];
                    const isMax = val === max && pokemons.filter((x) => x.stats[row.key] === max).length === 1;
                    const pct = (val / 255) * 100;
                    return (
                      <div key={p.id} className="space-y-1">
                        <div
                          className={`text-sm font-mono tabular-nums font-bold ${
                            isMax ? 'text-accent-green' : 'text-ink-soft'
                          }`}
                        >
                          {val}
                        </div>
                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isMax
                                ? 'bg-gradient-to-r from-accent-green to-emerald-600'
                                : 'bg-gradient-to-r from-brand/70 to-brand/40'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* BST row */}
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1.5">
              BST Total
            </div>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${pokemons.length}, minmax(0, 1fr))`,
              }}
            >
              {pokemons.map((p) => {
                const b = bst(p.stats);
                const isMax =
                  b === maxBst &&
                  pokemons.filter((x) => bst(x.stats) === maxBst).length === 1;
                return (
                  <div
                    key={p.id}
                    className={`font-display text-2xl font-bold tabular-nums ${
                      isMax ? 'text-accent-green' : 'text-ink'
                    }`}
                  >
                    {b}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="text-center pt-2">
        <Link
          href="/pokedex"
          className="text-sm text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
        >
          Ir a la Pokédex
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ error }: { error?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-20">
      <div className="card-base p-8 text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-2">
          Comparativa Pokémon
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3">
          Compara hasta 6 Pokémon a la vez
        </h1>
        {error && (
          <p className="text-sm text-accent-red mb-4">{error}</p>
        )}
        <p className="text-sm text-ink-dim mb-6">
          Añade Pokémon abajo o usa URLs tipo{' '}
          <code className="text-xs bg-white/[0.05] px-1.5 py-0.5 rounded">
            /compare?ids=6,9,150,448
          </code>
        </p>
        <CompareControls currentIds={[]} />
      </div>
    </div>
  );
}
