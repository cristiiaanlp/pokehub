'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  getAllStreaks,
  type DailyStreakSummary,
} from '@/lib/streaks';
import { FireIcon, CheckIcon, ArrowRight } from '@/components/ui/Icon';

export function DailyStreaksOverview() {
  const [streaks, setStreaks] = useState<DailyStreakSummary[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStreaks(getAllStreaks());
  }, []);

  if (!mounted) {
    return (
      <div className="card-base p-5 text-center text-ink-faint text-sm">
        Cargando rachas…
      </div>
    );
  }

  const totalCompleted = streaks.reduce((acc, s) => acc + s.total, 0);
  const longestStreak = Math.max(...streaks.map((s) => s.streak), 0);
  const completedToday = streaks.filter((s) => s.completedToday).length;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-accent-yellow" />
          Mis rachas diarias
        </h2>
        <div className="text-xs text-ink-faint">
          {completedToday}/{streaks.length} completados hoy
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryStat
          label="Mayor racha"
          value={`${longestStreak}d`}
          tone="text-accent-yellow"
        />
        <SummaryStat
          label="Días totales"
          value={String(totalCompleted)}
          tone="text-brand-glow"
        />
        <SummaryStat
          label="Hoy completados"
          value={`${completedToday}/${streaks.length}`}
          tone={completedToday === streaks.length ? 'text-accent-green' : 'text-ink'}
        />
      </div>

      {/* Listado por daily */}
      <div className="space-y-2">
        {streaks.map((s) => (
          <Link
            key={s.meta.key}
            href={s.meta.href}
            className="card-base card-hover p-3 group flex items-center gap-3"
          >
            <div className="text-2xl shrink-0">{s.meta.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-sm">
                  {s.meta.label}
                </span>
                {s.completedToday ? (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-green/15 text-accent-green inline-flex items-center gap-0.5">
                    <CheckIcon className="w-2.5 h-2.5" />
                    Hecho hoy
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.06] text-ink-faint">
                    Pendiente
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-ink-dim mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <FireIcon className="w-3 h-3 text-accent-yellow" />
                  Racha: <strong className="text-ink">{s.streak}</strong>
                </span>
                <span>·</span>
                <span>
                  Total: <strong className="text-ink">{s.total}</strong> días
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="card-base p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">
        {label}
      </div>
      <div className={`font-display text-xl font-bold mt-1 tabular-nums ${tone}`}>
        {value}
      </div>
    </div>
  );
}
