import { ALL_TYPES, TYPE_CHART, effectivenessAgainst } from '@/lib/type-effectiveness';
import type { PokemonType } from '@/types/pokemon';

// Curated specific counters per species ID
export const SPECIFIC_COUNTERS: Record<number, number[]> = {
  984: [887, 858, 1017], // Great Tusk -> Dragapult, Hatterene, Ogerpon-Wellspring
  983: [445, 472, 984, 999], // Kingambit -> Garchomp, Gliscor, Great Tusk, Iron Hands
  1000: [983, 887, 1006], // Gholdengo -> Kingambit, Dragapult, Iron Valiant
  149: [471, 887, 983], // Dragonite -> Glaceon, Dragapult, Kingambit
  445: [471, 144, 1017, 460], // Garchomp -> Glaceon, Articuno, Ogerpon-Wellspring, Abomasnow
  1006: [983, 887, 727], // Iron Valiant -> Kingambit, Dragapult, Incineroar
  1021: [983, 472, 887], // Raging Bolt -> Kingambit, Gliscor, Dragapult
  887: [983, 211, 727], // Dragapult -> Kingambit, Qwilfish, Incineroar
  889: [9, 472, 1017], // Zamazenta -> Blastoise, Gliscor, Ogerpon-Wellspring
  // Champions specifics
  727: [392, 65, 6], // Incineroar -> Infernape, Alakazam, Charizard
  903: [727, 472, 6], // Sneasler -> Incineroar, Gliscor, Charizard
  900: [727, 6, 9], // Kleavor -> Incineroar, Charizard, Blastoise
  478: [727, 6, 248], // Froslass -> Incineroar, Charizard, Tyranitar
};

// Compute "checks" purely from type analysis.
// Given attacker types, returns defender types that:
// - resist or are immune to ALL attacker STABs, AND
// - hit back at least one attacker STAB super-effectively
export interface TypeCheck {
  type: PokemonType;
  defendsBest: number; // best resistance multiplier (lower = better, 0 is immune)
  hitsBack: PokemonType | null; // attacker type they hit super-effectively
}

export function typeChecks(attackerTypes: PokemonType[]): TypeCheck[] {
  return ALL_TYPES.map((defType) => {
    // Compute worst incoming multiplier for the defender (single type) against attacker's STABs
    let worstAgainst = 0;
    for (const atk of attackerTypes) {
      const m = TYPE_CHART[atk][defType] ?? 1;
      worstAgainst = Math.max(worstAgainst, m);
    }
    // Defender must take ≤ 1× from BOTH STABs (so worst ≤ 1)
    if (worstAgainst > 1) {
      return null;
    }
    // Defender's offensive hit-back: super-effective against any attacker type
    let hitsBack: PokemonType | null = null;
    for (const atk of attackerTypes) {
      const m = TYPE_CHART[defType][atk] ?? 1;
      if (m >= 2) {
        hitsBack = atk;
        break;
      }
    }
    return {
      type: defType,
      defendsBest: worstAgainst,
      hitsBack,
    } as TypeCheck;
  }).filter(Boolean) as TypeCheck[];
}

export function getSpecificCounters(speciesId: number): number[] {
  return SPECIFIC_COUNTERS[speciesId] ?? [];
}

// Reverse lookup: types this Pokémon is weak to (≥ 2× incoming).
export function weakTypes(defenderTypes: PokemonType[]): PokemonType[] {
  return effectivenessAgainst(defenderTypes)
    .filter((r) => r.multiplier >= 2)
    .map((r) => r.type);
}
