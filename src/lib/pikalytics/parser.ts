// Parser for Pikalytics LLM-friendly markdown endpoint
// (https://www.pikalytics.com/ai/pokedex/<format>/<pokemon>)

export interface PikalyticsPokemonData {
  pokemon: string;
  format: string;
  dataDate: string;
  moves: NameUsage[];
  abilities: NameUsage[];
  items: NameUsage[];
  teammates: NameUsage[];
  featuredTeams: PikalyticsTeam[];
  baseStats?: BaseStats;
}

export interface NameUsage {
  name: string;
  usagePct: number;
}

export interface PikalyticsTeam {
  number: number;
  author: string;
  record: string; // "12 - 3 - 0"
  members: string[]; // 6 names
  focusSet?: {
    ability?: string;
    item?: string;
    moves: string[];
  };
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  bst: number;
}

function parseUsageBlock(md: string, header: string): NameUsage[] {
  // Match section starting with `## <header>` until next `## ` or end
  const re = new RegExp(
    `## ${header}\\s*\\n([\\s\\S]*?)(?:\\n## |$)`,
    'i'
  );
  const m = md.match(re);
  if (!m) return [];
  const body = m[1];
  const out: NameUsage[] = [];
  const lineRe = /^- \*\*(.+?)\*\*:\s*([\d.]+)%/gm;
  let l;
  while ((l = lineRe.exec(body)) !== null) {
    out.push({ name: l[1].trim(), usagePct: Number(l[2]) });
  }
  return out;
}

function parseTeams(md: string, focusPokemon: string): PikalyticsTeam[] {
  // Each team block starts with `### Team N by <author>`
  const sectionRe = new RegExp(
    `## Featured Teams[^\\n]*\\n([\\s\\S]*?)(?:\\n## |$)`,
    'i'
  );
  const sec = md.match(sectionRe);
  if (!sec) return [];
  const body = sec[1];

  const teams: PikalyticsTeam[] = [];
  const teamRe = /### Team (\d+) by\s+([^\n]+)\n([\s\S]*?)(?=\n### Team |\n## |$)/g;
  let t;
  while ((t = teamRe.exec(body)) !== null) {
    const number = Number(t[1]);
    const author = t[2].trim();
    const block = t[3];

    const recordMatch = block.match(/\*Record:\s*([^*\n]+)\*/);
    const membersMatch = block.match(/\*\*Pokemon\*\*:\s*([^\n]+)/i);
    const members = membersMatch
      ? membersMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    let focusSet: PikalyticsTeam['focusSet'] | undefined;
    // Flexible regex: allow space-or-dash between name parts, escape regex meta.
    const flexibleName = focusPokemon
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/[\s-]+/g, '[\\s-]+');
    const setHeaderRe = new RegExp(
      `\\*\\*${flexibleName}\\s+Set\\*\\*:\\s*\\n([\\s\\S]*?)(?:\\n### |\\n## |$)`,
      'i'
    );
    const setBlock = block.match(setHeaderRe);
    if (setBlock) {
      const sb = setBlock[1];
      const ability = sb.match(/\*\*Ability\*\*:\s*([^\n]+)/i)?.[1].trim();
      const item = sb.match(/\*\*Item\*\*:\s*([^\n]+)/i)?.[1].trim();
      const movesMatch = sb.match(/\*\*Moves\*\*:\s*([^\n]+)/i);
      const moves = movesMatch
        ? movesMatch[1].split(',').map((m) => m.trim()).filter(Boolean)
        : [];
      focusSet = { ability, item, moves };
    }

    teams.push({
      number,
      author,
      record: recordMatch?.[1].trim() ?? '',
      members,
      focusSet,
    });
  }
  return teams;
}

function parseBaseStats(md: string): BaseStats | undefined {
  const sec = md.match(
    /What are the base stats[^\n]*\?\n([\s\S]*?)(?:\n---|\n## |$)/i
  );
  if (!sec) return undefined;
  const block = sec[1];
  const stat = (label: string): number | null => {
    const r = new RegExp(`\\|\\s*${label}\\s*\\|\\s*(\\d+)\\s*\\|`, 'i');
    const m = block.match(r);
    return m ? Number(m[1]) : null;
  };
  const hp = stat('HP');
  const attack = stat('Attack');
  const defense = stat('Defense');
  const sa = stat('Sp\\. Atk');
  const sd = stat('Sp\\. Def');
  const speed = stat('Speed');
  const bstMatch = block.match(/\*\*BST\*\*\s*\|\s*\*\*(\d+)\*\*/);
  if (
    hp === null ||
    attack === null ||
    defense === null ||
    sa === null ||
    sd === null ||
    speed === null
  )
    return undefined;
  return {
    hp,
    attack,
    defense,
    specialAttack: sa,
    specialDefense: sd,
    speed,
    bst: bstMatch ? Number(bstMatch[1]) : hp + attack + defense + sa + sd + speed,
  };
}

function parseQuickInfo(md: string) {
  const dataDate = md.match(/\*\*Data Date\*\*\s*\|\s*([^\s|]+)/)?.[1] ?? '';
  const format = md.match(/\*\*Format\*\*\s*\|\s*([^|]+?)\s*\(`([^`]+)`\)/);
  return {
    dataDate,
    formatLabel: format?.[1].trim() ?? '',
    formatSlug: format?.[2].trim() ?? '',
  };
}

export function parsePikalyticsMarkdown(
  md: string,
  pokemonName: string
): PikalyticsPokemonData | null {
  if (!md || md.length < 200) return null;
  // Try to detect "no data" responses
  if (/no data|not available/i.test(md.slice(0, 500)) && !md.includes('## Common')) {
    return null;
  }

  const qi = parseQuickInfo(md);
  return {
    pokemon: pokemonName,
    format: qi.formatSlug || 'unknown',
    dataDate: qi.dataDate,
    moves: parseUsageBlock(md, 'Common Moves'),
    abilities: parseUsageBlock(md, 'Common Abilities'),
    items: parseUsageBlock(md, 'Common Items'),
    teammates: parseUsageBlock(md, 'Common Teammates'),
    featuredTeams: parseTeams(md, pokemonName),
    baseStats: parseBaseStats(md),
  };
}
