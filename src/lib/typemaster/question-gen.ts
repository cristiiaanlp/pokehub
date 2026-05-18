import {
  ALL_TYPES,
  TYPE_CHART,
  effectivenessAgainst,
} from '@/lib/type-effectiveness';
import type { PokemonType } from '@/types/pokemon';
import type { Difficulty } from './xp-system';

export type QuestionKind =
  | 'super-effective-against' // pick attacker type super-effective vs defender(s)
  | 'resists' // pick defender type that resists attacker
  | 'immune-to' // pick type immune to attacker
  | 'multiplier-exact'; // given attacker -> defender(s), pick multiplier

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  hint?: string;
  // For type-based answers
  options: Array<
    | { kind: 'type'; type: PokemonType; correct: boolean }
    | { kind: 'multiplier'; value: number; correct: boolean }
  >;
  // Echo the question parameters for visual rendering
  display: {
    defenderTypes?: PokemonType[];
    attackerType?: PokemonType;
  };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randomTypes(count: 1 | 2): PokemonType[] {
  const a = pick(ALL_TYPES);
  if (count === 1) return [a];
  let b = pick(ALL_TYPES);
  while (b === a) b = pick(ALL_TYPES);
  return [a, b];
}

// Build a "super-effective against" question
function genSuperEffective(difficulty: Difficulty): QuizQuestion {
  const dualAllowed = difficulty !== 'beginner';
  let defenderTypes: PokemonType[] = [];
  let candidates: PokemonType[] = [];

  // Find a defender combo that has at least one super-effective attacker
  for (let tries = 0; tries < 30; tries++) {
    const count: 1 | 2 = dualAllowed && Math.random() < 0.6 ? 2 : 1;
    defenderTypes = randomTypes(count);
    candidates = effectivenessAgainst(defenderTypes)
      .filter((r) => r.multiplier >= 2)
      .map((r) => r.type);
    if (candidates.length > 0) break;
  }

  const correct = pick(candidates);
  // distractors: types that are NOT super-effective (multiplier < 2)
  const distractorPool = effectivenessAgainst(defenderTypes)
    .filter((r) => r.multiplier < 2)
    .map((r) => r.type);
  const distractors = shuffle(distractorPool).slice(0, 3);

  const options = shuffle([
    { kind: 'type' as const, type: correct, correct: true },
    ...distractors.map((t) => ({ kind: 'type' as const, type: t, correct: false })),
  ]);

  return {
    id: `se_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'super-effective-against',
    prompt:
      defenderTypes.length === 1
        ? `¿Qué tipo es super-eficaz contra ${defenderTypes[0].toUpperCase()}?`
        : `¿Qué tipo es super-eficaz contra ${defenderTypes
            .map((t) => t.toUpperCase())
            .join('/')}?`,
    hint: 'Daño ≥ 2×',
    options,
    display: { defenderTypes },
  };
}

function genResists(difficulty: Difficulty): QuizQuestion {
  const dualAllowed = difficulty !== 'beginner';
  let attackerType: PokemonType = 'normal';
  let candidates: PokemonType[] = [];

  for (let tries = 0; tries < 30; tries++) {
    attackerType = pick(ALL_TYPES);
    candidates = ALL_TYPES.filter(
      (def) => (TYPE_CHART[attackerType][def] ?? 1) < 1 && (TYPE_CHART[attackerType][def] ?? 1) > 0
    );
    if (candidates.length > 0) break;
  }

  const correct = pick(candidates);
  const distractorPool = ALL_TYPES.filter(
    (def) => (TYPE_CHART[attackerType][def] ?? 1) >= 1
  );
  // For dual-aware mode we could combine types but to keep options visually clean we use single types
  const distractors = shuffle(distractorPool).slice(0, 3);

  const options = shuffle([
    { kind: 'type' as const, type: correct, correct: true },
    ...distractors.map((t) => ({ kind: 'type' as const, type: t, correct: false })),
  ]);

  return {
    id: `res_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'resists',
    prompt: `¿Qué tipo RESISTE ataques de tipo ${attackerType.toUpperCase()}?`,
    hint: 'Daño < 1×',
    options,
    display: { attackerType },
  };
}

