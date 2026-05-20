// Coverage Analyzer.
//
// Para cada uno de los 18 tipos defensivos posibles (mono o duo), calcula
// el MEJOR multiplicador que TU equipo puede infligir usando sus STABs.
//
// El objetivo es detectar AGUJEROS: tipos contra los que ninguno de tus
// Pokémon puede pegar super-efectivo. Esos tipos son los que la composición
// rival debería llevar para abusar de tu equipo.

import { TYPE_CHART, ALL_TYPES } from '@/lib/type-effectiveness';
import type { PokemonType } from '@/types/pokemon';
import type { TeamMemberLite } from './threats';

export interface CoverageHole {
  /** Tipo objetivo (mono o duo) */
  types: PokemonType[];
  /** Mejor multiplicador que tu equipo puede infligir con sus STABs */
  bestMultiplier: number;
  /** El Pokémon que consigue ese mejor matchup */
  bestAttacker?: { pokemonId: number; name: string; type: PokemonType };
}

function multiplier(atk: PokemonType, def: PokemonType[]): number {
  let m = 1;
  for (const d of def) {
    const x = TYPE_CHART[atk][d];
    if (x !== undefined) m *= x;
  }
  return m;
}

/**
 * Devuelve los matchups donde el mejor multiplicador < 2 (sin super-effective).
 * Ordenados por peor primero (los que más nos preocupan).
 */
export function analyzeCoverage(team: TeamMemberLite[]): CoverageHole[] {
  if (team.length === 0) return [];

  // Combinaciones: 18 mono-tipos + duo-tipos comunes del meta SV
  // (no hacemos todas 18×18 — son 153, demasiado ruido).
  const candidates: PokemonType[][] = ALL_TYPES.map((t) => [t]);
  // Duo-tipos comunes (top usage Reg G / OU)
  const META_DUOS: PokemonType[][] = [
    ['steel', 'flying'],   // Corviknight, Skarmory
    ['steel', 'fairy'],    // Magearna, Tinkaton
    ['water', 'ground'],   // Quagsire, Clodsire, Garchomp
    ['ground', 'fire'],    // Camerupt
    ['ghost', 'dark'],     // Mimikyu, Sableye
    ['fairy', 'steel'],    // ditto
    ['dragon', 'fairy'],   // wishful Tera
    ['fire', 'water'],     // Volcanion
    ['dragon', 'ground'],  // Garchomp
    ['psychic', 'fairy'],  // Gardevoir, Indeedee
    ['steel', 'psychic'],  // Solgaleo
    ['dark', 'steel'],     // Kingambit
    ['grass', 'steel'],    // Kartana, Ferrothorn
    ['fighting', 'fire'],  // Iron Hands hypothetical
    ['water', 'fairy'],    // Azumarill
    ['fire', 'flying'],    // Charizard, Ho-Oh
    ['water', 'electric'], // Rotom-Wash form
  ];

  const holes: CoverageHole[] = [];

  const allCandidates = [...candidates, ...META_DUOS];

  for (const target of allCandidates) {
    let best = 0;
    let bestAtk: CoverageHole['bestAttacker'] = undefined;
    for (const member of team) {
      for (const t of member.types) {
        const m = multiplier(t, target);
        if (m > best) {
          best = m;
          bestAtk = { pokemonId: member.pokemonId, name: member.name, type: t };
        }
      }
    }
    if (best < 2) {
      holes.push({ types: target, bestMultiplier: best, bestAttacker: bestAtk });
    }
  }

  return holes.sort((a, b) => a.bestMultiplier - b.bestMultiplier);
}
