'use client';

import { useTypeMasterStore } from '@/stores/typemasterStore';
import {
  TrophyIcon,
  FlameIcon,
  TargetIcon,
  BoltIcon,
} from '@/components/ui/Icon';

export function StatStrip() {
  const totalCorrect = useTypeMasterStore((s) => s.totalCorrect);
  const totalAnswered = useTypeMasterStore((s) => s.totalAnswered);
  const bestCombo = useTypeMasterStore((s) => s.bestComboAllTime);
  const daily = useTypeMasterStore((s) => s.dailyStreak);
  const totalQuizzes = useTypeMasterStore((s) => s.totalQuizzes);

  const acc = totalAnswered === 0 ? 0 : (totalCorrect / totalAnswered) * 100;

  const items = [
    {
      label: 'Precisión',
      value: totalAnswered ? `${acc.toFixed(0)}%` : '—',
      Icon: TargetIcon,
      tone: 'text-brand-glow',
    },
    {
      label: 'Mejor combo',
      value: bestCombo > 0 ? `×${bestCombo}` : '—',
      Icon: FlameIcon,
      tone: 'text-accent-red',
    },
    {
      label: 'Daily streak',
      value: `${daily}d`,
      Icon: BoltIcon,
      tone: 'text-accent-yellow',
    },
    {
      label: 'Quizzes',
      value: String(totalQuizzes),
      Icon: TrophyIcon,
      tone: 'text-accent-green',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className="card-base p-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
              {it.label}
            </div>
            <it.Icon className={`w-4 h-4 ${it.tone}`} />
          </div>
          <div className="font-display text-2xl font-bold mt-1">{it.value}</div>
        </div>
      ))}
    </div>
  );
}
