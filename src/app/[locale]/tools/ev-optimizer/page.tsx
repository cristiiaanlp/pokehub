import type { Metadata } from 'next';
import { EvOptimizer } from '@/components/tools/EvOptimizer';

export const metadata: Metadata = {
  title: 'EV Optimizer · PokéHub',
  description:
    'Encuentra los EVs exactos para outspeedear a cualquier Pokémon o resistir un golpe específico. Benchmarks de velocidad VGC + OU.',
};

export default function EVOptimizerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          EV Optimizer
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          ¿Quieres outspeedear a Garchomp scarf? ¿Necesitas exactly 252 HP para
          asegurar vivir un golpe? Esta herramienta te dice los EVs mínimos para
          alcanzar cualquier objetivo de stat.
        </p>
      </header>
      <EvOptimizer />
    </div>
  );
}
