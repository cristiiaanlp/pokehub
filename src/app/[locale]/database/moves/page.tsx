import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { fetchAllMovesSlim } from '@/lib/pokeapi-database';
import { MovesDatabase } from '@/components/database/MovesDatabase';
import { getAllMoveDetails } from '@/lib/moves-detail';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { ArrowRight, BookOpenIcon } from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Database de movimientos Pokémon · PokéHub',
  description:
    'Lista filtrable de todos los movimientos Pokémon: BP, accuracy, tipo, categoría física/especial/estado. Datos Gen 1-9.',
};

// Revalida 1 vez por semana — los moves son data estática.
export const revalidate = 604800;

export default async function MovesIndexPage() {
  const moves = await fetchAllMovesSlim();
  const featuredMoves = getAllMoveDetails().slice(0, 8);
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Database
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Movimientos
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          {moves.length} movimientos Gen 1-9. Filtra por tipo, categoría
          (físico/especial/estado), BP y accuracy. Click en cualquiera para ver
          quién lo aprende.
        </p>
      </header>

      {/* Deep dives — featured */}
      <section>
        <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-brand-glow" />
          Análisis competitivos
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand/20 text-brand-glow">
            NEW
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {featuredMoves.map((m) => (
            <Link
              key={m.slug}
              href={`/database/moves/${m.slug}`}
              className="card-base card-hover p-3 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <TypeBadge type={m.data.type} size="xs" />
                <span className="text-[9px] font-mono text-ink-faint">
                  {m.data.basePower} BP
                </span>
              </div>
              <div className="font-display font-bold text-sm truncate">
                {m.data.name}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-ink-dim capitalize">
                  {m.data.category}
                </span>
                <ArrowRight className="w-3 h-3 text-ink-faint group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <MovesDatabase moves={moves} />
    </div>
  );
}
