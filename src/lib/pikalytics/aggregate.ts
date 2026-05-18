import { fetchMany, type PikalyticsFormat } from './client';
import { resolveSmogonNameAsync } from '@/lib/meta/name-resolver';

export interface LiveMember {
  name: string;
  speciesId: number | null;
}

export interface LiveTeamEntry {
  id: string; // dedupe key
  author: string;
  record: string;
  members: LiveMember[]; // 6, with pre-resolved species IDs
  pivotPokemon: string;
  recordWins: number;
}

export interface LiveCommonPokemon {
  name: string;
  appearances: number; // how many top-N Pokémon pages list it as a teammate
  avgTeammatePct: number; // mean of usage % when it was listed as a teammate
  speciesId: number | null;
}

export interface LiveChampionsMeta {
  format: PikalyticsFormat;
  fetchedAt: string; // ISO
  sourceCount: number; // how many top Pokémon pages we aggregated from
  topTeams: LiveTeamEntry[];
  topTeammates: LiveCommonPokemon[];
  dataDate: string; // pikalytics' "Data Date"
}

function teamKey(members: string[]): string {
  return [...members].map((m) => m.toLowerCase()).sort().join('|');
}

async function resolveMembers(names: string[]): Promise<LiveMember[]> {
  const ids = await Promise.all(names.map((n) => resolveSmogonNameAsync(n)));
  return names.map((name, i) => ({ name, speciesId: ids[i] ?? null }));
}

function parseRecordWins(rec: string): number {
  const m = rec.match(/^\s*(\d+)/);
  return m ? Number(m[1]) : 0;
}

// Aggregates live data by fetching the top N Pokémon's individual pages
// and deduplicating teams across all of them.
export async function getLiveChampionsMeta(opts: {
  format: PikalyticsFormat;
  pivotPokemon: string[]; // e.g. top 6-10 by usage
  maxTeams?: number;
}): Promise<LiveChampionsMeta | null> {
  const results = await fetchMany(opts.format, opts.pivotPokemon);
  const ok = results.filter((r): r is NonNullable<typeof r> => r !== null);
  if (ok.length === 0) return null;

  // Aggregate teams (keep members as strings during dedupe — resolve IDs afterwards)
  interface RawTeam {
    id: string;
    author: string;
    record: string;
    members: string[];
    pivotPokemon: string;
    recordWins: number;
  }
  const teamMap = new Map<string, RawTeam>();
  for (let i = 0; i < ok.length; i++) {
    const r = ok[i];
    const pivot = opts.pivotPokemon[results.indexOf(r)] ?? r.pokemon;
    for (const t of r.featuredTeams) {
      if (t.members.length < 6) continue;
      const k = teamKey(t.members);
      const wins = parseRecordWins(t.record);
      const existing = teamMap.get(k);
      if (!existing || wins > existing.recordWins) {
        teamMap.set(k, {
          id: k,
          author: t.author,
          record: t.record,
          members: t.members,
          pivotPokemon: pivot,
          recordWins: wins,
        });
      }
    }
  }
  const limit = opts.maxTeams ?? 12;
  const rawTop = Array.from(teamMap.values())
    .sort((a, b) => b.recordWins - a.recordWins)
    .slice(0, limit);
  // Resolve member IDs only for the teams we'll actually show (bounded fetches)
  const topTeams: LiveTeamEntry[] = await Promise.all(
    rawTop.map(async (rt) => ({
      id: rt.id,
      author: rt.author,
      record: rt.record,
      members: await resolveMembers(rt.members),
      pivotPokemon: rt.pivotPokemon,
      recordWins: rt.recordWins,
    }))
  );

  // Aggregate teammates: name → {count, sumPct}
  const teammateAgg = new Map<string, { count: number; sumPct: number }>();
  for (const r of ok) {
    for (const t of r.teammates) {
      const e = teammateAgg.get(t.name) ?? { count: 0, sumPct: 0 };
      e.count += 1;
      e.sumPct += t.usagePct;
      teammateAgg.set(t.name, e);
    }
  }
  const rawTeammates = Array.from(teammateAgg.entries())
    .map(([name, e]) => ({
      name,
      appearances: e.count,
      avgTeammatePct: e.sumPct / e.count,
    }))
    .sort(
      (a, b) =>
        b.appearances - a.appearances ||
        b.avgTeammatePct - a.avgTeammatePct
    )
    .slice(0, 15);
  const teammateIds = await Promise.all(
    rawTeammates.map((t) => resolveSmogonNameAsync(t.name))
  );
  const topTeammates: LiveCommonPokemon[] = rawTeammates.map((t, i) => ({
    ...t,
    speciesId: teammateIds[i] ?? null,
  }));

  return {
    format: opts.format,
    fetchedAt: new Date().toISOString(),
    sourceCount: ok.length,
    dataDate: ok[0]?.dataDate ?? '',
    topTeams,
    topTeammates,
  };
}
