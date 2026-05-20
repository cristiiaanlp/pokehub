// Move Set Wizard.
//
// Dada una species (con sus tipos + base stats) y un ROL, sugiere un set
// de 4 moves usando reglas deterministas (sin LLM).
//
// Heurísticas por rol:
//   - Physical Sweeper: 2 STABs físicos + setup + cobertura.
//   - Special Sweeper: 2 STABs especiales + setup + cobertura.
//   - Wall: recovery + status + STAB + cobertura.
//   - Pivot: U-turn/Volt Switch + STAB + utility.
//   - Lead: Stealth Rock/Tailwind + STAB + utility + Fake Out (si lo aprende).
//   - Trick Room: setup (TR) + 2 STABs + cobertura.
//
// Los movimientos sugeridos provienen del learnset del Pokémon (PokéAPI).
// Cada move tiene una "fitness" score por rol — los top 4 ganan.

import type { PokemonType } from '@/types/pokemon';
import { fetchMoveDetail } from '@/lib/pokeapi-database';

export type RoleKey =
  | 'physical-sweeper'
  | 'special-sweeper'
  | 'wall'
  | 'pivot'
  | 'lead'
  | 'trick-room';

export interface RoleMeta {
  id: RoleKey;
  label: string;
  description: string;
  emoji: string;
}

export const ROLES: RoleMeta[] = [
  {
    id: 'physical-sweeper',
    label: 'Physical Sweeper',
    description: 'Daño puro físico + speed control + setup.',
    emoji: '⚔️',
  },
  {
    id: 'special-sweeper',
    label: 'Special Sweeper',
    description: 'Daño especial + cobertura + setup.',
    emoji: '✨',
  },
  {
    id: 'wall',
    label: 'Wall',
    description: 'Aguantar hits, recovery, status.',
    emoji: '🛡️',
  },
  {
    id: 'pivot',
    label: 'Pivot',
    description: 'U-turn/Volt Switch + utility para forzar matchups.',
    emoji: '🔄',
  },
  {
    id: 'lead',
    label: 'Lead',
    description: 'Setup turno 1 (Rocks, Tailwind, Fake Out).',
    emoji: '🚀',
  },
  {
    id: 'trick-room',
    label: 'Trick Room',
    description: 'TR setter o slow sweeper bajo TR.',
    emoji: '⏱️',
  },
];

interface MoveInfo {
  name: string;
  displayName: string;
  type: PokemonType;
  damageClass: 'physical' | 'special' | 'status';
  power: number | null;
  priority: number;
}

// Curated list of "key" utility moves que sumamos como bonus si los aprende
const KEY_MOVES: Record<string, { roles: RoleKey[]; weight: number; reason: string }> = {
  'swords-dance': { roles: ['physical-sweeper'], weight: 50, reason: 'Setup +2 Atk' },
  'dragon-dance': { roles: ['physical-sweeper'], weight: 50, reason: 'Setup +1 Atk +1 Spe' },
  'bulk-up': { roles: ['physical-sweeper', 'wall'], weight: 35, reason: 'Setup +1 Atk +1 Def' },
  'nasty-plot': { roles: ['special-sweeper'], weight: 50, reason: 'Setup +2 SpA' },
  'calm-mind': { roles: ['special-sweeper', 'wall'], weight: 45, reason: 'Setup +1 SpA +1 SpD' },
  'quiver-dance': { roles: ['special-sweeper'], weight: 60, reason: 'Setup +1 SpA +1 SpD +1 Spe' },
  recover: { roles: ['wall'], weight: 50, reason: 'Recovery 50%' },
  roost: { roles: ['wall'], weight: 50, reason: 'Recovery 50%' },
  'slack-off': { roles: ['wall'], weight: 50, reason: 'Recovery 50%' },
  synthesis: { roles: ['wall'], weight: 40, reason: 'Recovery weather-dependent' },
  'will-o-wisp': { roles: ['wall', 'pivot'], weight: 35, reason: 'Burn físicos' },
  'toxic': { roles: ['wall'], weight: 30, reason: 'Toxic stack' },
  'u-turn': { roles: ['pivot', 'lead'], weight: 55, reason: 'Pivote físico' },
  'volt-switch': { roles: ['pivot'], weight: 55, reason: 'Pivote especial' },
  'flip-turn': { roles: ['pivot'], weight: 50, reason: 'Pivote agua' },
  'parting-shot': { roles: ['pivot'], weight: 45, reason: 'Pivote + debuff' },
  'stealth-rock': { roles: ['lead', 'wall'], weight: 50, reason: 'Hazard universal' },
  'spikes': { roles: ['lead', 'wall'], weight: 35, reason: 'Hazard físico' },
  'tailwind': { roles: ['lead', 'pivot'], weight: 40, reason: 'Speed control 4 turnos' },
  'fake-out': { roles: ['lead'], weight: 45, reason: 'Flinch + chip turno 1' },
  'trick-room': { roles: ['trick-room', 'lead'], weight: 70, reason: 'TR setter principal' },
  'protect': { roles: ['lead', 'wall'], weight: 25, reason: 'Scout + stall' },
};

