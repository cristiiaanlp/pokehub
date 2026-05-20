import type { Metadata } from 'next';
import { fetchAllItemsSlim } from '@/lib/pokeapi-database';
import { ItemsDatabase } from '@/components/database/ItemsDatabase';

export const metadata: Metadata = {
  title: 'Database de items Pokémon · PokéHub',
  description:
    'Todos los items Pokémon Gen 1-9: held items, berries, evolution stones, medicinas. Con efectos, precios y Pokémon que los llevan.',
};

export const revalidate = 604800;

export default async function ItemsIndexPage() {
  const items = await fetchAllItemsSlim();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Database
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Items</h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          {items.length} items: held items competitivos, berries, evolution
          stones, medicinas y más. Filtrables por categoría.
        </p>
      </header>
      <ItemsDatabase items={items} />
    </div>
  );
}
