import type { Metadata } from 'next';
import { ReplayAnalyzer } from '@/components/tools/ReplayAnalyzer';

export const metadata: Metadata = {
  title: 'Pokémon Showdown Replay Analyzer · PokéHub',
  description:
    'Pega el link de una battle de Pokémon Showdown y obtén un breakdown: equipos, KOs, MVP, turnos clave y tipos Tera usados.',
};

export default function ReplayAnalyzerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Replay Analyzer
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Pega el link de una battle de Pokémon Showdown y te enseñamos los
          equipos, KOs, tipos Tera elegidos, MVP de cada lado y momentos clave
          turno a turno.
        </p>
      </header>
      <ReplayAnalyzer />
    </div>
  );
}
