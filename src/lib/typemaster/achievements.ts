import type { Difficulty } from './xp-system';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Record<string, Badge> = {
  first_quiz: {
    id: 'first_quiz',
    name: 'Primer paso',
    description: 'Completa tu primer quiz.',
    emoji: '🎮',
    rarity: 'common',
  },
  streak_10: {
    id: 'streak_10',
    name: 'Combo x10',
    description: 'Encadena 10 respuestas correctas seguidas.',
    emoji: '🔥',
    rarity: 'common',
  },
  streak_25: {
    id: 'streak_25',
    name: 'Combo x25',
    description: 'Encadena 25 respuestas correctas. Increíble.',
    emoji: '⚡',
    rarity: 'rare',
  },
  streak_50: {
    id: 'streak_50',
    name: 'Imparable',
    description: '50 aciertos seguidos. ¿Cómo lo haces?',
    emoji: '💫',
    rarity: 'epic',
  },
  perfect_run: {
    id: 'perfect_run',
    name: 'Sin errores',
    description: '10/10 en una sesión.',
    emoji: '💎',
    rarity: 'rare',
  },
  perfect_pro: {
    id: 'perfect_pro',
    name: 'Pro Perfecto',
    description: '10/10 en Pro Mode. Eres real.',
    emoji: '👑',
    rarity: 'legendary',
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: '5 aciertos en Pro Mode con menos de 2s cada uno.',
    emoji: '🚀',
    rarity: 'epic',
  },
  daily_3: {
    id: 'daily_3',
    name: 'Hábito',
    description: 'Juega 3 días seguidos.',
    emoji: '📅',
    rarity: 'common',
  },
  daily_7: {
    id: 'daily_7',
    name: 'Semana de fuego',
    description: 'Juega 7 días seguidos.',
    emoji: '🌟',
    rarity: 'rare',
  },
  daily_30: {
    id: 'daily_30',
    name: 'Mes de dedicación',
    description: '30 días seguidos. Leyenda.',
    emoji: '🏅',
    rarity: 'legendary',
  },
  level_10: {
    id: 'level_10',
    name: 'Veterano',
    description: 'Alcanza nivel 10.',
    emoji: '🛡️',
    rarity: 'rare',
  },
  level_20: {
    id: 'level_20',
    name: 'Élite',
    description: 'Alcanza nivel 20.',
    emoji: '👑',
    rarity: 'epic',
  },
  level_26: {
    id: 'level_26',
    name: 'Type Master',
    description: 'Alcanza el rango máximo.',
    emoji: '🌈',
    rarity: 'legendary',
  },
  pro_survivor: {
    id: 'pro_survivor',
    name: 'Pro Survivor',
    description: 'Acaba un quiz Pro Mode sin que el timer expire.',
    emoji: '🥷',
    rarity: 'epic',
  },
  daily_champ: {
    id: 'daily_champ',
    name: 'Reto diario',
    description: 'Completa tu primer Daily Challenge.',
    emoji: '🎯',
    rarity: 'rare',
  },
  daily_master_5: {
    id: 'daily_master_5',
    name: 'Constancia',
    description: 'Completa 5 Daily Challenges.',
    emoji: '🌠',
    rarity: 'epic',
  },
  type_scholar: {
    id: 'type_scholar',
    name: 'Estudioso',
    description: 'Visita los 18 tipos en modo Aprender.',
    emoji: '📚',
    rarity: 'common',
  },
};

export interface SessionSummary {
  difficulty: Difficulty;
  totalQuestions: number;
  correct: number;
  bestComboInSession: number;
  fastAnswersUnder2s: number;
  noTimerExpire: boolean;
  daily?: boolean;
}

export function unlockedBadges(opts: {
  session: SessionSummary;
  totalQuizzesBefore: number;
  earned: string[];
  level: number;
  bestComboAllTime: number;
  dailyStreak: number;
  dailyChallengeCount: number;
}): string[] {
  const out: string[] = [];
  const has = (id: string) => opts.earned.includes(id) || out.includes(id);
  const award = (id: string) => {
    if (!has(id)) out.push(id);
  };

  if (opts.totalQuizzesBefore === 0 && opts.session.totalQuestions > 0) {
    award('first_quiz');
  }
  if (opts.bestComboAllTime >= 10 || opts.session.bestComboInSession >= 10) {
    award('streak_10');
  }
  if (opts.bestComboAllTime >= 25 || opts.session.bestComboInSession >= 25) {
    award('streak_25');
  }
  if (opts.bestComboAllTime >= 50 || opts.session.bestComboInSession >= 50) {
    award('streak_50');
  }
  if (
    opts.session.totalQuestions >= 10 &&
    opts.session.correct === opts.session.totalQuestions
  ) {
    award('perfect_run');
    if (opts.session.difficulty === 'pro') {
      award('perfect_pro');
    }
  }
  if (
    opts.session.difficulty === 'pro' &&
    opts.session.fastAnswersUnder2s >= 5
  ) {
    award('speed_demon');
  }
  if (opts.dailyStreak >= 3) award('daily_3');
  if (opts.dailyStreak >= 7) award('daily_7');
  if (opts.dailyStreak >= 30) award('daily_30');
  if (opts.level >= 10) award('level_10');
  if (opts.level >= 20) award('level_20');
  if (opts.level >= 26) award('level_26');
  if (
    opts.session.difficulty === 'pro' &&
    opts.session.noTimerExpire &&
    opts.session.correct >= 5
  ) {
    award('pro_survivor');
  }
  if (opts.session.daily) {
    award('daily_champ');
    if (opts.dailyChallengeCount >= 5) award('daily_master_5');
  }

  return out;
}
