// Quick Coach — análisis rule-based de equipos sin necesidad de LLM.
//
// Detecta:
// - Roles cubiertos / faltantes (sweeper, wall, pivot, hazard setter, etc.)
// - Distribución de speed tiers (¿outsped los Pokémon comunes del meta?)
// - Cobertura ofensiva (¿qué tipos NO puedes golpear neutralmente?)
// - Cobertura defensiva (debilidades compartidas → "team weakness")
// - Win conditions (¿tienes algo que cierre partidas?)
//
// Outputs un TeamReport con scores + insights accionables.

import type { TeamMember, PokemonType } from '@/types/pokemon';
import { ALL_TYPES, TYPE_CHART, effectivenessAgainst } from '@/lib/type-effectiveness';

// ─── ROL DETECTION ───────────────────────────────────────────────────────

export type RoleTag =
  | 'physical-sweeper'
  | 'special-sweeper'
  | 'physical-wallbreaker'
  | 'special-wallbreaker'
  | 'physical-wall'
  | 'special-wall'
  | 'mixed-wall'
  | 'pivot'
  | 'hazard-setter'
  | 'hazard-remover'
  | 'cleric'
  | 'status-spammer'
  | 'setup-sweeper'
  | 'priority-attacker'
  | 'weather-setter'
  | 'terrain-setter'
  | 'trick-room-setter';

export interface MemberRoles {
  member: TeamMember;
  roles: RoleTag[];
  /** Speed stat at level 100, max EVs/IVs (rough) */
  speedTier: number;
}

const HAZARD_MOVES = ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'];
const HAZARD_REMOVERS = ['Rapid Spin', 'Defog', 'Court Change', 'Tidy Up', 'Mortal Spin'];
const STATUS_MOVES = ['Toxic', 'Will-O-Wisp', 'Thunder Wave', 'Spore', 'Sleep Powder', 'Glare', 'Nuzzle'];
const SETUP_MOVES = [
  'Swords Dance', 'Dragon Dance', 'Nasty Plot', 'Calm Mind', 'Bulk Up',
  'Quiver Dance', 'Shell Smash', 'Belly Drum', 'Tail Glow', 'Iron Defense',
  'Cosmic Power', 'Curse',
];
const PIVOT_MOVES = ['U-turn', 'Volt Switch', 'Flip Turn', 'Parting Shot', 'Teleport', 'Baton Pass'];
const PRIORITY_MOVES = [
  'Sucker Punch', 'Extreme Speed', 'Bullet Punch', 'Mach Punch',
  'Aqua Jet', 'Ice Shard', 'Shadow Sneak', 'Quick Attack', 'Fake Out',
  'Accelerock', 'Vacuum Wave',
];
const CLERIC_MOVES = ['Heal Bell', 'Aromatherapy', 'Wish'];
const WEATHER_MOVES = ['Rain Dance', 'Sunny Day', 'Sandstorm', 'Snowscape'];
const TERRAIN_MOVES = ['Electric Terrain', 'Grassy Terrain', 'Psychic Terrain', 'Misty Terrain'];
const TRICK_ROOM_ABILITIES_OR_MOVES = ['Trick Room'];

function moveHas(moves: string[] | undefined, list: string[]): boolean {
  if (!moves || moves.length === 0) return false;
  return moves.some((m) => list.includes(m));
}

export function inferRoles(member: TeamMember): MemberRoles {
  const { stats, moves, ability } = member;
  const physAtk = stats.attack;
  const specAtk = stats.specialAttack;
  const def = stats.defense;
  const spd = stats.specialDefense;
  const hp = stats.hp;
  const spe = stats.speed;
  const bulk = (hp + def + spd) / 3;

  const roles: RoleTag[] = [];

  // Sweepers / wallbreakers — alto offense + speed (sweeper) o no speed (wallbreaker)
  if (physAtk >= 110 && spe >= 100) roles.push('physical-sweeper');
  else if (physAtk >= 110 && spe < 90) roles.push('physical-wallbreaker');
  if (specAtk >= 110 && spe >= 100) roles.push('special-sweeper');
  else if (specAtk >= 110 && spe < 90) roles.push('special-wallbreaker');

  // Walls
  if (def >= 110 && spd >= 90 && hp >= 80) roles.push('physical-wall');
  if (spd >= 110 && def >= 90 && hp >= 80) roles.push('special-wall');
  if (bulk >= 100 && def >= 85 && spd >= 85) roles.push('mixed-wall');

  // Moves-derived
  if (moveHas(moves, PIVOT_MOVES)) roles.push('pivot');
  if (moveHas(moves, HAZARD_MOVES)) roles.push('hazard-setter');
  if (moveHas(moves, HAZARD_REMOVERS)) roles.push('hazard-remover');
  if (moveHas(moves, CLERIC_MOVES)) roles.push('cleric');
  if (moveHas(moves, STATUS_MOVES)) roles.push('status-spammer');
  if (moveHas(moves, SETUP_MOVES)) roles.push('setup-sweeper');
  if (moveHas(moves, PRIORITY_MOVES)) roles.push('priority-attacker');
  if (moveHas(moves, WEATHER_MOVES) || ability === 'Drizzle' || ability === 'Drought' || ability === 'Sand Stream' || ability === 'Snow Warning')
    roles.push('weather-setter');
  if (moveHas(moves, TERRAIN_MOVES) || (ability && ability.endsWith('Surge'))) roles.push('terrain-setter');
  if (moveHas(moves, TRICK_ROOM_ABILITIES_OR_MOVES)) roles.push('trick-room-setter');

  // Speed tier rough estimate (lvl 100, 252 EVs, +Nature) — no calculamos exacto pero damos pista
  const speedTier = Math.floor((spe * 2 + 31 + 63) * 1.1);

  return { member, roles, speedTier };
}

