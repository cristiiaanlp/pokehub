import type { PokemonType, TypeEffectivenessRow } from '@/types/pokemon';

export const ALL_TYPES: PokemonType[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

// chart[attackType][defenseType] = multiplier
type Chart = Record<PokemonType, Partial<Record<PokemonType, number>>>;

export const TYPE_CHART: Chart = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    dark: 0,
    steel: 0.5,
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: {
    fighting: 0.5,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    fairy: 0.5,
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
};

export function effectivenessAgainst(
  defenderTypes: PokemonType[]
): TypeEffectivenessRow[] {
  return ALL_TYPES.map((attackType) => {
    let multiplier = 1;
    for (const def of defenderTypes) {
      const m = TYPE_CHART[attackType][def];
      if (m !== undefined) multiplier *= m;
    }
    return { type: attackType, multiplier };
  });
}

export function offensiveCoverage(attackerTypes: PokemonType[]) {
  return ALL_TYPES.map((defType) => {
    let best = 0;
    for (const atk of attackerTypes) {
      const m = TYPE_CHART[atk][defType] ?? 1;
      if (m > best) best = m;
    }
    return { type: defType, multiplier: best };
  });
}

export interface TeamWeakness {
  type: PokemonType;
  weakCount: number;
  resistCount: number;
  immuneCount: number;
}

export function teamDefensiveProfile(
  members: { types: PokemonType[] }[]
): TeamWeakness[] {
  return ALL_TYPES.map((atk) => {
    let weak = 0;
    let resist = 0;
    let immune = 0;
    for (const m of members) {
      const mult = effectivenessAgainst(m.types).find(
        (r) => r.type === atk
      )?.multiplier;
      if (mult === undefined) continue;
      if (mult === 0) immune++;
      else if (mult >= 2) weak++;
      else if (mult < 1) resist++;
    }
    return { type: atk, weakCount: weak, resistCount: resist, immuneCount: immune };
  });
}

export function teamOffensiveCoverage(members: { types: PokemonType[] }[]) {
  return ALL_TYPES.map((defType) => {
    let bestMult = 0;
    let attackerCount = 0;
    for (const m of members) {
      const best = Math.max(
        ...m.types.map((t) => TYPE_CHART[t][defType] ?? 1)
      );
      if (best > 1) attackerCount++;
      if (best > bestMult) bestMult = best;
    }
    return { type: defType, multiplier: bestMult, attackerCount };
  });
}
