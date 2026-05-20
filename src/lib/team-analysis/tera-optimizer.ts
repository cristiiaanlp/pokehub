// Tera Type Optimizer.
//
// Para cada miembro del equipo, calcula qué tipo Tera elimina más debilidades
// y prioriza tapar las debilidades COMUNES del equipo (las que más miembros
// comparten).
//
// La gracia: cuando Tera-statellizas, tu tipo defensivo se REEMPLAZA por el
// del Tera (en Gen 9 SV). Tu STAB defensiva pasa a ser el Tera. Por eso un
// Tera type bien elegido puede convertir un Pokémon frágil en uno bestial.
//
// Algoritmo:
//   1. Calcular debilidades actuales del equipo (heatmap defensivo agregado).
//   2. Por cada miembro y cada Tera type candidato:
//        a. Recalcular sus weaknesses si fuera Tera-X (typing único = X).
//        b. Premiar:
//             + Resistencias e inmunidades nuevas a tipos donde el equipo es débil.
//             + No perder demasiadas resistencias actuales.
//             - Si la nueva typing añade weaknesses graves al equipo (3+ miembros).
//   3. Top 3 Tera types por miembro con razonamiento.

import { ALL_TYPES, TYPE_CHART } from '@/lib/type-effectiveness';
import type { PokemonType } from '@/types/pokemon';
import type { TeamMemberLite } from './threats';

export interface TeraSuggestion {
  pokemonId: number;
  name: string;
  currentTypes: PokemonType[];
  candidates: TeraCandidate[];
}

export interface TeraCandidate {
  type: PokemonType;
  score: number;
  // Resúmenes legibles
  newResists: PokemonType[];      // tipos contra los que ahora resiste
  newImmunes: PokemonType[];      // nuevas inmunidades
  lostResists: PokemonType[];     // resistencias que pierde
  newWeaknesses: PokemonType[];   // debilidades nuevas
  // Cuántas debilidades del equipo cubre este Tera
  teamCoverGain: number;
}

function defensiveMultiplier(
  attackType: PokemonType,
  defenderTypes: PokemonType[]
): number {
  let m = 1;
  for (const def of defenderTypes) {
    const x = TYPE_CHART[attackType][def];
    if (x !== undefined) m *= x;
  }
  return m;
}

function getProfile(types: PokemonType[]): Record<PokemonType, number> {
  const profile = {} as Record<PokemonType, number>;
  for (const atk of ALL_TYPES) {
    profile[atk] = defensiveMultiplier(atk, types);
  }
  return profile;
}

/**
 * Genera ranking de Tera types para cada miembro del equipo.
 * @param team  Equipo actual (sin slots null)
 * @param topN  Cuántos candidatos devolver por miembro (default 3)
 */
export function optimizeTera(
  team: TeamMemberLite[],
  topN = 3
): TeraSuggestion[] {
  if (team.length === 0) return [];

  // Vulnerabilidades agregadas del equipo: para cada tipo de ataque,
  // cuántos miembros son débiles (× ≥ 2).
  const teamWeakCount: Record<PokemonType, number> = {} as any;
  for (const atk of ALL_TYPES) {
    teamWeakCount[atk] = 0;
    for (const m of team) {
      if (defensiveMultiplier(atk, m.types) >= 2) {
        teamWeakCount[atk]++;
      }
    }
  }

  return team.map((member): TeraSuggestion => {
    const currentProfile = getProfile(member.types);

    // Evaluar cada Tera candidato (incluyendo los tipos actuales — el "no Tera").
    const candidates: TeraCandidate[] = ALL_TYPES.map((teraType) => {
      // Tera reemplaza la typing → ahora solo tienes el Tera como tipo defensivo.
      const teraProfile = getProfile([teraType]);

      const newResists: PokemonType[] = [];
      const newImmunes: PokemonType[] = [];
      const lostResists: PokemonType[] = [];
      const newWeaknesses: PokemonType[] = [];

      let teamCoverGain = 0;

      for (const atk of ALL_TYPES) {
        const before = currentProfile[atk];
        const after = teraProfile[atk];

        if (after === 0 && before !== 0) {
          newImmunes.push(atk);
          if (teamWeakCount[atk] >= 2) teamCoverGain += 3;
        } else if (after < 1 && before >= 1) {
          newResists.push(atk);
          if (teamWeakCount[atk] >= 2) teamCoverGain += 2;
        } else if (after >= 1 && before < 1) {
          lostResists.push(atk);
        }
        if (after >= 2 && before < 2) {
          newWeaknesses.push(atk);
          // Penalización extra si el equipo YA es débil a ese tipo
          if (teamWeakCount[atk] >= 2) teamCoverGain -= 2;
        }
      }

      // Score base: ganancias defensivas + cobertura de team gaps - daños
      const score =
        newImmunes.length * 4 +
        newResists.length * 1.5 -
        newWeaknesses.length * 2 -
        lostResists.length * 0.5 +
        teamCoverGain;

      return {
        type: teraType,
        score,
        newResists,
        newImmunes,
        lostResists,
        newWeaknesses,
        teamCoverGain,
      };
    })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    return {
      pokemonId: member.pokemonId,
      name: member.name,
      currentTypes: member.types,
      candidates,
    };
  });
}