interface MovesetSuggestion {
  pokemonId: number;
  pokemonName: string;
  role: RoleMeta;
  moves: Array<{
    name: string;
    displayName: string;
    type: PokemonType;
    reason: string;
    score: number;
  }>;
  note?: string;
}

/**
 * Genera un moveset sugerido para una species y un rol.
 * Hace ~50 fetches a PokéAPI la primera vez (cacheados después).
 */
export async function suggestMoveset(
  pokemon: { id: number; name: string; types: PokemonType[]; movesetSlugs: string[] },
  role: RoleKey
): Promise<MovesetSuggestion | null> {
  const roleMeta = ROLES.find((r) => r.id === role);
  if (!roleMeta) return null;

  // Fetch detalles de hasta los primeros 80 moves (suficiente cobertura para sets clásicos)
  const slugs = pokemon.movesetSlugs.slice(0, 80);
  const details = await Promise.all(slugs.map((s) => fetchMoveDetail(s)));
  const validMoves: MoveInfo[] = details
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .map((d) => ({
      name: d.name,
      displayName: d.displayName,
      type: d.type,
      damageClass: d.damageClass,
      power: d.power,
      priority: d.priority,
    }));

  // Scoring por move
  const scored = validMoves.map((m) => {
    const result = scoreMove(m, role, pokemon.types);
    return { ...m, score: result.score, reason: result.reason };
  });

  // Diversificación: evita 4 moves del mismo tipo o todos status.
  scored.sort((a, b) => b.score - a.score);
  const selected: typeof scored = [];
  const typeCounts: Record<string, number> = {};
  let statusCount = 0;
  for (const m of scored) {
    if (m.score <= 0) continue;
    if (selected.length >= 4) break;
    const tCount = typeCounts[m.type] ?? 0;
    if (tCount >= 2) continue; // máximo 2 del mismo tipo
    if (m.damageClass === 'status' && statusCount >= 2) continue;
    selected.push(m);
    typeCounts[m.type] = tCount + 1;
    if (m.damageClass === 'status') statusCount++;
  }

  return {
    pokemonId: pokemon.id,
    pokemonName: pokemon.name,
    role: roleMeta,
    moves: selected.map((m) => ({
      name: m.name,
      displayName: m.displayName,
      type: m.type,
      reason: m.reason,
      score: m.score,
    })),
    note:
      selected.length < 4
        ? 'Este Pokémon no aprende suficientes moves competitivos para este rol — considera otro rol o species.'
        : undefined,
  };
}

function scoreMove(
  move: MoveInfo,
  role: RoleKey,
  ownTypes: PokemonType[]
): { score: number; reason: string } {
  const isSTAB = ownTypes.includes(move.type);
  const stabBoost = isSTAB ? 1.5 : 1;

  // 1) Es un "key move"? Premio extra
  const keyMeta = KEY_MOVES[move.name];
  if (keyMeta && keyMeta.roles.includes(role)) {
    return { score: keyMeta.weight, reason: keyMeta.reason };
  }

  // 2) STAB / coverage según rol
  if (role === 'physical-sweeper' || role === 'lead' || role === 'pivot') {
    if (move.damageClass === 'physical' && (move.power ?? 0) >= 75) {
      return {
        score: (move.power ?? 0) * stabBoost,
        reason: isSTAB ? 'STAB físico fuerte' : 'Cobertura física',
      };
    }
  }
  if (role === 'special-sweeper' || role === 'trick-room') {
    if (move.damageClass === 'special' && (move.power ?? 0) >= 75) {
      return {
        score: (move.power ?? 0) * stabBoost,
        reason: isSTAB ? 'STAB especial fuerte' : 'Cobertura especial',
      };
    }
  }
  if (role === 'trick-room') {
    // En TR queremos moves de cualquier categoría con BP alto
    if ((move.power ?? 0) >= 80) {
      return {
        score: (move.power ?? 0) * stabBoost,
        reason: isSTAB ? 'STAB para TR' : 'Cobertura TR',
      };
    }
  }
  if (role === 'wall') {
    // Wall quiere moves de bajo BP pero utility o stab decente
    if (move.damageClass === 'status') {
      return { score: 15, reason: 'Status utility' };
    }
    if (isSTAB && (move.power ?? 0) >= 60) {
      return { score: 25, reason: 'STAB de mantenimiento' };
    }
  }

  // 3) Prioridad
  if (move.priority > 0 && (move.power ?? 0) >= 40) {
    return { score: 20, reason: `Prioridad +${move.priority}` };
  }

  return { score: 0, reason: '' };
}
