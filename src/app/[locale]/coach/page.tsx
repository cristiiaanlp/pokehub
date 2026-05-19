import type { Metadata } from 'next';
import { AiCoach } from '@/components/coach/AiCoach';

export const metadata: Metadata = {
  title: 'AI Pokémon Coach · PokéHub',
  description:
    'Tu entrenador competitivo personal. Pide counters, sets, equipos completos o análisis de tu team. Powered by Claude.',
};

export default function CoachPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          AI · Sólo PokéHub
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Pokémon AI Coach
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Tu entrenador competitivo personal. Pídele counters específicos, sets
          optimizados, equipos completos o que analice tu equipo guardado.
          Funciona con Claude Sonnet 4.6 — datos del meta SV actualizados.
        </p>
      </header>
      <AiCoach />
    </div>
  );
}
