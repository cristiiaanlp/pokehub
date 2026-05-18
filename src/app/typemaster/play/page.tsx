'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuizScreen } from '@/components/typemaster/QuizScreen';
import { DIFFICULTY_CONFIG, type Difficulty } from '@/lib/typemaster/xp-system';

function PlayInner() {
  const params = useSearchParams();
  const raw = (params.get('difficulty') ?? 'beginner') as Difficulty;
  const daily = params.get('daily') === '1';
  const difficulty: Difficulty = (Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).includes(raw)
    ? raw
    : 'beginner';
  // Daily challenge always runs in advanced base difficulty
  const effective: Difficulty = daily ? 'advanced' : difficulty;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 lg:py-10">
      <QuizScreen
        key={`${effective}-${daily ? 'daily' : 'normal'}`}
        difficulty={effective}
        daily={daily}
      />
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 text-center text-ink-dim">
          Cargando…
        </div>
      }
    >
      <PlayInner />
    </Suspense>
  );
}
