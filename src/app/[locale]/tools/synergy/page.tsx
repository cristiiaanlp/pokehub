import type { Metadata } from 'next';
import { SynergyAnalyzer } from '@/components/tools/SynergyAnalyzer';

export const metadata: Metadata = {
  title: 'Synergy Analyzer · ¿Funcionan juntos? · PokéHub',
  description:
    'Selecciona 2 Pokémon y obtén un score 0-100 de sinergia: cobertura defensiva, ofensiva, stat split y speed control.',
};

export default function SynergyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Synergy Analyzer
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Selecciona 2 Pokémon y te decimos cómo de bien funcionan juntos:
          coverage defensiva (¿se cubren sus debilidades?), ofensiva (¿abarcan
          tipos juntos?), stat split físico/especial, y speed control.
        </p>
      </header>
      <SynergyAnalyzer />
    </div>
  );
}