function genImmuneTo(): QuizQuestion {
  let attackerType: PokemonType = 'normal';
  let candidates: PokemonType[] = [];

  for (let tries = 0; tries < 30; tries++) {
    attackerType = pick(ALL_TYPES);
    candidates = ALL_TYPES.filter(
      (def) => (TYPE_CHART[attackerType][def] ?? 1) === 0
    );
    if (candidates.length > 0) break;
  }

  const correct = pick(candidates);
  const distractorPool = ALL_TYPES.filter(
    (def) => (TYPE_CHART[attackerType][def] ?? 1) !== 0
  );
  const distractors = shuffle(distractorPool).slice(0, 3);

  const options = shuffle([
    { kind: 'type' as const, type: correct, correct: true },
    ...distractors.map((t) => ({ kind: 'type' as const, type: t, correct: false })),
  ]);

  return {
    id: `imm_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'immune-to',
    prompt: `¿Qué tipo es INMUNE a ${attackerType.toUpperCase()}?`,
    hint: '0× de daño',
    options,
    display: { attackerType },
  };
}

function genMultiplier(difficulty: Difficulty): QuizQuestion {
  const dualAllowed = difficulty !== 'beginner';
  const defenderTypes = randomTypes(dualAllowed && Math.random() < 0.5 ? 2 : 1);
  const attackerType: PokemonType = pick(ALL_TYPES);
  const multiplier = effectivenessAgainst(defenderTypes).find(
    (r) => r.type === attackerType
  )!.multiplier;

  const pool = [0, 0.25, 0.5, 1, 2, 4];
  const wrongPool = pool.filter((v) => v !== multiplier);
  const distractors = shuffle(wrongPool).slice(0, 3);

  const options = shuffle([
    { kind: 'multiplier' as const, value: multiplier, correct: true },
    ...distractors.map((v) => ({ kind: 'multiplier' as const, value: v, correct: false })),
  ]);

  return {
    id: `mul_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'multiplier-exact',
    prompt: `${attackerType.toUpperCase()} → ${defenderTypes
      .map((t) => t.toUpperCase())
      .join('/')}. ¿Qué multiplicador?`,
    hint: 'Daño total',
    options,
    display: { defenderTypes, attackerType },
  };
}

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  // Weighted random across kinds, adapted per difficulty
  const weights: Array<[QuestionKind, number]> =
    difficulty === 'beginner'
      ? [
          ['super-effective-against', 0.55],
          ['resists', 0.35],
          ['multiplier-exact', 0.1],
        ]
      : difficulty === 'advanced'
      ? [
          ['super-effective-against', 0.4],
          ['resists', 0.3],
          ['immune-to', 0.15],
          ['multiplier-exact', 0.15],
        ]
      : [
          ['super-effective-against', 0.35],
          ['resists', 0.25],
          ['immune-to', 0.15],
          ['multiplier-exact', 0.25],
        ];

  const r = Math.random();
  let cum = 0;
  let kind: QuestionKind = 'super-effective-against';
  for (const [k, w] of weights) {
    cum += w;
    if (r <= cum) {
      kind = k;
      break;
    }
  }

  switch (kind) {
    case 'super-effective-against':
      return genSuperEffective(difficulty);
    case 'resists':
      return genResists(difficulty);
    case 'immune-to':
      return genImmuneTo();
    case 'multiplier-exact':
      return genMultiplier(difficulty);
  }
}

export function formatMultiplier(v: number): string {
  if (v === 0) return 'Inmune (0×)';
  if (v === 0.25) return '¼ × (0,25)';
  if (v === 0.5) return '½ × (0,5)';
  if (v === 1) return 'Neutro (1×)';
  if (v === 2) return 'Super eficaz (2×)';
  if (v === 4) return '4× ¡crítico!';
  return `${v}×`;
}
