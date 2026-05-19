import type { MetaThreat } from '@/lib/team-analysis/threats';
import type { PokemonType } from '@/types/pokemon';
import { ALL_TYPES } from '@/lib/type-effectiveness';

export interface MetaQuizOption {
  label: string;
  correct: boolean;
  /** Optional sprite hint */
  speciesId?: number;
}

export interface MetaQuizQuestion {
  id: string;
  kind: 'most-used' | 'usage-of' | 'type-of' | 'top-partner';
  prompt: string;
  hint?: string;
  options: MetaQuizOption[];
  pivotName?: string;
  pivotSpeciesId?: number;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number, exclude?: T): T[] {
  const pool = exclude ? arr.filter((x) => x !== exclude) : [...arr];
  return shuffle(pool).slice(0, n);
}

function genMostUsed(threats: MetaThreat[]): MetaQuizQuestion | null {
  const top = threats[0];
  if (!top) return null;
  // Distractors: 3 random from positions 5-15
  const distractors = pickN(threats.slice(5, 15), 3).map((t) => ({
    label: t.name,
    correct: false,
    speciesId: t.speciesId,
  }));
  const options = shuffle([
    { label: top.name, correct: true, speciesId: top.speciesId },
    ...distractors,
  ]);
  return {
    id: `most-used-${Date.now()}-${Math.random()}`,
    kind: 'most-used',
    prompt: '¿Qué Pokémon tiene el mayor % de uso ahora mismo?',
    hint: 'Top 1 de la lista live',
    options,
  };
}

function genUsageOf(threats: MetaThreat[]): MetaQuizQuestion | null {
  const target = pick(threats.slice(0, 6));
  if (!target) return null;
  const correct = target.usagePct.toFixed(1);
  // Distractors: ±5%, ±10%, opposite
  const variants = [
    target.usagePct + (5 + Math.random() * 5),
    target.usagePct - (5 + Math.random() * 5),
    target.usagePct + (10 + Math.random() * 10),
  ].map((v) => Math.max(0.1, Math.min(99, v)).toFixed(1));
  const options = shuffle([
    { label: `${correct}%`, correct: true },
    ...variants.map((v) => ({ label: `${v}%`, correct: false })),
  ]);
  return {
    id: `usage-of-${Date.now()}-${Math.random()}`,
    kind: 'usage-of',
    prompt: `¿Cuál es el % de uso aproximado de ${target.name}?`,
    options,
    pivotName: target.name,
    pivotSpeciesId: target.speciesId,
  };
}

function genTypeOf(threats: MetaThreat[]): MetaQuizQuestion | null {
  const target = pick(threats.slice(0, 12));
  if (!target || target.types.length === 0) return null;
  const correctTypes = target.types.join('/').toUpperCase();
  // Build 3 distractor type combos
  const otherTypes = ALL_TYPES.filter((t) => !target.types.includes(t));
  const variants = new Set<string>();
  variants.add(correctTypes);
  while (variants.size < 4) {
    if (target.types.length === 1) {
      const fake = pick(otherTypes);
      if (fake) variants.add(fake.toUpperCase());
    } else {
      // dual type: swap one
      const swap = pick(otherTypes);
      if (swap) {
        const kept = target.types[Math.random() < 0.5 ? 0 : 1];
        variants.add(`${kept}/${swap}`.toUpperCase());
      }
    }
  }
  const options = shuffle(
    Array.from(variants).map((v) => ({
      label: v,
      correct: v === correctTypes,
    }))
  );
  return {
    id: `type-of-${Date.now()}-${Math.random()}`,
    kind: 'type-of',
    prompt: `¿De qué tipo es ${target.name}?`,
    options,
    pivotName: target.name,
    pivotSpeciesId: target.speciesId,
  };
}

/**
 * Builds a quiz of ~6 questions from the live meta. Uses different kinds for variety.
 * Returns null only if the input is too small to make any question.
 */
export function generateMetaQuiz(
  threats: MetaThreat[],
  questionCount = 6
): MetaQuizQuestion[] {
  if (threats.length < 5) return [];
  const generators = [genMostUsed, genUsageOf, genTypeOf];
  const questions: MetaQuizQuestion[] = [];
  let safety = 0;
  while (questions.length < questionCount && safety < 30) {
    const gen = pick(generators);
    if (!gen) break;
    const q = gen(threats);
    if (q && !questions.some((x) => x.prompt === q.prompt)) {
      questions.push(q);
    }
    safety++;
  }
  return questions;
}
