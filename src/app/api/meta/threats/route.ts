// Returns the current top meta with types resolved, ready for client-side
// threat analysis. Cached 24h via Next data cache.

import { NextResponse } from 'next/server';
import { fetchLiveChampionsUsage } from '@/lib/champions/scraper';
import { getUsageStats } from '@/lib/meta/smogon';
import {
  resolveSmogonName,
  resolveSmogonNameAsync,
} from '@/lib/meta/name-resolver';
import { CHAMPIONS_TOP_USAGE } from '@/lib/champions/data';
import type { PokemonType } from '@/types/pokemon';
import type { MetaThreat } from '@/lib/team-analysis/threats';

export const revalidate = 86400;
export const runtime = 'nodejs';

interface RawEntry {
  name: string;
  usagePct: number;
}

async function fetchTypes(speciesId: number): Promise<PokemonType[]> {
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${speciesId}`,
      { next: { revalidate: 60 * 60 * 24 * 7 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.types as any[])
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name as PokemonType);
  } catch {
    return [];
  }
}

async function rawForFormat(format: string): Promise<{
  entries: RawEntry[];
  source: string;
  dataDate: string;
} | null> {
  if (format === 'championspreview' || format === 'reg-ma') {
    const live = await fetchLiveChampionsUsage('championspreview', 20);
    if (live && live.entries.length >= 5) {
      return {
        entries: live.entries.map((e) => ({ name: e.name, usagePct: e.usagePct })),
        source: 'pikalytics',
        dataDate: live.fetchedAt.slice(0, 10),
      };
    }
    // Fallback to curated champions snapshot
    return {
      entries: CHAMPIONS_TOP_USAGE.map((e) => ({
        name: e.name,
        usagePct: e.usagePct,
      })),
      source: 'curated-may-2026',
      dataDate: '2026-05',
    };
  }

  // SV OU / VGC etc. via Smogon stats
  const stats = await getUsageStats(format, 1500);
  if (!stats) return null;
  return {
    entries: stats.entries.slice(0, 20).map((e) => ({
      name: e.name,
      usagePct: e.usagePct,
    })),
    source: 'smogon',
    dataDate: stats.month,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const format = url.searchParams.get('format') ?? 'championspreview';

  const raw = await rawForFormat(format);
  if (!raw) {
    return NextResponse.json(
      { error: 'no_data', format },
      { status: 503 }
    );
  }

  const resolved = await Promise.all(
    raw.entries.map(async (e) => {
      const id =
        resolveSmogonName(e.name) ?? (await resolveSmogonNameAsync(e.name));
      if (!id) return null;
      const types = await fetchTypes(id);
      if (types.length === 0) return null;
      const threat: MetaThreat = {
        name: e.name,
        speciesId: id,
        types,
        usagePct: e.usagePct,
      };
      return threat;
    })
  );

  const entries = resolved.filter((x): x is MetaThreat => x !== null);

  return NextResponse.json({
    format,
    source: raw.source,
    dataDate: raw.dataDate,
    fetchedAt: new Date().toISOString(),
    entries,
  });
}
