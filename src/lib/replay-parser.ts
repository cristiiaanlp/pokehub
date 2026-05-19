// Parser de logs de Pokémon Showdown. Recibe el `.log` (texto plano con
// líneas que empiezan por |) y extrae: jugadores, equipos, KOs, switches,
// movimientos, tera, MVP, ganador.
//
// El formato de Showdown está documentado en
// https://github.com/smogon/pokemon-showdown/blob/master/sim/SIM-PROTOCOL.md
// pero esto es un parser pragmático para V1 — no aspira a 100% cobertura.

export interface ReplayPlayer {
  slot: 'p1' | 'p2';
  name: string;
  rating?: number;
  team: ReplayMember[];
}

export interface ReplayMember {
  species: string;            // "Garchomp", "Tornadus-Therian"
  nick?: string;              // alias
  level?: number;
  gender?: 'M' | 'F';
  shiny?: boolean;
  hpRemaining: number;        // 0-100, 100 al inicio
  fainted: boolean;
  teraType?: string;
  movesUsed: Record<string, number>; // counts
}

export interface ReplayEvent {
  turn: number;
  kind:
    | 'move'
    | 'switch'
    | 'faint'
    | 'tera'
    | 'mega'
    | 'crit'
    | 'status'
    | 'weather'
    | 'win';
  actor?: string;       // pokémon nick or species
  target?: string;
  detail?: string;      // move name, status, etc.
}

export interface ReplayAnalysis {
  format: string | null;
  players: [ReplayPlayer, ReplayPlayer];
  winner: string | null;
  turnCount: number;
  events: ReplayEvent[];
  kosByPlayer: { p1: number; p2: number };
  faintedFirst?: { player: 'p1' | 'p2'; pokemon: string; turn: number };
  mvpP1?: { species: string; kos: number };
  mvpP2?: { species: string; kos: number };
}

function stripBrackets(s: string): string {
  // "[from] move: Tailwind" → "move: Tailwind"
  return s.replace(/^\[.*?\]\s*/, '').trim();
}

function parseNick(raw: string): { slot: 'p1' | 'p2'; nick: string } | null {
  // Formato: "p1a: Garchomp" o "p2b: Pikachu"
  const m = raw.match(/^(p[12])[a-z]?:\s*(.+)$/);
  if (!m) return null;
  return { slot: m[1] as 'p1' | 'p2', nick: m[2].trim() };
}

function parseDetails(raw: string): {
  species: string;
  level?: number;
  gender?: 'M' | 'F';
  shiny?: boolean;
} {
  // "Garchomp, L50, M, shiny"
  const parts = raw.split(',').map((s) => s.trim());
  const result: {
    species: string;
    level?: number;
    gender?: 'M' | 'F';
    shiny?: boolean;
  } = { species: parts[0] };
  for (const p of parts.slice(1)) {
    if (/^L\d+$/.test(p)) result.level = parseInt(p.slice(1));
    else if (p === 'M' || p === 'F') result.gender = p;
    else if (p === 'shiny') result.shiny = true;
  }
  return result;
}

function parseHpFraction(hpRaw: string): number {
  // "150/200" or "0 fnt" or "75/100 brn" → 0-100
  const m = hpRaw.match(/^(\d+)\/(\d+)/);
  if (!m) return 0;
  const cur = parseInt(m[1]);
  const max = parseInt(m[2]);
  if (max === 0) return 0;
  return Math.round((cur / max) * 100);
}

