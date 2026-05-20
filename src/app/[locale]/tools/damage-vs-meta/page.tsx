import type { Metadata } from 'next';
import { BatchDamageCalc } from '@/components/tools/BatchDamageCalc';

export const metadata: Metadata = {
  title: 'Damage Calc vs Meta · PokéHub',
  description:
    'Calcula el daño de tu atacante contra el top 10 del meta competitivo a la vez. Detecta OHKO/2HKO contra cada Pokémon meta.',
};

export default function DamageVsMetaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Damage Calc vs Meta
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Configura tu atacante una vez (Pokémon + move + item + EVs/Nature) y
          ve el daño contra los <strong className="text-ink">top 10 del meta</strong> al
          instante. Marca OHKO/2HKO/3HKO automáticamente.
        </p>
      </header>
      <BatchDamageCalc />
    </div>
  );
}
