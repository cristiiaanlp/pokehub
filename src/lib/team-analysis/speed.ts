// Speed tier calculator for competitive Pokémon.
// Formula reference (Gen 6+ with new EV cap and stat formula):
//   stat = floor((2*base + IV + floor(EV/4)) * level/100 + 5) * nature
//   final speed = floor(stat * modifier) — where modifier accounts for
//   items (Choice Scarf 1.5×, etc.), abilities (Swift Swim, etc.) and stages.

export const NATURES_SPEED = [
  { id: 'jolly', label: 'Jolly (+Spe)', mult: 1.1 },
  { id: 'timid', label: 'Timid (+Spe)', mult: 1.1 },
  { id: 'hasty', label: 'Hasty (+Spe)', mult: 1.1 },
  { id: 'naive', label: 'Naive (+Spe)', mult: 1.1 },
  { id: 'neutral', label: 'Neutral', mult: 1.0 },
  { id: 'adamant', label: 'Adamant (–Spe)', mult: 0.9 },
  { id: 'modest', label: 'Modest (–Spe)', mult: 0.9 },
  { id: 'careful', label: 'Careful (–Spe)', mult: 0.9 },
  { id: 'calm', label: 'Calm (–Spe)', mult: 0.9 },
] as const;

export type NatureId = (typeof NATURES_SPEED)[number]['id'];

export interface SpeedItem {
  id: string;
  label: string;
  mult: number;
  note?: string;
}

export const SPEED_ITEMS: SpeedItem[] = [
  { id: 'none', label: 'Sin objeto', mult: 1.0 },
  { id: 'scarf', label: 'Choice Scarf', mult: 1.5 },
  { id: 'iron-ball', label: 'Iron Ball', mult: 0.5 },
  { id: 'macho-brace', label: 'Macho Brace', mult: 0.5 },
];

export interface SpeedAbility {
  id: string;
  label: string;
  mult: number;
  condition?: string;
}

export const SPEED_ABILITIES: SpeedAbility[] = [
  { id: 'none', label: 'Sin habilidad activa', mult: 1.0 },
  { id: 'swift-swim', label: 'Swift Swim', mult: 2.0, condition: 'Lluvia' },
  { id: 'chlorophyll', label: 'Chlorophyll', mult: 2.0, condition: 'Sol' },
  { id: 'sand-rush', label: 'Sand Rush', mult: 2.0, condition: 'Arena' },
  { id: 'slush-rush', label: 'Slush Rush', mult: 2.0, condition: 'Nieve' },
  { id: 'unburden', label: 'Unburden', mult: 2.0, condition: 'Item consumido' },
  { id: 'protosynthesis', label: 'Protosynthesis Speed', mult: 1.5, condition: 'Sol / Booster' },
  { id: 'quark-drive', label: 'Quark Drive Speed', mult: 1.5, condition: 'Electric Terrain / Booster' },
  { id: 'tailwind', label: 'Tailwind activo', mult: 2.0, condition: '4 turnos' },
];

export const STAGE_MULT: Record<number, number> = {
  '-6': 1 / 4,
  '-5': 2 / 7,
  '-4': 1 / 3,
  '-3': 2 / 5,
  '-2': 1 / 2,
  '-1': 2 / 3,
  '0': 1,
  '1': 1.5,
  '2': 2,
  '3': 2.5,
  '4': 3,
  '5': 3.5,
  '6': 4,
};

export interface SpeedInput {
  baseSpeed: number;
  level: number;
  ev: number; // 0-252
  iv: number; // 0-31
  natureMult: number; // 0.9 | 1.0 | 1.1
  itemMult: number;
  abilityMult: number;
  stages: number; // -6 .. 6
}

export function computeSpeed(input: SpeedInput): number {
  const { baseSpeed, level, ev, iv, natureMult, itemMult, abilityMult, stages } = input;
  // base stat formula (Gen 3+)
  const raw = Math.floor(((2 * baseSpeed + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  // nature
  const withNature = Math.floor(raw * natureMult);
  // stages
  const stageMod = STAGE_MULT[stages] ?? 1;
  // combine modifiers
  const final = Math.floor(withNature * itemMult * abilityMult * stageMod);
  return final;
}

// Common benchmark speed tiers to compare against (competitive references).
// These are the "natural max speed" of common scarfers and base 100s.
export interface Benchmark {
  name: string;
  speed: number;
  note: string;
}

export const BENCHMARKS: Benchmark[] = [
  { name: 'Base 60 max +Spe (Heatran, etc.)', speed: 173, note: 'Stealth-rock setter típico' },
  { name: 'Base 70 max +Spe (Tyranitar)', speed: 188, note: 'TTar Adamant' },
  { name: 'Base 80 neutral 252 EV', speed: 199, note: 'Toxapex etc' },
  { name: 'Base 85 max +Spe (Charizard)', speed: 213, note: 'Pivot ofensivo' },
  { name: 'Base 90 max +Spe', speed: 218, note: 'Salamence pre-DD' },
  { name: 'Base 100 max +Spe (Mewtwo)', speed: 230, note: 'Tier estándar' },
  { name: 'Base 102 (Garchomp Jolly)', speed: 232, note: '⭐ Speed tier ícónico' },
  { name: 'Base 105 max +Spe', speed: 236, note: 'Heliolisk' },
  { name: 'Base 108 (Latios/Latias)', speed: 240, note: 'Dragones psíquicos' },
  { name: 'Base 110 max +Spe', speed: 243, note: 'Starmie' },
  { name: 'Base 115 max +Spe', speed: 251, note: 'Tornadus' },
  { name: 'Base 120 max +Spe', speed: 258, note: 'Greninja, Aerodactyl' },
  { name: 'Base 125 max +Spe', speed: 266, note: 'Talonflame' },
  { name: 'Base 130 max +Spe (Dragapult)', speed: 274, note: '⭐ Wallbreaker rápido' },
  { name: 'Base 135 (Iron Bundle)', speed: 281, note: 'Mejor sweeper Gen 9' },
  { name: 'Scarf base 100 max', speed: 345, note: 'Scarf tier estándar' },
  { name: 'Scarf base 110 max', speed: 364, note: 'Scarf agresivo' },
  { name: 'Scarf base 120 max', speed: 387, note: 'Scarf rapidísimo' },
];

export function classifyBenchmark(speed: number): Benchmark[] {
  // Return 3 closest benchmarks (one below, one above, one beat exactly)
  return [...BENCHMARKS]
    .map((b) => ({ ...b, diff: Math.abs(b.speed - speed) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 5);
}
