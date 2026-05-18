// XP curve: cumulative XP needed to reach level N = 50 * N * (N+1)
// Level 1 -> 2: 100,  2 -> 3: 200 more (total 300),  3 -> 4: 300 more (total 600), etc.

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * level * (level + 1);
}

export function levelFromXP(xp: number): number {
  // invert: find largest L with xpForLevel(L) <= xp
  // closed form: L = floor((-1 + sqrt(1 + xp/12.5)) / 2)... messy. iterate is fine.
  let lvl = 1;
  while (xpForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
}

export function xpProgress(xp: number): {
  level: number;
  current: number;
  needed: number;
  pct: number;
} {
  const level = levelFromXP(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const current = xp - base;
  const needed = next - base;
  return { level, current, needed, pct: needed > 0 ? (current / needed) * 100 : 0 };
}

export interface Rank {
  min: number;
  name: string;
  color: string;
  gradient: string;
}

export const RANKS: Rank[] = [
  { min: 1, name: 'Type Rookie', color: '#94A3B8', gradient: 'from-slate-400 to-slate-500' },
  { min: 4, name: 'Type Apprentice', color: '#10B981', gradient: 'from-emerald-400 to-emerald-500' },
  { min: 8, name: 'Battle Trainer', color: '#3B82F6', gradient: 'from-blue-400 to-blue-500' },
  { min: 13, name: 'Elite Trainer', color: '#8B5CF6', gradient: 'from-violet-400 to-violet-500' },
  { min: 19, name: 'Type Champion', color: '#F59E0B', gradient: 'from-amber-400 to-orange-500' },
  { min: 26, name: 'Type Master', color: '#EF4444', gradient: 'from-rose-400 via-fuchsia-500 to-violet-500' },
];

export function rankFromLevel(level: number): Rank {
  let current: Rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.min) current = r;
  }
  return current;
}

export type Difficulty = 'beginner' | 'advanced' | 'pro';

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string;
    xpBase: number;
    timerSec: number | null;
    duals: boolean;
    immunities: boolean;
    speedBonusMax: number;
    color: string;
    description: string;
  }
> = {
  beginner: {
    label: 'Beginner',
    xpBase: 10,
    timerSec: null,
    duals: false,
    immunities: false,
    speedBonusMax: 0,
    color: '#10B981',
    description: 'Tipos simples, sin timer. Aprende sin presión.',
  },
  advanced: {
    label: 'Advanced',
    xpBase: 15,
    timerSec: 8,
    duals: true,
    immunities: true,
    speedBonusMax: 8,
    color: '#3B82F6',
    description: 'Dual types, inmunidades y un poco de prisa.',
  },
  pro: {
    label: 'Pro Mode',
    xpBase: 25,
    timerSec: 4,
    duals: true,
    immunities: true,
    speedBonusMax: 15,
    color: '#EF4444',
    description: 'Velocidad extrema. Cada segundo cuenta.',
  },
};

// Combo multiplier 1× → 2×, ramping up over 20 hits
export function comboMultiplier(combo: number): number {
  const ratio = Math.min(combo, 20) / 20;
  return 1 + ratio;
}

export interface AwardXPInput {
  correct: boolean;
  difficulty: Difficulty;
  combo: number; // combo BEFORE this answer
  secondsLeft?: number; // for timed modes
}

export interface AwardXPResult {
  xp: number;
  speedBonus: number;
  multiplier: number;
}

export function calculateXP(input: AwardXPInput): AwardXPResult {
  if (!input.correct) return { xp: 0, speedBonus: 0, multiplier: 1 };
  const cfg = DIFFICULTY_CONFIG[input.difficulty];
  const multiplier = comboMultiplier(input.combo + 1);
  let speedBonus = 0;
  if (cfg.timerSec && input.secondsLeft !== undefined && cfg.speedBonusMax > 0) {
    const ratio = Math.max(0, input.secondsLeft) / cfg.timerSec;
    speedBonus = Math.round(cfg.speedBonusMax * ratio);
  }
  const xp = Math.round(cfg.xpBase * multiplier + speedBonus);
  return { xp, speedBonus, multiplier };
}
