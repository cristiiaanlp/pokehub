import type { Metadata } from 'next';
import { DailyTrivia } from '@/components/daily/DailyTrivia';

export const metadata: Metadata = {
  title: 'Trivia diaria competitiva · Daily challenge · PokéHub',
  description:
    '5 preguntas de Pokémon competitivo cada día: stats, mecánicas, meta SV. Pon a prueba tu conocimiento y mantén tu racha.',
};

export default function DailyTriviaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Daily Challenge
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Trivia competitiva diaria
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-xl">
          5 preguntas nuevas cada 24h sobre el meta Pokémon SV: stats, mecánicas,
          tipos, historia. Mantén tu racha y conviértete en un experto del meta.
        </p>
      </header>
      <DailyTrivia />
    </div>
  );
}
