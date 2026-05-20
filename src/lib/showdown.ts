// Parser + exportador del formato de texto de Pokémon Showdown.
//
// Formato:
//   Nickname (Species) (Gender) @ Item
//   Ability: AbilityName
//   Level: 50
//   Shiny: Yes
//   Tera Type: Steel
//   EVs: 4 HP / 252 Atk / 252 Spe
//   IVs: 31 HP / 31 Atk / ... (opcional)
//   Adamant Nature
//   - Move 1
//   - Move 2
//   - Move 3
//   - Move 4
//
// Cada Pokémon separado por una línea en blanco.
// `Nickname (Species)` es opcional: si no hay nickname, la primera línea
// es solo "Species (Gender) @ Item".

import type { TeamMember, PokemonStats, PokemonType } from '@/types/pokemon';

const STAT_KEY_MAP: Record<string, keyof PokemonStats> = {
  hp: 'hp',
  atk: 'attack',
  def: 'defense',
  spa: 'specialAttack',
  spd: 'specialDefense',
  spe: 'speed',
};

const STAT_LABEL_MAP: Record<keyof PokemonStats, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  specialAttack: 'SpA',
  specialDefense: 'SpD',
  speed: 'Spe',
};

export interface ShowdownParsedMember {
  species: string;          // "Garchomp"
  nickname?: string;
  gender?: 'M' | 'F';
  item?: string;
  ability?: string;
  level?: number;
  shiny?: boolean;
  teraType?: string;
  evs?: Partial<PokemonStats>;
  ivs?: Partial<PokemonStats>;
  nature?: string;
  moves: string[];
}

export interface ShowdownParseResult {
  members: ShowdownParsedMember[];
  errors: string[];
}

/**
 * Parsea el bloque de texto Showdown a una lista de members.
 * Recoge errores en lugar de lanzar — el caller decide qué hacer.
 */
export function parseShowdown(text: string): ShowdownParseResult {
  const errors: string[] = [];
  // Normaliza saltos de línea y splits por doble newline
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const members: ShowdownParsedMember[] = [];
  for (const block of blocks) {
    try {
      const m = parseMember(block);
      if (m) members.push(m);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : 'Error desconocido');
    }
  }
  return { members, errors };
}

function parseMember(block: string): ShowdownParsedMember | null {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const member: ShowdownParsedMember = { species: '', moves: [] };

  // Primera línea: Nickname (Species) (Gender) @ Item
  const head = lines[0];
  const [speciesPart, itemPart] = head.split('@').map((s) => s.trim());
  if (itemPart) member.item = itemPart;

  // Extrae gender (M/F entre paréntesis al final)
  const genderMatch = speciesPart.match(/\(([MF])\)\s*$/);
  let speciesRaw = speciesPart;
  if (genderMatch) {
    member.gender = genderMatch[1] as 'M' | 'F';
    speciesRaw = speciesPart.slice(0, genderMatch.index).trim();
  }
  // Si hay paréntesis ahora, lo de dentro ES la species y lo de fuera el nickname
  const speciesMatch = speciesRaw.match(/^(.+?)\s*\((.+?)\)\s*$/);
  if (speciesMatch) {
    member.nickname = speciesMatch[1];
    member.species = speciesMatch[2];
  } else {
    member.species = speciesRaw;
  }

  // Resto de líneas
  for (const line of lines.slice(1)) {
    if (line.startsWith('-')) {
      const move = line.slice(1).trim();
      if (move) member.moves.push(move);
      continue;
    }
    const m = line.match(/^([^:]+):\s*(.+)$/);
    if (m) {
      const key = m[1].toLowerCase();
      const val = m[2].trim();
      switch (key) {
        case 'ability':
          member.ability = val;
          break;
        case 'level':
          member.level = parseInt(val) || 100;
          break;
        case 'shiny':
          member.shiny = /^y/i.test(val);
          break;
        case 'tera type':
        case 'teratype':
          member.teraType = val;
          break;
        case 'evs':
          member.evs = parseStatLine(val);
          break;
        case 'ivs':
          member.ivs = parseStatLine(val);
          break;
      }
    } else if (/\b(Adamant|Modest|Jolly|Timid|Bold|Calm|Impish|Careful|Brave|Quiet|Relaxed|Sassy|Naive|Hasty|Naughty|Lonely|Lax|Mild|Rash|Gentle|Hardy|Docile|Serious|Bashful|Quirky)\s+Nature\b/i.test(
        line
      )) {
      const natMatch = line.match(/(\w+)\s+Nature/i);
      if (natMatch) member.nature = capitalize(natMatch[1].toLowerCase());
    }
  }

  return member.species ? member : null;
}

function parseStatLine(raw: string): Partial<PokemonStats> {
  const out: Partial<PokemonStats> = {};
  for (const seg of raw.split('/')) {
    const m = seg.trim().match(/^(\d+)\s+([A-Za-z]+)$/);
    if (!m) continue;
    const value = parseInt(m[1]);
    const key = STAT_KEY_MAP[m[2].toLowerCase()];
    if (key) out[key] = value;
  }
  return out;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── EXPORT ─────────────────────────────────────────────────────────────

/**
 * Convierte un equipo del store a texto Showdown.
 * Si EVs/IVs no están definidos, no los emite (Showdown asume defaults).
 */
export function exportShowdown(team: TeamMember[]): string {
  return team
    .filter(Boolean)
    .map((m) => exportMember(m))
    .join('\n\n');
}

function exportMember(m: TeamMember): string {
  const lines: string[] = [];

  // Head: [Nickname] (Species) [(Gender)] @ Item
  let head = m.nickname && m.nickname !== m.name ? `${m.nickname} (${m.name})` : m.name;
  if (m.item) head += ` @ ${m.item}`;
  lines.push(head);

  if (m.ability) lines.push(`Ability: ${m.ability}`);
  if (m.level && m.level !== 100) lines.push(`Level: ${m.level}`);
  if (m.shiny) lines.push('Shiny: Yes');

  if (m.evs) {
    const evParts = formatStats(m.evs);
    if (evParts) lines.push(`EVs: ${evParts}`);
  }
  if (m.ivs) {
    const ivParts = formatStats(m.ivs, 31); // omite si todo 31
    if (ivParts) lines.push(`IVs: ${ivParts}`);
  }
  if (m.nature) lines.push(`${m.nature} Nature`);

  for (const move of m.moves ?? []) {
    if (move) lines.push(`- ${move}`);
  }

  return lines.join('\n');
}

function formatStats(stats: Partial<PokemonStats>, omitDefault?: number): string {
  const parts: string[] = [];
  for (const k of Object.keys(STAT_LABEL_MAP) as (keyof PokemonStats)[]) {
    const v = stats[k];
    if (v === undefined || v === null) continue;
    if (omitDefault !== undefined && v === omitDefault) continue;
    if (v === 0 && omitDefault === undefined) continue; // omite EVs 0
    parts.push(`${v} ${STAT_LABEL_MAP[k]}`);
  }
  return parts.join(' / ');
}
