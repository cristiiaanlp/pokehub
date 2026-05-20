'use client';

import { useEffect, useState } from 'react';
import { FireIcon, TrophyIcon } from '@/components/ui/Icon';

const HISTORY_KEY = 'pokehub-meta-daily-history';
// Almacena array de fechas ISO (YYYY-MM-DD) en las que el user completó el quiz

function todayISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate()
  ).padStart(2, '0')}`;
}

function loadHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    return Array.isArray(raw) ? (raw as string[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(dates: string[]) {
  if (typeof window === 'undefined') return;
  try {
    // Mantén máximo 365 días para evitar growth
    localStorage.setItem(HISTORY_KEY, JSON.stringify(dates.slice(-365)));
  } catch {
    /* ignore */
  }
}

function computeStreak(dates: string[]): { current: number; best: number } {
  if (dates.length === 0) return { current: 0, best: 0 };
  // Asegúrate que estén únicas + ordenadas
  const sorted = Array.from(new Set(dates)).sort();

  // Calcula mejor racha
  let bestStreak = 1;
  let currStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diff = (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currStreak++;
      bestStreak = Math.max(bestStreak, currStreak);
    } else {
      currStreak = 1;
    }
  }

  // Racha actual: cuenta hacia atrás desde hoy
  const today = todayISO();
  const lastDate = sorted[sorted.length - 1];
  const dayDiff =
    (new Date(today).getTime() - new Date(lastDate).getTime()) /
    (1000 * 60 * 60 * 24);
  let current = 0;
  if (dayDiff <= 1) {
    // El último día completado fue hoy o ayer → racha viva
    current = 1;
    for (let i = sorted.length - 2; i >= 0; i--) {
      const a = new Date(sorted[i + 1]);
      const b = new Date(sorted[i]);
      if ((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  return { current, best: Math.max(bestStreak, current) };
}

/**
 * Llama cuando el user completa el daily quiz para registrar la fecha.
 */
export function recordDailyCompletion() {
  const history = loadHistory();
  const today = todayISO();
  if (!history.includes(today)) {
    history.push(today);
    saveHistory(history);
  }
}

export function DailyStreak() {
  const [streak, setStreak] = useState<{ current: number; best: number }>({
    current: 0,
    best: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStreak(computeStreak(loadHistory()));
  }, []);

  if (!mounted || (streak.current === 0 && streak.best === 0)) return null;

  return (
    <div className="card-base p-3 flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1.5 text-accent-red">
        <FireIcon className="w-4 h-4" />
        <span className="font-display font-bold tabular-nums">
          {streak.current}
        </span>
        <span className="text-xs text-ink-dim">días seguidos</span>
      </div>
      <span className="text-ink-faint">·</span>
      <div className="flex items-center gap-1.5 text-accent-yellow">
        <TrophyIcon className="w-4 h-4" />
        <span className="font-display font-bold tabular-nums">
          {streak.best}
        </span>
        <span className="text-xs text-ink-dim">mejor racha</span>
      </div>
    </div>
  );
}