// ─── TEAM ANALYSIS ───────────────────────────────────────────────────────

export interface TeamInsight {
  severity: 'good' | 'warning' | 'critical';
  title: string;
  detail: string;
  /** Categoría para agrupar en UI */
  category: 'roles' | 'coverage' | 'defensive' | 'speed' | 'utility';
}

export interface TeamReport {
  /** Per-member role tags */
  members: MemberRoles[];
  /** Tipos ofensivos cubiertos (al menos un member golpea super-efectivo) */
  coveredOffensiveTypes: PokemonType[];
  /** Tipos defensivos donde 2+ members son débiles (≥ 2×) */
  sharedWeaknesses: Array<{ type: PokemonType; count: number; members: string[] }>;
  /** Tipos defensivos donde 2+ members tienen resistencia (≤ 0.5×) o inmunidad */
  sharedResistances: Array<{ type: PokemonType; count: number }>;
  /** Roles que el team CUBRE */
  rolesPresent: RoleTag[];
  /** Roles típicos que faltan */
  rolesMissing: RoleTag[];
  /** Speed tier promedio del equipo */
  avgSpeedTier: number;
  /** Insights priorizados — máximo ~8 */
  insights: TeamInsight[];
  /** Score global 0-100 */
  overallScore: number;
}

// Roles "esenciales" que un team competitivo standard debería tener
const ESSENTIAL_ROLES: RoleTag[] = [
  'hazard-setter',
  'hazard-remover',
  'pivot',
  'setup-sweeper',
  'priority-attacker',
];

