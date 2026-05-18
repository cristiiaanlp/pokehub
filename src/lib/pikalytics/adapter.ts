import type { SampleTeam, SampleTeamMember } from '@/lib/champions/data';
import type { LiveMember, LiveTeamEntry } from './aggregate';
import type { PikalyticsTeam } from './parser';

// Guess an archetype from team composition.
function guessArchetype(members: LiveMember[]): string {
  const set = new Set(members.map((m) => m.name.toLowerCase()));
  if (set.has('charizard') && (set.has('venusaur') || set.has('whimsicott')))
    return 'Sun Offense';
  if (set.has('pelipper') || (set.has('gyarados') && set.has('floette-eternal')))
    return 'Rain';
  if (set.has('tyranitar') && set.has('excadrill')) return 'Sand';
  if (set.has('farigiraf') && set.has('hatterene')) return 'Trick Room';
  if (set.has('incineroar') && set.has('whimsicott')) return 'Balance';
  if (members.some((m) => /sneasler|kingambit|garchomp/i.test(m.name)))
    return 'Hyper Offense';
  return 'Balance';
}

export function liveTeamToSampleTeam(
  t: LiveTeamEntry,
  pivotSet?: PikalyticsTeam['focusSet']
): SampleTeam {
  const members: SampleTeamMember[] = t.members.map((m) => {
    const isPivot =
      pivotSet &&
      m.name.toLowerCase().includes(t.pivotPokemon.toLowerCase());
    if (isPivot) {
      return {
        name: m.name,
        speciesId: m.speciesId,
        item: pivotSet!.item,
        ability: pivotSet!.ability,
        moves: pivotSet!.moves,
      };
    }
    return { name: m.name, speciesId: m.speciesId, moves: [] };
  });

  return {
    id: t.id,
    name: `${t.author}'s team (${t.record})`,
    author: t.author,
    tournament: 'Ranked ladder',
    format: 'reg-ma',
    game: 'champions',
    date: 'live',
    archetype: guessArchetype(t.members),
    description: `Centrado en ${t.pivotPokemon}. Record ${t.record}.`,
    members,
  };
}
