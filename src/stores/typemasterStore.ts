'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty } from '@/lib/typemaster/xp-system';
import type { PokemonType } from '@/types/pokemon';
import type { SessionSummary } from '@/lib/typemaster/achievements';
import { unlockedBadges } from '@/lib/typemaster/achievements';
import { levelFromXP } from '@/lib/typemaster/xp-system';

export interface QuizRunRecord {
  id: string;
  date: number;
  difficulty: Difficulty;
  daily: boolean;
  correct: number;
  total: number;
  bestCombo: number;
  xpGained: number;
  avgResponseMs: number;
}

export type BestsMap = Partial<
  Record<Difficulty, { bestScore: number; bestXP: number; bestCombo: number }>
>;

interface State {
  xp: number;
  totalQuizzes: number;
  totalCorrect: number;
  totalAnswered: number;
  bestComboAllTime: number;
  dailyStreak: number;
  lastPlayedISODate: string | null;
  visitedTypes: PokemonType[];
  earnedBadges: string[];
  history: QuizRunRecord[];
  typeWrong: Record<string, number>;
  typeRight: Record<string, number>;
  sound: boolean;
  haptics: boolean;
  // New: preferences and progression
  lastDifficulty: Difficulty;
  bestsByDifficulty: BestsMap;
  lastDailyChallengeISODate: string | null;
  dailyChallengeCount: number;

  // mutations
  recordAnswer: (correct: boolean, types: PokemonType[]) => void;
  finishSession: (
    summary: SessionSummary & {
      xpGained: number;
      bestCombo: number;
      avgResponseMs: number;
      daily?: boolean;
    }
  ) => { newBadges: string[]; leveledUp: boolean; newLevel: number };
  visitType: (t: PokemonType) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setLastDifficulty: (d: Difficulty) => void;
  resetAll: () => void;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + 'T00:00:00Z').getTime();
  const b = new Date(bISO + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86400000);
}

export function isDailyAvailable(lastISO: string | null): boolean {
  if (!lastISO) return true;
  return lastISO !== todayISO();
}

export function getTodayISO() {
  return todayISO();
}

export const useTypeMasterStore = create<State>()(
  persist(
    (set, get) => ({
      xp: 0,
      totalQuizzes: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      bestComboAllTime: 0,
      dailyStreak: 0,
      lastPlayedISODate: null,
      visitedTypes: [],
      earnedBadges: [],
      history: [],
      typeWrong: {},
      typeRight: {},
      sound: true,
      haptics: true,
      lastDifficulty: 'beginner',
      bestsByDifficulty: {},
      lastDailyChallengeISODate: null,
      dailyChallengeCount: 0,

      recordAnswer: (correct, types) =>
        set((s) => {
          const tr = { ...s.typeRight };
          const tw = { ...s.typeWrong };
          for (const t of types) {
            if (correct) tr[t] = (tr[t] ?? 0) + 1;
            else tw[t] = (tw[t] ?? 0) + 1;
          }
          return {
            totalAnswered: s.totalAnswered + 1,
            totalCorrect: s.totalCorrect + (correct ? 1 : 0),
            typeRight: tr,
            typeWrong: tw,
          };
        }),

      finishSession: (summary) => {
        const prev = get();
        const today = todayISO();
        let dailyStreak = prev.dailyStreak;
        if (!prev.lastPlayedISODate) {
          dailyStreak = 1;
        } else {
          const gap = daysBetween(prev.lastPlayedISODate, today);
          if (gap === 0) dailyStreak = prev.dailyStreak || 1;
          else if (gap === 1) dailyStreak = prev.dailyStreak + 1;
          else dailyStreak = 1;
        }
        const newXP = prev.xp + summary.xpGained;
        const oldLevel = levelFromXP(prev.xp);
        const newLevel = levelFromXP(newXP);
        const bestComboAllTime = Math.max(prev.bestComboAllTime, summary.bestCombo);

        // Update per-difficulty bests
        const existing = prev.bestsByDifficulty[summary.difficulty] ?? {
          bestScore: 0,
          bestXP: 0,
          bestCombo: 0,
        };
        const newBests: BestsMap = {
          ...prev.bestsByDifficulty,
          [summary.difficulty]: {
            bestScore: Math.max(existing.bestScore, summary.correct),
            bestXP: Math.max(existing.bestXP, summary.xpGained),
            bestCombo: Math.max(existing.bestCombo, summary.bestCombo),
          },
        };

        const dailyChallengeCount = summary.daily
          ? prev.dailyChallengeCount + 1
          : prev.dailyChallengeCount;
        const lastDailyChallengeISODate = summary.daily
          ? today
          : prev.lastDailyChallengeISODate;

        const newBadges = unlockedBadges({
          session: summary,
          totalQuizzesBefore: prev.totalQuizzes,
          earned: prev.earnedBadges,
          level: newLevel,
          bestComboAllTime,
          dailyStreak,
          dailyChallengeCount,
        });

        const record: QuizRunRecord = {
          id: `r_${Date.now()}`,
          date: Date.now(),
          difficulty: summary.difficulty,
          daily: !!summary.daily,
          correct: summary.correct,
          total: summary.totalQuestions,
          bestCombo: summary.bestCombo,
          xpGained: summary.xpGained,
          avgResponseMs: summary.avgResponseMs,
        };

        set({
          xp: newXP,
          totalQuizzes: prev.totalQuizzes + 1,
          bestComboAllTime,
          dailyStreak,
          lastPlayedISODate: today,
          earnedBadges: [...prev.earnedBadges, ...newBadges],
          history: [record, ...prev.history].slice(0, 50),
          bestsByDifficulty: newBests,
          dailyChallengeCount,
          lastDailyChallengeISODate,
          lastDifficulty: summary.difficulty,
        });

        return {
          newBadges,
          leveledUp: newLevel > oldLevel,
          newLevel,
        };
      },

      visitType: (t) =>
        set((s) => {
          if (s.visitedTypes.includes(t)) return s;
          const nv = [...s.visitedTypes, t];
          const earned = [...s.earnedBadges];
          if (nv.length >= 18 && !earned.includes('type_scholar')) {
            earned.push('type_scholar');
          }
          return { visitedTypes: nv, earnedBadges: earned };
        }),

      toggleSound: () => set((s) => ({ sound: !s.sound })),
      toggleHaptics: () => set((s) => ({ haptics: !s.haptics })),
      setLastDifficulty: (d) => set({ lastDifficulty: d }),

      resetAll: () =>
        set({
          xp: 0,
          totalQuizzes: 0,
          totalCorrect: 0,
          totalAnswered: 0,
          bestComboAllTime: 0,
          dailyStreak: 0,
          lastPlayedISODate: null,
          visitedTypes: [],
          earnedBadges: [],
          history: [],
          typeWrong: {},
          typeRight: {},
          bestsByDifficulty: {},
          lastDailyChallengeISODate: null,
          dailyChallengeCount: 0,
        }),
    }),
    { name: 'pokehub-typemaster' }
  )
);