export function analyzeTeam(team: TeamMember[]): TeamReport {
  const validMembers = team.filter(Boolean);
  if (validMembers.length === 0) {
    return emptyReport();
  }

  // 1. Inferir roles de cada member
  const members = validMembers.map(inferRoles);

  // 2. Roles presentes (unión de todos los miembros)
  const rolesPresentSet = new Set<RoleTag>();
  for (const m of members) m.roles.forEach((r) => rolesPresentSet.add(r));
  const rolesPresent = Array.from(rolesPresentSet);
  const rolesMissing = ESSENTIAL_ROLES.filter((r) => !rolesPresentSet.has(r));

  // 3. Cobertura ofensiva — qué tipos son golpeados super-efectivamente
  // por al menos UNO de los STABs del equipo
  const coveredOffensive = new Set<PokemonType>();
  for (const t of ALL_TYPES) {
    for (const m of members) {
      const memberTypes = m.member.types;
      // Asumimos sus STABs como ofensiva mínima
      for (const stab of memberTypes) {
        const mult = TYPE_CHART[stab][t] ?? 1;
        if (mult >= 2) {
          coveredOffensive.add(t);
          break;
        }
      }
    }
  }

  // 4. Sharedweakness/resistances — análisis defensivo
  const weakMap: Record<string, { type: PokemonType; count: number; members: string[] }> = {};
  const resistMap: Record<string, { type: PokemonType; count: number }> = {};

  for (const m of members) {
    const eff = effectivenessAgainst(m.member.types);
    for (const r of eff) {
      if (r.multiplier >= 2) {
        if (!weakMap[r.type]) weakMap[r.type] = { type: r.type, count: 0, members: [] };
        weakMap[r.type].count++;
        weakMap[r.type].members.push(m.member.name);
      }
      if (r.multiplier <= 0.5) {
        if (!resistMap[r.type]) resistMap[r.type] = { type: r.type, count: 0 };
        resistMap[r.type].count++;
      }
    }
  }

  const sharedWeaknesses = Object.values(weakMap)
    .filter((w) => w.count >= 2)
    .sort((a, b) => b.count - a.count);
  const sharedResistances = Object.values(resistMap)
    .filter((r) => r.count >= 2)
    .sort((a, b) => b.count - a.count);

  // 5. Speed tier promedio
  const avgSpeedTier =
    members.reduce((acc, m) => acc + m.speedTier, 0) / members.length;

  // 6. Insights — orden de prioridad
  const insights: TeamInsight[] = [];

  // Critical: 3+ members débiles al mismo tipo = team weakness peligrosa
  for (const w of sharedWeaknesses) {
    if (w.count >= 3) {
      insights.push({
        severity: 'critical',
        category: 'defensive',
        title: `${w.count}/${members.length} miembros débiles a ${w.type}`,
        detail: `Un solo Pokémon ${w.type} fuerte (${getMetaThreatsForType(w.type)}) puede barrer la mitad de tu equipo. Considera añadir un counter al tipo ${w.type} o resistir.`,
      });
    } else if (w.count === 2) {
      insights.push({
        severity: 'warning',
        category: 'defensive',
        title: `2 miembros débiles a ${w.type}`,
        detail: `${w.members.join(' y ')} comparten weakness a ${w.type}. Vigila amenazas ${w.type} en el meta.`,
      });
    }
  }

  // Roles missing
  if (rolesMissing.includes('hazard-setter')) {
    insights.push({
      severity: 'warning',
      category: 'utility',
      title: 'Sin hazards (Stealth Rock / Spikes)',
      detail:
        'En partidas >10 turnos, los hazards son chip damage gratis. Considera añadir Stealth Rock o Spikes a un Pokémon defensivo.',
    });
  }
  if (rolesMissing.includes('hazard-remover')) {
    insights.push({
      severity: 'warning',
      category: 'utility',
      title: 'Sin hazard removal',
      detail:
        'Si tu rival pone Stealth Rock, te comes 12-50% HP al cambiar (según weakness). Añade Rapid Spin, Defog o Tidy Up.',
    });
  }
  if (rolesMissing.includes('pivot')) {
    insights.push({
      severity: 'warning',
      category: 'utility',
      title: 'Sin pivots (U-turn / Volt Switch)',
      detail:
        'Los pivots dan momentum gratuito al cambiar a un favorable matchup. Hace tu equipo mucho más flexible turno a turno.',
    });
  }
  if (rolesMissing.includes('priority-attacker')) {
    insights.push({
      severity: 'warning',
      category: 'utility',
      title: 'Sin priority moves',
      detail:
        'Priority moves (Sucker Punch, Bullet Punch, Extreme Speed) son tu seguro contra setup sweepers + Pokémon más rápidos a low HP.',
    });
  }

  // Cobertura ofensiva — tipos NO cubiertos
  const uncoveredTypes = ALL_TYPES.filter((t) => !coveredOffensive.has(t));
  if (uncoveredTypes.length >= 6) {
    insights.push({
      severity: 'critical',
      category: 'coverage',
      title: `${uncoveredTypes.length} tipos sin cobertura super-efectiva`,
      detail: `Tu equipo no golpea super-efectivo a: ${uncoveredTypes.slice(0, 6).join(', ')}${uncoveredTypes.length > 6 ? '…' : ''}. Considera diversificar movesets para añadir cobertura.`,
    });
  } else if (uncoveredTypes.length >= 3) {
    insights.push({
      severity: 'warning',
      category: 'coverage',
      title: `${uncoveredTypes.length} tipos sin cobertura`,
      detail: `Tipos que ningún member golpea SE: ${uncoveredTypes.join(', ')}. Manageable, pero vigila si rival lleva uno de estos como switch-in seguro.`,
    });
  }

  // Speed analysis
  if (avgSpeedTier < 280) {
    insights.push({
      severity: 'warning',
      category: 'speed',
      title: 'Equipo lento',
      detail: `Speed tier promedio bajo (${Math.round(avgSpeedTier)}). Considera Choice Scarf, priority moves o estructura Trick Room.`,
    });
  } else if (avgSpeedTier > 360) {
    insights.push({
      severity: 'good',
      category: 'speed',
      title: 'Equipo rápido',
      detail: `Speed tier promedio alto (${Math.round(avgSpeedTier)}). Outspeed naturalmente la mayoría del meta sin Choice Scarf.`,
    });
  }

  // Good: equipo balanceado
  if (rolesMissing.length === 0 && sharedWeaknesses.filter((w) => w.count >= 3).length === 0) {
    insights.push({
      severity: 'good',
      category: 'roles',
      title: 'Equipo balanceado',
      detail:
        'Cubres todos los roles esenciales (hazards, removal, pivot, setup, priority) y no tienes weakness compartida grave. Buen base.',
    });
  }

  // Calcular score 0-100
  const score = computeScore({
    rolesMissingCount: rolesMissing.length,
    sharedWeaknessSevere: sharedWeaknesses.filter((w) => w.count >= 3).length,
    sharedWeaknessMild: sharedWeaknesses.filter((w) => w.count === 2).length,
    uncoveredTypesCount: uncoveredTypes.length,
    memberCount: members.length,
  });

  // Ordenar insights por severidad
  const sevOrder = { critical: 0, warning: 1, good: 2 };
  insights.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  return {
    members,
    coveredOffensiveTypes: Array.from(coveredOffensive),
    sharedWeaknesses,
    sharedResistances,
    rolesPresent,
    rolesMissing,
    avgSpeedTier,
    insights: insights.slice(0, 10),
    overallScore: score,
  };
}

