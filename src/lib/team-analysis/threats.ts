import { TYPE_CHART } from '@/lib/type-effectiveness';
import type { PokemonType, PokemonStats } from '@/types/pokemon';

export interface MetaThreat {
  name: string;
  speciesId: number;
  types: PokemonType[];
  usagePct: number;
}

export interface TeamMemberLite {
  pokemonId: number;
  name: string;
  types: PokemonType[];
  stats?: PokemonStats;
}

export interface MemberMatchup {
  pokemonId: number;
  name: string;
  /** Worst incoming multiplier from threat's STABs vs this member's typing */
  incoming: number;
  /** Best outgoing multiplier from this member's STABs vs threat's typing */
  outgoing: number;
}

export interface ThreatAnalysis {
  threat: MetaThreat;
  matchups: MemberMatchup[];
  /** Number of team members weak (≥ 2×) to any of the threat's STABs */
  weakCount: number;
  /** Members that can hit threat super-effectively */
  hitBackCount: number;
  /** Members fully immune to all threat STABs */
  immuneCount: number;
  /** Composite threat score — higher = more dangerous to this team */
  threatScore: number;
  /** Best counter from the team (highest outgoing × lowest incoming heuristic) */
  bestCounter: MemberMatchup | null;
}

function multiplier(attackType: PokemonType, defenderTypes: PokemonType[]): number {
  let m = 1;
  for (const def of defenderTypes) {
    const x = TYPE_CHART[attackType][def];
    if (x !== undefined) m *= x;
  }
  return m;
}

function bestMultiplier(
  attackerTypes: PokemonType[],
  defenderTypes: PokemonType[]
): number {
  let best = 0;
  for (const atk of attackerTypes) {
    const m = multiplier(atk, defenderTypes);
    if (m > best) best = m;
  }
  return best;
}

export function analyzeThreats(
  team: TeamMemberLite[],
  meta: MetaThreat[]
): ThreatAnalysis[] {
  return meta
    .map((threat) => {
      const matchups: MemberMatchup[] = team.map((m) => ({
        pokemonId: m.pokemonId,
        name: m.name,
        incoming: bestMultiplier(threat.types, m.types),
        outgoing: bestMultiplier(m.types, threat.types),
      }));

      const weakCount = matchups.filter((m) => m.incoming >= 2).length;
      const hitBackCount = matchups.filter((m) => m.outgoing >= 2).length;
      const immuneCount = matchups.filter((m) => m.incoming === 0).length;

      // Score: high weakness + low hit-back + popular meta = scarier
      const usageWeight = Math.log10(1 + threat.usagePct);
      const threatScore =
        (weakCount * 1.5 - hitBackCount + (team.length - immuneCount) * 0.2) *
        (0.6 + usageWeight);

      // Best counter: highest outgoing, tie-broken by lowest incoming
      const bestCounter =
        matchups
          .filter((m) => m.outgoing >= 1 && m.incoming < 2)
          .sort((a, b) =>
            b.outgoing - a.outgoing !== 0
              ? b.outgoing - a.outgoing
              : a.incoming - b.incoming
          )[0] ?? null;

      return {
        threat,
        matchups,
        weakCount,
        hitBackCount,
        immuneCount,
        threatScore,
        bestCounter,
      };
    })
    .sort((a, b) => b.threatScore - a.threatScore);
}

/** Threat tier classification for UI badge */
export function threatTier(t: ThreatAnalysis): 'red' | 'yellow' | 'green' {
  if (t.weakCount >= 3 && t.hitBackCount === 0) return 'red';
  if (t.weakCount >= 2 || t.hitBackCount === 0) return 'yellow';
  return 'green';
}
