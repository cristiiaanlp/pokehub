import { ALL_TYPES } from '@/lib/type-effectiveness';
import type { PokemonListItem, PokemonType } from '@/types/pokemon';

export interface GenRange {
  id: number;
  label: string;
  range: [number, number];
}

export const GENERATIONS: GenRange[] = [
  { id: 1, label: 'Gen 1 (Kanto)', range: [1, 151] },
  { id: 2, label: 'Gen 2 (Johto)', range: [152, 251] },
  { id: 3, label: 'Gen 3 (Hoenn)', range: [252, 386] },
  { id: 4, label: 'Gen 4 (Sinnoh)', range: [387, 493] },
  { id: 5, label: 'Gen 5 (Unova)', range: [494, 649] },
  { id: 6, label: 'Gen 6 (Kalos)', range: [650, 721] },
  { id: 7, label: 'Gen 7 (Alola)', range: [722, 809] },
  { id: 8, label: 'Gen 8 (Galar)', range: [810, 905] },
  { id: 9, label: 'Gen 9 (Paldea)', range: [906, 1025] },
];

export const STARTERS: number[][] = [
  [1, 4, 7], // Kanto
  [152, 155, 158], // Johto
  [252, 255, 258], // Hoenn
  [387, 390, 393], // Sinnoh
  [495, 498, 501], // Unova
  [650, 653, 656], // Kalos
  [722, 725, 728], // Alola
  [810, 813, 816], // Galar
  [906, 909, 912], // Paldea
];

export const ALL_STARTERS: number[] = STARTERS.flat();

export interface RandomFilters {
  gens?: number[]; // empty = all
  types?: PokemonType[]; // OR filter
  fullyEvolved?: boolean; // (best effort flag — we don't know stage)
}

function inGens(id: number, gens: number[]): boolean {
  if (gens.length === 0) return true;
  return gens.some((g) => {
    const range = GENERATIONS.find((x) => x.id === g)?.range;
    return range ? id >= range[0] && id <= range[1] : false;
  });
}

function matchesTypes(p: PokemonListItem, types: PokemonType[]): boolean {
  if (types.length === 0) return true;
  return p.types.some((t) => types.includes(t));
}

export function rollOne(
  pool: PokemonListItem[],
  filters: RandomFilters
): PokemonListItem | null {
  const candidates = pool.filter(
    (p) => inGens(p.id, filters.gens ?? []) && matchesTypes(p, filters.types ?? [])
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function rollTeam(
  pool: PokemonListItem[],
  filters: RandomFilters,
  size = 6
): PokemonListItem[] {
  const candidates = pool.filter(
    (p) => inGens(p.id, filters.gens ?? []) && matchesTypes(p, filters.types ?? [])
  );
  if (candidates.length === 0) return [];
  // shuffle and take N
  const copy = [...candidates];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, size);
}

export function rollMonotypeTeam(
  pool: PokemonListItem[],
  type: PokemonType,
  size = 6
): { type: PokemonType; team: PokemonListItem[] } {
  return { type, team: rollTeam(pool, { types: [type] }, size) };
}

export function rollRandomMonotype(
  pool: PokemonListItem[],
  size = 6
): { type: PokemonType; team: PokemonListItem[] } {
  const type = ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
  return rollMonotypeTeam(pool, type, size);
}

export function rollStarter(): number {
  return ALL_STARTERS[Math.floor(Math.random() * ALL_STARTERS.length)];
}

export interface NuzlockeChallenge {
  starterId: number;
  rules: string[];
  twist: string;
}

const TWISTS = [
  'Solo se puede usar el primer encuentro de cada ruta',
  'Prohibido usar items en batalla',
  'Cualquier Pokémon que caiga debe ser liberado',
  'Solo Pokémon de un tipo elegido al azar al empezar',
  'Cambio de Pokémon prohibido (set mode)',
  'Solo evoluciones por nivel (no piedras / objetos)',
  'No volver al Centro Pokémon hasta el siguiente gimnasio',
  'Solo capturas tras KO con el starter',
  'Apodo obligatorio para cada Pokémon',
  'Liberar al starter al ganar el primer gimnasio',
  'Solo Pokémon con BST < 500 permitidos',
  'Cada Pokémon debe tener apodo en otro idioma',
];

const RULE_BANK = [
  'Dupes clause: si capturaste ya esa familia evolutiva, repite encuentro',
  'Species clause: máximo uno de cada especie',
  'Shiny clause: si encuentras un shiny, lo puedes capturar aunque rompa otras reglas',
  'No paid healing fuera de gimnasios',
  'Nickname obligatorio',
  'Sin trades',
  'Solo capturar primer encuentro por ruta',
];

export function rollNuzlockeChallenge(): NuzlockeChallenge {
  const starterId = rollStarter();
  const rules = pickN(RULE_BANK, 3);
  const twist = TWISTS[Math.floor(Math.random() * TWISTS.length)];
  return { starterId, rules, twist };
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}
