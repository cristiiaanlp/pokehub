import type { Metadata } from 'next';
import { fetchAllMovesSlim } from '@/lib/pokeapi-database';
import { MovesDatabase } from '@/components/database/MovesDatabase';

export const metadata: Metadata = {
  title: 'Database de movimientos Pokémon · PokéHub',
  description:
    'Lista filtrable de todos los movimientos Pokémon: BP, accuracy, tipo, categoría física/especial/estado. Datos Gen 1-9.',
};

// Revalida 1 vez por semana — los moves son data estática.
export const revalidate = 604800;

export default async function MovesIndexPage() {
  const moves = await fetchAllMovesSlim();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
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
      <MovesDatabase moves={moves} />
    </div>
  );
}
