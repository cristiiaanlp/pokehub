import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { fetchMoveDetail } from '@/lib/pokeapi-database';
import { artworkFor, getPokemon } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { ArrowRight, BookOpenIcon } from '@/components/ui/Icon';
import { getMoveDetail, slugifyMove } from '@/lib/moves-detail';
import { formatPokemonName } from '@/lib/utils';

export const revalidate = 604800;

interface PageProps {
  params: { name: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const move = await fetchMoveDetail(params.name);
  if (!move) return { title: 'Movimiento no encontrado' };
  const curated = getMoveDetail(params.name);
  return {
    title: `${move.displayName} · Movimiento Pokémon`,
    description:
      curated?.description ||
      move.shortEffect ||
      `${move.displayName}: ${move.type} ${move.damageClass}${
        move.power ? ` ${move.power} BP` : ''
      }${move.accuracy ? ` ${move.accuracy}% acc` : ''}.`,
  };
}

export default async function MoveDetailPage({ params }: PageProps) {
  const move = await fetchMoveDetail(params.name);
  if (!move) notFound();

  // Overlay competitive deep dive si tenemos data curada
  const curated = getMoveDetail(params.name);
  const notableUsers = curated
    ? await Promise.all(
        curated.notableUsers.map(async (id) => {
          try {
            const p = await getPokemon(id);
            return { id, name: formatPokemonName(p.name), types: p.types };
          } catch {
            return null;
          }
        })
      ).then((arr) => arr.filter((u): u is NonNullable<typeof u> => u !== null))
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <Link
        href="/database/moves"
        className="text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1"
      >
        <BookOpenIcon className="w-3.5 h-3.5" /> Todos los movimientos
      </Link>

      <header className="card-base p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="relative space-y-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold">
            Movimiento #{move.id}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {move.displayName}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={move.type} size="md" />
            <CategoryBadge cat={move.damageClass} />
            {move.priority !== 0 && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-accent-yellow/15 text-accent-yellow">
                Priority {move.priority > 0 ? '+' : ''}
                {move.priority}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Stats principales */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Poder (BP)" value={move.power?.toString() ?? '—'} tone="text-accent-red" />
        <StatBox
          label="Precisión"
          value={move.accuracy != null ? `${move.accuracy}%` : '—'}
          tone="text-accent-green"
        />
        <StatBox label="PP" value={move.pp.toString()} tone="text-brand-glow" />
        <StatBox
          label="Target"
          value={prettyTarget(move.target)}
          tone="text-purple-300"
          small
        />
      </section>

      {/* Efecto */}
      {move.shortEffect && (
        <section className="card-base p-5">
          <h2 className="font-display text-lg font-bold mb-2">Efecto</h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            {move.shortEffect.replace(
              '$effect_chance',
              move.effectChance?.toString() ?? '0'
            )}
          </p>
          {move.effectText && move.effectText !== move.shortEffect && (
            <details className="mt-3 text-xs text-ink-dim">
              <summary className="cursor-pointer hover:text-ink">
                Descripción completa
              </summary>
              <p className="mt-2 leading-relaxed">
                {move.effectText.replace(
                  '$effect_chance',
                  move.effectChance?.toString() ?? '0'
                )}
              </p>
            </details>
          )}
        </section>
      )}

      {move.flavorText && (
        <section className="card-base p-5 bg-white/[0.02]">
          <p className="text-sm text-ink-dim italic leading-relaxed">
            "{move.flavorText}"
          </p>
        </section>
      )}

      {/* Análisis competitivo curado — solo si tenemos data */}
      {curated && (
        <section className="card-base p-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
          <div className="relative space-y-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-brand-glow" />
              Análisis competitivo
              <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand/20 text-brand-glow">
                NEW
              </span>
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              {curated.description}
            </p>
            {curated.notes && (
              <div className="border-l-4 border-l-brand-glow bg-brand/[0.04] rounded-r-lg p-3">
                <div className="text-xs font-bold text-brand-glow mb-1">
                  💡 Tip
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  {curated.notes}
                </p>
              </div>
            )}
            {notableUsers.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">
                  Usuarios destacados
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {notableUsers.map((u) => (
                    <Link
                      key={u.id}
                      href={`/pokedex/${u.id}`}
                      className="card-base card-hover p-2 text-center group"
                    >
                      <img
                        src={artworkFor(u.id)}
                        alt={u.name}
                        className="w-12 h-12 mx-auto object-contain group-hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                      <div className="text-[10px] font-bold mt-1 truncate">
                        {u.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Link
                href={`/tools/damage-calc?m=${encodeURIComponent(curated.data.name)}`}
                className="text-xs font-bold text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
              >
                Calcular daño →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Aprendido por */}
      {move.learnedBy.length > 0 && (
        <section className="card-base p-5">
          <h2 className="font-display text-lg font-bold mb-3">
            Aprendido por ({move.learnedBy.length}+)
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            {move.learnedBy.map((p) => (
              <Link
                key={p.id}
                href={`/pokedex/${p.id}`}
                className="card-base card-hover p-2 text-center group"
              >
                <img
                  src={artworkFor(p.id)}
                  alt={p.name}
                  className="w-14 h-14 mx-auto object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
                <div className="text-[10px] capitalize mt-1 truncate">
                  {p.name.replace(/-/g, ' ')}
                </div>
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-ink-faint mt-3">
            Mostrando primeros 30. Datos de PokéAPI.
          </p>
        </section>
      )}

      <div className="text-center pt-4">
        <Link
          href="/database/moves"
          className="inline-flex items-center gap-1 text-sm text-brand-glow hover:text-brand-hover"
        >
          ← Buscar más movimientos
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: string;
  tone: string;
  small?: boolean;
}) {
  return (
    <div className="card-base p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
        {label}
      </div>
      <div
        className={`font-display font-bold mt-1 tabular-nums ${tone} ${
          small ? 'text-sm' : 'text-2xl'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: 'physical' | 'special' | 'status' }) {
  const map = {
    physical: { label: 'Físico', cls: 'bg-accent-red/15 text-accent-red' },
    special: { label: 'Especial', cls: 'bg-brand/15 text-brand-glow' },
    status: { label: 'Estado', cls: 'bg-ink-faint/15 text-ink-faint' },
  };
  const { label, cls } = map[cat];
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${cls}`}
    >
      {label}
    </span>
  );
}

function prettyTarget(t: string): string {
  const map: Record<string, string> = {
    'selected-pokemon': 'Un rival',
    'all-opponents': 'Ambos rivales',
    'all-other-pokemon': 'Todos menos uno',
    user: 'Uno mismo',
    'all-pokemon': 'Todos en campo',
    'random-opponent': 'Rival random',
    ally: 'Aliado',
    'users-field': 'Campo aliado',
    'opponents-field': 'Campo rival',
    'entire-field': 'Campo total',
    'all-allies': 'Aliados',
  };
  return map[t] ?? t.replace(/-/g, ' ');
}
