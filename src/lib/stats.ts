// Fórmulas oficiales de stats Pokémon (Gen 3-9).
// Fuente: https://bulbapedia.bulbagarden.net/wiki/Stat#Generation_III_onward
//
// HP = floor( ((2*Base + IV + floor(EV/4)) * Level) / 100 ) + Level + 10
// Otros = (floor( ((2*Base + IV + floor(EV/4)) * Level) / 100 ) + 5) * NatureMult
//
// Shedinja es excepción (HP siempre 1). No lo manejamos.

export type StatKey = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';

export const STAT_KEYS: StatKey[] = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];

export const STAT_LABELS: Record<StatKey, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  specialAttack: 'At. Especial',
  specialDefense: 'Def. Especial',
  speed: 'Velocidad',
};

export const STAT_LABELS_SHORT: Record<StatKey, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  specialAttack: 'SpA',
  specialDefense: 'SpD',
  speed: 'Spe',
};

// Naturalezas: cada una sube 10% una stat y baja 10% otra.
// Las "neutras" (Hardy, Docile, Serious, Bashful, Quirky) no cambian nada.
export interface Nature {
  name: string;
  up: StatKey | null;
  down: StatKey | null;
}

export const NATURES: Nature[] = [
  { name: 'Hardy', up: null, down: null },
  { name: 'Lonely', up: 'attack', down: 'defense' },
  { name: 'Brave', up: 'attack', down: 'speed' },
  { name: 'Adamant', up: 'attack', down: 'specialAttack' },
  { name: 'Naughty', up: 'attack', down: 'specialDefense' },
  { name: 'Bold', up: 'defense', down: 'attack' },
  { name: 'Docile', up: null, down: null },
  { name: 'Relaxed', up: 'defense', down: 'speed' },
  { name: 'Impish', up: 'defense', down: 'specialAttack' },
  { name: 'Lax', up: 'defense', down: 'specialDefense' },
  { name: 'Timid', up: 'speed', down: 'attack' },
  { name: 'Hasty', up: 'speed', down: 'defense' },
  { name: 'Serious', up: null, down: null },
  { name: 'Jolly', up: 'speed', down: 'specialAttack' },
  { name: 'Naive', up: 'speed', down: 'specialDefense' },
  { name: 'Modest', up: 'specialAttack', down: 'attack' },
  { name: 'Mild', up: 'specialAttack', down: 'defense' },
  { name: 'Quiet', up: 'specialAttack', down: 'speed' },
  { name: 'Bashful', up: null, down: null },
  { name: 'Rash', up: 'specialAttack', down: 'specialDefense' },
  { name: 'Calm', up: 'specialDefense', down: 'attack' },
  { name: 'Gentle', up: 'specialDefense', down: 'defense' },
  { name: 'Sassy', up: 'specialDefense', down: 'speed' },
  { name: 'Careful', up: 'specialDefense', down: 'specialAttack' },
  { name: 'Quirky', up: null, down: null },
];

export function natureMultiplier(nature: Nature, stat: StatKey): number {
  if (stat === 'hp') return 1; // PS nunca se ve afectado
  if (nature.up === stat) return 1.1;
  if (nature.down === stat) return 0.9;
  return 1;
}

/**
 * Calcula la stat final usando la fórmula oficial.
 *
 * @param base       Base stat del Pokémon
 * @param iv         IV [0-31]
 * @param ev         EV [0-252]
 * @param level      [1-100]
 * @param nature     Para Ataque-Velocidad. Ignorado para HP.
 * @param stat       Nombre de la stat (afecta nature)
 */
export function calcStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  nature: Nature,
  stat: StatKey
): number {
  const ivClamped = Math.min(31, Math.max(0, iv));
  const evClamped = Math.min(252, Math.max(0, ev));
  const lvl = Math.min(100, Math.max(1, level));

  const common =
    Math.floor(((2 * base + ivClamped + Math.floor(evClamped / 4)) * lvl) / 100);

  if (stat === 'hp') {
    // Shedinja excepción no implementada
    if (base === 1) return 1;
    return common + lvl + 10;
  }

  const withNature = Math.floor((common + 5) * natureMultiplier(nature, stat));
  return withNature;
}

/**
 * Calcula los 6 stats finales dado el objeto completo de inputs.
 */
export function calcAllStats(input: {
  base: Record<StatKey, number>;
  ivs: Record<StatKey, number>;
  evs: Record<StatKey, number>;
  level: number;
  nature: Nature;
}): Record<StatKey, number> {
  const result = {} as Record<StatKey, number>;
  for (const key of STAT_KEYS) {
    result[key] = calcStat(
      input.base[key],
      input.ivs[key],
      input.evs[key],
      input.level,
      input.nature,
      key
    );
  }
  return result;
}

/**
 * Dada una stat objetivo a alcanzar, busca el EV mínimo necesario.
 * Devuelve -1 si es inalcanzable incluso con EVs maxeados.
 *
 * Útil para "quiero outspeedear a Garchomp scarf en VGC, ¿cuántos EVs en Spe necesito?"
 */
export function evNeededForTarget(
  base: number,
  iv: number,
  level: number,
  nature: Nature,
  stat: StatKey,
  target: number
): number {
  for (let ev = 0; ev <= 252; ev += 4) {
    const result = calcStat(base, iv, ev, level, nature, stat);
    if (result >= target) return ev;
  }
  return -1;
}

/**
 * Suma de EVs (max 510 total, max 252 por stat).
 */
export function totalEVs(evs: Record<StatKey, number>): number {
  return STAT_KEYS.reduce((sum, k) => sum + (evs[k] ?? 0), 0);
}

export const MAX_TOTAL_EVS = 510;
export const MAX_EV_PER_STAT = 252;
