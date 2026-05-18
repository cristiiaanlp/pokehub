import { resolveSmogonNameAsync } from '@/lib/meta/name-resolver';
import { liveTeamToSampleTeam } from './adapter';
import type { LiveMember } from './aggregate';
import type { PikalyticsPokemonData } from './parser';
import type { SampleTeam, SampleTeamMember } from '@/lib/champions/data';

export interface EnrichedTeammate {
  name: string;
  usagePct: number;
  speciesId: number | null;
}

export interface EnrichedPikalyticsData {
  pokemon: string;
  format: string;
  dataDate: string;
  moves: { name: string; usagePct: number }[];
  abilities: { name: string; usagePct: number }[];
  items: { name: string; usagePct: number }[];
  teammates: EnrichedTeammate[];
  teams: SampleTeam[];
}

// Resolve every name surfaced by Pikalytics so client components don't need to.
// Runs server-side; PokéAPI lookups cache for 7 days via Next data cache.
export async function enrichPikalyticsData(
  raw: PikalyticsPokemonData
): Promise<EnrichedPikalyticsData> {
  const [teammateIds, teamMemberLists] = await Promise.all([
    Promise.all(raw.teammates.map((t) => resolveSmogonNameAsync(t.name))),
    Promise.all(
      raw.featuredTeams.map((t) =>
        Promise.all(t.members.map((n) => resolveSmogonNameAsync(n)))
      )
    ),
  ]);

  const teammates: EnrichedTeammate[] = raw.teammates.map((t, i) => ({
    name: t.name,
    usagePct: t.usagePct,
    speciesId: teammateIds[i] ?? null,
  }));

  const teams: SampleTeam[] = raw.featuredTeams.slice(0, 8).map((t, i) => {
    const memberObjs: LiveMember[] = t.members.map((name, j) => ({
      name,
      speciesId: teamMemberLists[i]?.[j] ?? null,
    }));
    const liveTeam = liveTeamToSampleTeam(
      {
        id: `${raw.pokemon}-${i}`,
        author: t.author,
        record: t.record,
        members: memberObjs,
        pivotPokemon: raw.pokemon,
        recordWins: Number(t.record.match(/^(\d+)/)?.[1] ?? 0),
      },
      t.focusSet
    );
    // Mark focus member's speciesId explicitly (already handled in adapter)
    void liveTeam;
    return liveTeam;
  });

  return {
    pokemon: raw.pokemon,
    format: raw.format,
    dataDate: raw.dataDate,
    moves: raw.moves,
    abilities: raw.abilities,
    items: raw.items,
    teammates,
    teams,
  };
}

// Lightweight version: just the SampleTeamMember[] mapping used elsewhere
export async function enrichMembers(
  names: string[]
): Promise<SampleTeamMember[]> {
  const ids = await Promise.all(names.map((n) => resolveSmogonNameAsync(n)));
  return names.map((name, i) => ({ name, speciesId: ids[i] ?? null, moves: [] }));
}
