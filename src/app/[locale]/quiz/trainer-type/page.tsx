import type { Metadata } from 'next';
import { TrainerQuiz } from '@/components/quiz/TrainerQuiz';

export const metadata: Metadata = {
  title: '¿Qué tipo de entrenador Pokémon eres? · Test · PokéHub',
  description:
    '8 preguntas. Descubre tu arquetipo competitivo: Sweeper, Stall, Balance, Hyper Offense, Bulky Offense o Gimmick. Comparte tu resultado.',
  openGraph: {
    title: '¿Qué tipo de entrenador Pokémon eres?',
    description: 'Test de 8 preguntas para descubrir tu estilo competitivo.',
  },
};

export default function TrainerTypeQuizPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Personality Quiz
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          ¿Qué tipo de entrenador eres?
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-md mx-auto">
          8 preguntas para descubrir tu arquetipo competitivo. Comparte tu
          resultado con tu propia imagen única.
        </p>
      </header>
      <TrainerQuiz />
    </div>
  );
}
