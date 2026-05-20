// Synergy Analyzer.
//
// Dado dos Pokémon (A y B), calcula un score 0-100 de "qué tan bien
// funcionan juntos" en función de:
//
//   1. Coverage ofensiva complementaria: si los tipos de A cubren los
//      Pokémon que resisten a B (y viceversa), score sube.
//   2. Coverage defensiva: si A resiste lo que B teme y viceversa,
//      score sube. Pares defensive complementarios = top.
//   3. Stat distribution: si A es físico y B especial (o viceversa),
//      es un mixed attacker combo — bonus.
//   4. Speed split: uno rápido + uno lento = options vs cualquier
//      speed tier rival.

import { ALL_TYPES, TYPE_CHART } from '@/lib/type-effectiveness';
import type { PokemonType, PokemonDetail } from '@/types/pokemon';

export interface SynergyResult {
  score: number;          // 0-100
  defensiveBonus: number; // 0-30
  offensiveBonus: number; // 0-30
  statBonus: number;      // 0-20
  speedBonus: number;     // 0-20
  /** Tipos de los que A protege a B (resiste lo que B teme) */
  aCoversForB: PokemonType[];
  /** Tipos de los que B protege a A */
  bCoversForA: PokemonType[];
  /** Tipos que A puede pegar SE que B no puede */
  aHitsForB: PokemonType[];
  /** Inverso */
  bHitsForA: PokemonType[];
  /** Resumen legible */
  verdict: 'S' | 'A' | 'B' | 'C' | 'D';
  verdictText: string;
}

function defensiveMult(atk: PokemonType, def: PokemonType[]): number {
  let m = 1;
  for (const d of def) {
    const x = TYPE_CHART[atk][d];
    if (x !== undefined) m *= x;
  }
  return m;
}

function weakTypes(types: PokemonType[]): PokemonType[] {
  return ALL_TYPES.filter((atk) => defensiveMult(atk, types) >= 2);
}

function canHitSuperEffective(
  attackerTypes: PokemonType[],
  defenderTypes: PokemonType[]
): boolean {
  for (const atk of attackerTypes) {
    if (defensiveMult(atk, defenderTypes) >= 2) return true;
  }
  return false;
}

export function analyzeSynergy(a: PokemonDetail, b: PokemonDetail): SynergyResult {
  const aWeaks = weakTypes(a.types);
  const bWeaks = weakTypes(b.types);

  // Defensive: ¿A resiste (× < 1) lo que B teme?
  const aCoversForB = bWeaks.filter((t) => defensiveMult(t, a.types) < 1);
  const bCoversForA = aWeaks.filter((t) => defensiveMult(t, b.types) < 1);
  const defensiveBonus = Math.min(
    30,
    aCoversForB.length * 4 + bCoversForA.length * 4
  );

  // Offensive: tipos contra los que A pega SE y B no (cobertura unique de A)
  const aHitsForB: PokemonType[] = [];
  const bHitsForA: PokemonType[] = [];
  for (const t of ALL_TYPES) {
    const defAsType: PokemonType[] = [t];
    const aHits = canHitSuperEffective(a.types, defAsType);
    const bHits = canHitSuperEffective(b.types, defAsType);
    if (aHits && !bHits) aHitsForB.push(t);
    if (bHits && !aHits) bHitsForA.push(t);
  }
  const offensiveBonus = Math.min(
    30,
    (aHitsForB.length + bHitsForA.length) * 2
  );

  // Stat: mixed attacker combo
  const aPhys = a.stats.attack > a.stats.specialAttack;
  const bPhys = b.stats.attack > b.stats.specialAttack;
  const statBonus = aPhys !== bPhys ? 15 : 5;

  // Speed: uno rápido + uno lento (split entre tier)
  const aFast = a.stats.speed >= 90;
  const bFast = b.stats.speed >= 90;
  const speedBonus = aFast !== bFast ? 15 : aFast && bFast ? 10 : 5;

  const score = Math.min(100, defensiveBonus + offensiveBonus + statBonus + speedBonus);

  let verdict: SynergyResult['verdict'];
  let verdictText: string;
  if (score >= 80) {
    verdict = 'S';
    verdictText = 'Sinergia brutal. Pareja meta-tier.';
  } else if (score >= 65) {
    verdict = 'A';
    verdictText = 'Sinergia muy buena. Cubren bien sus debilidades.';
  } else if (score >= 50) {
    verdict = 'B';
    verdictText = 'Sinergia decente. Funcionales pero con holes.';
  } else if (score >= 35) {
    verdict = 'C';
    verdictText = 'Sinergia floja. Comparten debilidades.';
  } else {
    verdict = 'D';
    verdictText = 'Mala combinación. Considera reemplazar uno.';
  }

  return {
    score,
    defensiveBonus,
    offensiveBonus,
    statBonus,
    speedBonus,
    aCoversForB,
    bCoversForA,
    aHitsForB,
    bHitsForA,
    verdict,
    verdictText,
  };
}