function computeScore(p: {
  rolesMissingCount: number;
  sharedWeaknessSevere: number;
  sharedWeaknessMild: number;
  uncoveredTypesCount: number;
  memberCount: number;
}): number {
  let score = 100;
  // Penalizar roles faltantes (cada uno -8, máximo -40)
  score -= Math.min(p.rolesMissingCount * 8, 40);
  // Weakness severas (cada una -15)
  score -= p.sharedWeaknessSevere * 15;
  // Weakness mild (-3 cada)
  score -= p.sharedWeaknessMild * 3;
  // Cobertura
  score -= Math.max(0, p.uncoveredTypesCount - 3) * 2;
  // Team incompleto
  if (p.memberCount < 6) score -= (6 - p.memberCount) * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function emptyReport(): TeamReport {
  return {
    members: [],
    coveredOffensiveTypes: [],
    sharedWeaknesses: [],
    sharedResistances: [],
    rolesPresent: [],
    rolesMissing: ESSENTIAL_ROLES,
    avgSpeedTier: 0,
    insights: [
      {
        severity: 'warning',
        category: 'roles',
        title: 'Equipo vacío',
        detail: 'Añade Pokémon a tu equipo para recibir análisis.',
      },
    ],
    overallScore: 0,
  };
}

/** Devuelve Pokémon meta SV famosos por tipo X para ejemplificar amenazas */
function getMetaThreatsForType(type: PokemonType): string {
  const examples: Partial<Record<PokemonType, string>> = {
    fire: 'Heatran, Cinderace',
    water: 'Walking Wake, Iron Bundle',
    ice: 'Iron Bundle, Baxcalibur',
    electric: 'Iron Bundle, Raging Bolt',
    grass: 'Ogerpon, Rillaboom',
    ground: 'Garchomp, Great Tusk',
    rock: 'Tyranitar, Diancie',
    fighting: 'Great Tusk, Iron Hands',
    psychic: 'Hatterene, Iron Crown',
    ghost: 'Dragapult, Gholdengo',
    dark: 'Kingambit, Roaring Moon',
    dragon: 'Dragapult, Raging Bolt',
    steel: 'Kingambit, Iron Hands',
    fairy: 'Iron Valiant, Hatterene',
    bug: 'Volcarona, Slither Wing',
    flying: 'Dragonite, Tornadus',
    poison: 'Glimmora, Toxapex',
    normal: 'Cyclizar',
  };
  return examples[type] ?? 'Pokémon de ese tipo';
}

// ─── ROLE LABELS (humanos) ───────────────────────────────────────────────

export const ROLE_LABELS: Record<RoleTag, string> = {
  'physical-sweeper': 'Sweeper Físico',
  'special-sweeper': 'Sweeper Especial',
  'physical-wallbreaker': 'Wallbreaker Físico',
  'special-wallbreaker': 'Wallbreaker Especial',
  'physical-wall': 'Wall Físico',
  'special-wall': 'Wall Especial',
  'mixed-wall': 'Wall Mixto',
  'pivot': 'Pivot',
  'hazard-setter': 'Hazard Setter',
  'hazard-remover': 'Hazard Remover',
  'cleric': 'Cleric',
  'status-spammer': 'Status Spammer',
  'setup-sweeper': 'Setup',
  'priority-attacker': 'Priority',
  'weather-setter': 'Weather Setter',
  'terrain-setter': 'Terrain Setter',
  'trick-room-setter': 'Trick Room',
};
