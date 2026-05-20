import type { Metadata } from 'next';
import { TierMaker } from '@/components/tools/TierMaker';

export const metadata: Metadata = {
  title: 'Pokémon Tier List Maker · PokéHub',
  description:
    'Crea tu propia tier list S/A/B/C/D arrastrando Pokémon. Compártela con un link único.',
};

export default function TierListPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Tier List Maker
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Arrastra Pokémon a tiers S/A/B/C/D para crear tu propia tier list.
          La URL se actualiza sola — copia y comparte.
        </p>
      </header>
      <TierMaker />
    </div>
  );
}
