import type { Metadata } from 'next';
import { MovesetWizard } from '@/components/tools/MovesetWizard';

export const metadata: Metadata = {
  title: 'Moveset Wizard · PokéHub',
  description:
    'Selecciona un Pokémon y su rol (sweeper, wall, pivot, lead, trick room) y obtén un moveset competitivo sugerido automáticamente.',
};

export default function MovesetWizardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Moveset Wizard
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Selecciona cualquier Pokémon y un rol (sweeper, wall, pivot, lead,
          trick room) → te sugerimos un set de 4 movimientos competitivos
          basado en su learnset. Sin IA — pura lógica determinista.
        </p>
      </header>
      <MovesetWizard />
    </div>
  );
}
