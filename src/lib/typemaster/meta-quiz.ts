import type { MetaThreat } from '@/lib/team-analysis/threats';
import type { PokemonType } from '@/types/pokemon';
import { ALL_TYPES, TYPE_CHART } from '@/lib/type-effectiveness';

export interface MetaQuizOption {
  label: string;
  correct: boolean;
  /** Optional sprite hint */
  speciesId?: number;
}

export interface MetaQuizQuestion {
  id: string;
  kind:
    | 'most-used'
    | 'usage-of'
    | 'type-of'
    | 'top-partner'
    | 'higher-usage'
    | 'odd-one-out'
    | 'type-weakness'
    | 'type-coverage'
    | 'rank-position';
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

// ─── Generadores existentes ─────────────────────────────────────────────

function genMostUsed(threats: MetaThreat[]): MetaQuizQuestion | null {
  const top = threats[0];
  if (!top) return null;
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
    hint: '±5% de margen — pega cuál cuadra mejor',
    options,
    pivotName: target.name,
    pivotSpeciesId: target.speciesId,
  };
}

function genTypeOf(threats: MetaThreat[]): MetaQuizQuestion | null {
  const target = pick(threats.slice(0, 12));
  if (!target || target.types.length === 0) return null;
  const correctTypes = target.types.join('/').toUpperCase();
  const otherTypes = ALL_TYPES.filter((t) => !target.types.includes(t));
  const variants = new Set<string>();
  variants.add(correctTypes);
  while (variants.size < 4) {
    if (target.types.length === 1) {
      const fake = pick(otherTypes);
      if (fake) variants.add(fake.toUpperCase());
    } else {
      const swap = pick(otherTypes);
      if (swap) {
        const kept = target.types[Math.random() < 0.5 ? 0 : 1];
        variants.add(`${kept}/${swap}`.toUpperCase());
      }
    }
  }
  const options = shuffle(
    Array.from(variants).map((v) => ({ label: v, correct: v === correctTypes }))
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

// ─── Nuevos generadores ──────────────────────────────────────────────────

function genHigherUsage(threats: MetaThreat[]): MetaQuizQuestion | null {
  const pool = threats.slice(0, 12);
  if (pool.length < 4) return null;
  let attempts = 0;
  let a: MetaThreat | undefined;
  let b: MetaThreat | undefined;
  while (attempts < 20) {
    const [x, y] = pickN(pool, 2);
    if (x && y && Math.abs(x.usagePct - y.usagePct) >= 3) {
      a = x;
      b = y;
      break;
    }
    attempts++;
  }
  if (!a || !b) return null;
  const winner = a.usagePct > b.usagePct ? a : b;
  const options = shuffle([
    { label: a.name, correct: a === winner, speciesId: a.speciesId },
    { label: b.name, correct: b === winner, speciesId: b.speciesId },
  ]);
  return {
    id: `higher-usage-${Date.now()}-${Math.random()}`,
    kind: 'higher-usage',
    prompt: `¿Cuál se usa más: ${a.name} o ${b.name}?`,
    hint: 'Diferencia mínima 3% según Pikalytics live',
    options,
  };
}

function genOddOneOut(threats: MetaThreat[]): MetaQuizQuestion | null {
  if (threats.length < 30) return null;
  const inMeta = pickN(threats.slice(0, 12), 3);
  const outsider = pick(threats.slice(25));
  if (inMeta.length < 3 || !outsider) return null;
  const options = shuffle([
    ...inMeta.map((t) => ({
      label: t.name,
      correct: false,
      speciesId: t.speciesId,
    })),
    { label: outsider.name, correct: true, speciesId: outsider.speciesId },
  ]);
  return {
    id: `odd-out-${Date.now()}-${Math.random()}`,
    kind: 'odd-one-out',
    prompt: '¿Cuál NO está en el top 12 del meta?',
    hint: 'Tres son meta, uno está fuera',
    options,
  };
}

function genTypeWeakness(threats: MetaThreat[]): MetaQuizQuestion | null {
  const target = pick(threats.slice(0, 12));
  if (!target || target.types.length === 0) return null;
  const supereffective: PokemonType[] = [];
  for (const atk of ALL_TYPES) {
    let mult = 1;
    for (const def of target.types) {
      const x = TYPE_CHART[atk][def];
      if (x !== undefined) mult *= x;
    }
    if (mult >= 2) supereffective.push(atk);
  }
  if (supereffective.length === 0) return null;
  const correct = pick(supereffective);
  if (!correct) return null;
  const neutral = ALL_TYPES.filter((t) => !supereffective.includes(t));
  const distractors = pickN(neutral, 3);
  const options = shuffle([
    { label: correct.toUpperCase(), correct: true },
    ...distractors.map((t) => ({ label: t.toUpperCase(), correct: false })),
  ]);
  return {
    id: `type-weak-${Date.now()}-${Math.random()}`,
    kind: 'type-weakness',
    prompt: `¿Qué tipo es supereficaz contra ${target.name}?`,
    hint: 'Pega ×2 o más',
    options,
    pivotName: target.name,
    pivotSpeciesId: target.speciesId,
  };
}

function genTypeCoverage(threats: MetaThreat[]): MetaQuizQuestion | null {
  const target = pick(threats.slice(0, 12));
  if (!target || target.types.length === 0) return null;
  const resisted: PokemonType[] = [];
  for (const atk of ALL_TYPES) {
    let mult = 1;
    for (const def of target.types) {
      const x = TYPE_CHART[atk][def];
      if (x !== undefined) mult *= x;
    }
    if (mult <= 0.5) resisted.push(atk);
  }
  if (resisted.length === 0) return null;
  const correct = pick(resisted);
  if (!correct) return null;
  const weakTypes = ALL_TYPES.filter((t) => !resisted.includes(t));
  const distractors = pickN(weakTypes, 3);
  const options = shuffle([
    { label: correct.toUpperCase(), correct: true },
    ...distractors.map((t) => ({ label: t.toUpperCase(), correct: false })),
  ]);
  return {
    id: `type-cov-${Date.now()}-${Math.random()}`,
    kind: 'type-coverage',
    prompt: `¿A qué tipo RESISTE ${target.name}?`,
    hint: 'Recibe ×½ o ×0',
    options,
    pivotName: target.name,
    pivotSpeciesId: target.speciesId,
  };
}

function genRankPosition(threats: MetaThreat[]): MetaQuizQuestion | null {
  const idx = Math.floor(Math.random() * Math.min(10, threats.length));
  const target = threats[idx];
  if (!target) return null;
  const correctBucket =
    idx < 3 ? 'Top 3' : idx < 5 ? 'Top 5' : idx < 8 ? 'Top 8' : 'Top 10';
  const allBuckets = ['Top 3', 'Top 5', 'Top 8', 'Top 10', 'Fuera del top 10'];
  const options = shuffle(
    allBuckets
      .filter((b) => b !== correctBucket)
      .slice(0, 3)
      .map((label) => ({ label, correct: false }))
      .concat({ label: correctBucket, correct: true })
  );
  return {
    id: `rank-${Date.now()}-${Math.random()}`,
    kind: 'rank-position',
    prompt: `¿En qué franja del ranking se encuentra ${target.name}?`,
    hint: 'Posición en el top live de Pikalytics',
    options,
    pivotName: target.name,
    pivotSpeciesId: target.speciesId,
  };
}

/**
 * Builds a quiz de N preguntas desde el meta live. Prioriza variedad: no
 * repite el mismo `kind` hasta haber usado todos los disponibles. Sube de
 * 6 a 8 preguntas por sesión para reto un poco más largo.
 */
export function generateMetaQuiz(
  threats: MetaThreat[],
  questionCount = 8
): MetaQuizQuestion[] {
  if (threats.length < 5) return [];
  const generators: Array<{
    kind: MetaQuizQuestion['kind'];
    fn: (t: MetaThreat[]) => MetaQuizQuestion | null;
  }> = [
    { kind: 'most-used', fn: genMostUsed },
    { kind: 'usage-of', fn: genUsageOf },
    { kind: 'type-of', fn: genTypeOf },
    { kind: 'higher-usage', fn: genHigherUsage },
    { kind: 'odd-one-out', fn: genOddOneOut },
    { kind: 'type-weakness', fn: genTypeWeakness },
    { kind: 'type-coverage', fn: genTypeCoverage },
    { kind: 'rank-position', fn: genRankPosition },
  ];

  const questions: MetaQuizQuestion[] = [];
  const usedKinds = new Set<string>();
  let safety = 0;
  while (questions.length < questionCount && safety < 60) {
    // Prefiere kinds aún no usados; si ya hemos cubierto todos, vuelve a abrir.
    const candidates =
      usedKinds.size >= generators.length
        ? generators
        : generators.filter((g) => !usedKinds.has(g.kind));
    const chosen = pick(candidates);
    if (!chosen) break;
    const q = chosen.fn(threats);
    if (q && !questions.some((x) => x.prompt === q.prompt)) {
      questions.push(q);
      usedKinds.add(chosen.kind);
    }
    safety++;
  }
  return questions;
}
