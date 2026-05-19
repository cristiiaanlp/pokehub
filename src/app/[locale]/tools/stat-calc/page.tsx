import type { Metadata } from 'next';
import { StatCalculator } from '@/components/tools/StatCalculator';

export const metadata: Metadata = {
  title: 'Stat Calculator · PokéHub',
  description:
    'Calcula las stats finales de cualquier Pokémon dado su nivel, IVs, EVs y naturaleza. Fórmulas oficiales Gen 9.',
};

export default function StatCalcPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Stat Calculator
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Calcula las stats finales de cualquier Pokémon. Elige base stats,
          nivel, naturaleza, IVs y EVs y ve el resultado al instante con la
          fórmula oficial de Game Freak.
        </p>
      </header>
      <StatCalculator />
    </div>
  );
}