export function parseReplay(log: string): ReplayAnalysis {
  const lines = log.split('\n');
  const players: Record<'p1' | 'p2', ReplayPlayer> = {
    p1: { slot: 'p1', name: 'Player 1', team: [] },
    p2: { slot: 'p2', name: 'Player 2', team: [] },
  };
  // species activos actualmente por slot (para mapear nicks → species)
  const activeBySlot: Record<'p1' | 'p2', string | null> = { p1: null, p2: null };
  // mapa nick → species canónica (para tracking de KOs)
  const speciesByNick: Record<string, string> = {};

  let format: string | null = null;
  let winner: string | null = null;
  let turn = 0;
  let events: ReplayEvent[] = [];
  let faintedFirst: ReplayAnalysis['faintedFirst'] = undefined;
  const kosByPlayer = { p1: 0, p2: 0 };

  // Tracking de KO: para creditar un KO al *atacante*, necesitamos recordar
  // el último |move| antes de cada |faint|.
  let lastAttacker: { slot: 'p1' | 'p2'; species: string } | null = null;

  for (const rawLine of lines) {
    if (!rawLine.startsWith('|')) continue;
    const parts = rawLine.split('|').slice(1); // primer split sale vacío
    const kind = parts[0];

    switch (kind) {
      case 'tier':
      case 'gametype':
      case 'gen':
        if (kind === 'tier') format = parts[1] ?? null;
        break;

      case 'player': {
        // |player|p1|Username|avatar|rating
        const slot = parts[1] as 'p1' | 'p2';
        if (slot === 'p1' || slot === 'p2') {
          players[slot].name = parts[2] || players[slot].name;
          if (parts[4]) players[slot].rating = parseInt(parts[4]) || undefined;
        }
        break;
      }

      case 'poke': {
        // |poke|p1|Garchomp, L50, M|item
        const slot = parts[1] as 'p1' | 'p2';
        if (slot !== 'p1' && slot !== 'p2') break;
        const details = parseDetails(parts[2] ?? '');
        players[slot].team.push({
          species: details.species,
          level: details.level,
          gender: details.gender,
          shiny: details.shiny,
          hpRemaining: 100,
          fainted: false,
          movesUsed: {},
        });
        break;
      }

      case 'turn':
        turn = parseInt(parts[1]) || turn;
        break;

      case 'switch':
      case 'drag': {
        // |switch|p1a: Garchomp|Garchomp, L50, M|150/200
        const ident = parseNick(parts[1] ?? '');
        if (!ident) break;
        const details = parseDetails(parts[2] ?? '');
        speciesByNick[ident.nick] = details.species;
        activeBySlot[ident.slot] = details.species;
        events.push({
          turn,
          kind: 'switch',
          actor: details.species,
          detail: ident.slot,
        });
        break;
      }

      case 'move': {
        // |move|p1a: Garchomp|Earthquake|p2a: Tornadus
        const actorIdent = parseNick(parts[1] ?? '');
        const moveName = parts[2] ?? '';
        if (!actorIdent) break;
        const species =
          speciesByNick[actorIdent.nick] ??
          activeBySlot[actorIdent.slot] ??
          actorIdent.nick;
        lastAttacker = { slot: actorIdent.slot, species };
        // Track move usage
        const member = players[actorIdent.slot].team.find(
          (m) => m.species === species
        );
        if (member) {
          member.movesUsed[moveName] = (member.movesUsed[moveName] ?? 0) + 1;
        }
        events.push({ turn, kind: 'move', actor: species, detail: moveName });
        break;
      }

      case '-terastallize': {
        const actorIdent = parseNick(parts[1] ?? '');
        const teraType = parts[2] ?? '';
        if (!actorIdent) break;
        const species =
          speciesByNick[actorIdent.nick] ?? activeBySlot[actorIdent.slot];
        if (!species) break;
        const member = players[actorIdent.slot].team.find(
          (m) => m.species === species
        );
        if (member) member.teraType = teraType;
        events.push({ turn, kind: 'tera', actor: species, detail: teraType });
        break;
      }

      case 'faint': {
        const ident = parseNick(parts[1] ?? '');
        if (!ident) break;
        const species = speciesByNick[ident.nick] ?? ident.nick;
        const member = players[ident.slot].team.find(
          (m) => m.species === species
        );
        if (member) {
          member.fainted = true;
          member.hpRemaining = 0;
        }
        // Acreditar KO al último atacante del slot opuesto
        if (lastAttacker && lastAttacker.slot !== ident.slot) {
          kosByPlayer[lastAttacker.slot] += 1;
        }
        if (!faintedFirst) {
          faintedFirst = { player: ident.slot, pokemon: species, turn };
        }
        events.push({ turn, kind: 'faint', actor: species, detail: ident.slot });
        break;
      }

      case '-crit':
        events.push({ turn, kind: 'crit' });
        break;

      case '-status': {
        const ident = parseNick(parts[1] ?? '');
        const status = parts[2] ?? '';
        if (!ident) break;
        const species = speciesByNick[ident.nick] ?? ident.nick;
        events.push({
          turn,
          kind: 'status',
          actor: species,
          detail: stripBrackets(status),
        });
        break;
      }

      case '-weather': {
        if (parts[1] && parts[1] !== 'none') {
          events.push({ turn, kind: 'weather', detail: parts[1] });
        }
        break;
      }

      case 'win': {
        winner = parts[1] ?? null;
        events.push({ turn, kind: 'win', actor: winner ?? undefined });
        break;
      }
    }
  }

  // MVPs por jugador — el Pokémon con más KOs propios (heurística:
  // último atacante registrado por species tiene mayor uso de moves).
  // Como track exacto de KOs por species es no-trivial sin más bookkeeping,
  // aproximamos con "más moves usados" entre los miembros vivos al final.
  const mvpFor = (slot: 'p1' | 'p2'): { species: string; kos: number } | undefined => {
    const team = players[slot].team;
    if (team.length === 0) return undefined;
    let best: ReplayMember | null = null;
    let bestUsage = -1;
    for (const m of team) {
      const usage = Object.values(m.movesUsed).reduce((a, b) => a + b, 0);
      if (usage > bestUsage) {
        best = m;
        bestUsage = usage;
      }
    }
    if (!best) return undefined;
    return { species: best.species, kos: bestUsage };
  };

  return {
    format,
    players: [players.p1, players.p2],
    winner,
    turnCount: turn,
    events,
    kosByPlayer,
    faintedFirst,
    mvpP1: mvpFor('p1'),
    mvpP2: mvpFor('p2'),
  };
}
