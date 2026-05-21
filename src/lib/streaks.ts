// Helpers para consolidar rachas de los daily challenges.
// Cada daily usa localStorage con un key distinto — aquí los unificamos.

export interface DailyMeta {
  key: string;             // localStorage history key
  label: string;
  href: string;
  emoji: string;
}

export const DAILIES: DailyMeta[] = [
  {
    key: 'pokehub-trivia-daily-history',
    label: 'Trivia competitiva',
    href: '/daily/trivia',
    emoji: '🧠',
  },
  {
    key: 'pokehub-whos-that-history',
    label: '¿Quién es ese Pokémon?',
    href: '/daily/whos-that',
    emoji: '👤',
  },
  {
    key: 'pokehub-wordle-history',
    label: 'PokéWordle',
    href: '/daily/wordle',
    emoji: '🔤',
  },
  {
    key: 'pokehub-meta-daily-history',
    label: 'Meta Daily Quiz',
    href: '/typemaster/meta-daily',
    emoji: '🏆',
  },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function loadHistory(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/** Racha consecutiva hacia atrás desde hoy */
export function computeStreak(history: string[]): number {
  const set = new Set(history);
  let streak = 0;
  const d = new Date();
  while (true) {
    const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    if (!set.has(iso)) break;
    streak++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return streak;
}

/** Total de días únicos completados */
export function totalDays(history: string[]): number {
  return new Set(history).size;
}

export function completedToday(history: string[]): boolean {
  return history.includes(todayISO());
}

export interface DailyStreakSummary {
  meta: DailyMeta;
  streak: number;
  total: number;
  completedToday: boolean;
}

export function getAllStreaks(): DailyStreakSummary[] {
  return DAILIES.map((meta) => {
    const history = loadHistory(meta.key);
    return {
      meta,
      streak: computeStreak(history),
      total: totalDays(history),
      completedToday: completedToday(history),
    };
  });
}
