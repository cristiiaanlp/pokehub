import type { Metadata } from 'next';
import { fetchAllAbilitiesSlim } from '@/lib/pokeapi-database';
import { AbilitiesDatabase } from '@/components/database/AbilitiesDatabase';

export const metadata: Metadata = {
  title: 'Database de habilidades Pokémon · PokéHub',
  description:
    'Todas las habilidades Pokémon Gen 1-9 con descripción detallada y los Pokémon que las tienen (incluyendo hidden abilities).',
};

export const revalidate = 604800;

export default async function AbilitiesIndexPage() {
  const abilities = await fetchAllAbilitiesSlim();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Database
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Habilidades
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          {abilities.length} habilidades de Pokémon Gen 1-9 con descripción y la
          lista de Pokémon que la tienen, incluyendo hidden abilities.
        </p>
      </header>
      <AbilitiesDatabase abilities={abilities} />
    </div>
  );
}
