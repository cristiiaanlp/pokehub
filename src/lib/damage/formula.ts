// Pokémon damage calculator — Gen 9 formula
// Reference: Bulbapedia Damage formula, @smogon/calc source.
// Covers the 90% of competitive scenarios. Doesn't model:
//   - multi-hit moves (Bullet Seed etc) — UI shows single-hit damage
//   - moves with custom damage formulas (Seismic Toss, Night Shade, Endeavor)
//   - Z-moves / Max moves / Tera Blast type change
//
// For the missing 10%, users can override base power manually.

import type { PokemonType } from '@/types/pokemon';
import { TYPE_CHART } from '@/lib/type-effectiveness';
import { POKEMON_NATURES } from './stats';

export type Category = 'physical' | 'special' | 'status';

export interface MoveData {
  name: string;
  type: PokemonType;
  category: Category;
  basePower: number;
  priority?: number;
  accuracy?: number;
  /** Tags drive ability bonuses (Iron Fist → punch, Strong Jaw → bite, etc.) */
  tags?: Array<
    | 'punch'
    | 'bite'
    | 'pulse'
    | 'sound'
    | 'contact'
    | 'recoil'
    | 'priority'
    | 'multi-hit'
  >;
}

export interface BattlerInput {
  /** Base stats (HP, Atk, Def, SpA, SpD, Spe) */
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  types: PokemonType[];
  level: number;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number };
  ivs?: number; // 0-31 default 31
  nature: string; // key into POKEMON_NATURES
  item?: ItemId;
  ability?: AbilityId;
  /** Stage boost on the relevant offensive/defensive stat (-6 to +6). */
  attackStage?: number;
  defenseStage?: number;
  /** % HP remaining (0-100). Affects abilities like Multiscale. */
  currentHpPct?: number;
}

export interface FieldInput {
  weather: 'none' | 'sun' | 'rain' | 'sand' | 'snow';
  terrain: 'none' | 'electric' | 'grassy' | 'misty' | 'psychic';
  /** Defender side has Reflect / Light Screen / Aurora Veil */
  reflect?: boolean;
  lightScreen?: boolean;
  auroraVeil?: boolean;
  critical?: boolean;
  /** Attacker is using a Z-move / Max move / Tera (super basic: just flag) */
  isCriticalProtected?: boolean;
}

export type ItemId =
  | 'none'
  | 'life-orb'
  | 'choice-band'
  | 'choice-specs'
  | 'expert-belt'
  | 'muscle-band'
  | 'wise-glasses'
  | 'charcoal'
  | 'mystic-water'
  | 'miracle-seed'
  | 'magnet'
  | 'never-melt-ice'
  | 'black-belt'
  | 'poison-barb'
  | 'soft-sand'
  | 'sharp-beak'
  | 'twisted-spoon'
  | 'silver-powder'
  | 'hard-stone'
  | 'spell-tag'
  | 'dragon-fang'
  | 'black-glasses'
  | 'metal-coat'
  | 'pixie-plate'
  | 'silk-scarf'
  | 'leftovers'
  | 'assault-vest';

export type AbilityId =
  | 'none'
  | 'huge-power'
  | 'pure-power'
  | 'adaptability'
  | 'technician'
  | 'iron-fist'
  | 'strong-jaw'
  | 'tough-claws'
  | 'mega-launcher'
  | 'tinted-lens'
  | 'filter'
  | 'solid-rock'
  | 'multiscale'
  | 'thick-fat'
  | 'fluffy'
  | 'heatproof'
  | 'water-bubble'
  | 'flash-fire'
  | 'sheer-force'
  | 'rough-skin'
  | 'levitate';

import { ITEM_MODIFIERS } from './items';
import { ABILITY_MODIFIERS } from './abilities';

function computeStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  natureMult: number
): number {
  return Math.floor(
    (Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMult
  );
}

function computeHp(base: number, iv: number, ev: number, level: number): number {
  if (base === 1) return 1; // Shedinja
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

const STAGE_MULT: Record<number, number> = {
  '-6': 2 / 8,
  '-5': 2 / 7,
  '-4': 2 / 6,
  '-3': 2 / 5,
  '-2': 2 / 4,
  '-1': 2 / 3,
  '0': 1,
  '1': 1.5,
  '2': 2,
  '3': 2.5,
  '4': 3,
  '5': 3.5,
  '6': 4,
};

export interface DamageResult {
  rolls: number[]; // 16 damage rolls (lowest to highest)
  minDamage: number;
  maxDamage: number;
  minPct: number;
  maxPct: number;
  defenderHp: number;
  /** % chance the move OHKOs (assuming uniform distribution of the 16 rolls). */
  ohkoPct: number;
  /** Number of hits to KO with worst-case rolls (used for "2HKO" labels). */
  worstHitsToKo: number;
  bestHitsToKo: number;
  category: Category;
  attackStat: number;
  defenseStat: number;
  modifierBreakdown: { label: string; mult: number }[];
}

export function calculateDamage(
  attacker: BattlerInput,
  defender: BattlerInput,
  move: MoveData,
  field: FieldInput
): DamageResult | null {
  if (move.category === 'status' || move.basePower <= 0) return null;

  const atkNature = POKEMON_NATURES[attacker.nature] ?? POKEMON_NATURES.neutral;
  const defNature = POKEMON_NATURES[defender.nature] ?? POKEMON_NATURES.neutral;

  // Stats (HP for defender, offensive/defensive for the relevant category)
  const defHp = computeHp(defender.baseStats.hp, defender.ivs ?? 31, defender.evs.hp, defender.level);

  const offBase =
    move.category === 'physical' ? attacker.baseStats.atk : attacker.baseStats.spa;
  const offEv =
    move.category === 'physical' ? attacker.evs.atk : attacker.evs.spa;
  const offNatureMult =
    move.category === 'physical' ? atkNature.atk : atkNature.spa;

  const defBase =
    move.category === 'physical' ? defender.baseStats.def : defender.baseStats.spd;
  const defEv =
    move.category === 'physical' ? defender.evs.def : defender.evs.spd;
  const defNatureMult =
    move.category === 'physical' ? defNature.def : defNature.spd;

  let attackStat = computeStat(offBase, attacker.ivs ?? 31, offEv, attacker.level, offNatureMult);
  let defenseStat = computeStat(defBase, defender.ivs ?? 31, defEv, defender.level, defNatureMult);

  // Stages
  const atkStage = attacker.attackStage ?? 0;
  const defStage = defender.defenseStage ?? 0;
  attackStat = Math.floor(attackStat * (STAGE_MULT[atkStage] ?? 1));
  defenseStat = Math.floor(defenseStat * (STAGE_MULT[defStage] ?? 1));

  // Ability adjustments to raw stats (Huge Power etc.)
  const atkMods = ABILITY_MODIFIERS[attacker.ability ?? 'none'];
  if (atkMods?.attackerStatMult) attackStat = Math.floor(attackStat * atkMods.attackerStatMult);
  const defMods = ABILITY_MODIFIERS[defender.ability ?? 'none'];

  // Base damage
  const baseDamage = Math.floor(
    Math.floor(Math.floor(((2 * attacker.level) / 5 + 2) * move.basePower * attackStat) / defenseStat) /
      50
  ) + 2;

  const breakdown: { label: string; mult: number }[] = [];

  // ─── Modifiers ────────────────────────────────────────────────────────
  let mod = 1;

  // Weather
  if (field.weather === 'sun') {
    if (move.type === 'fire') {
      mod *= 1.5;
      breakdown.push({ label: 'Sol · fuego', mult: 1.5 });
    } else if (move.type === 'water') {
      mod *= 0.5;
      breakdown.push({ label: 'Sol · agua', mult: 0.5 });
    }
  } else if (field.weather === 'rain') {
    if (move.type === 'water') {
      mod *= 1.5;
      breakdown.push({ label: 'Lluvia · agua', mult: 1.5 });
    } else if (move.type === 'fire') {
      mod *= 0.5;
      breakdown.push({ label: 'Lluvia · fuego', mult: 0.5 });
    }
  } else if (field.weather === 'sand' && defender.types.includes('rock') && move.category === 'special') {
    // Sand boosts Rock-types' Sp. Def — applied as 0.66 effective damage
    mod *= 2 / 3;
    breakdown.push({ label: 'Sand SpD boost', mult: 2 / 3 });
  } else if (field.weather === 'snow' && defender.types.includes('ice') && move.category === 'physical') {
    mod *= 2 / 3;
    breakdown.push({ label: 'Snow Def boost', mult: 2 / 3 });
  }

  // Terrain (basic: damage boost / reduction on grounded user)
  if (field.terrain === 'electric' && move.type === 'electric') {
    mod *= 1.3;
    breakdown.push({ label: 'Electric Terrain', mult: 1.3 });
  } else if (field.terrain === 'grassy' && move.type === 'grass') {
    mod *= 1.3;
    breakdown.push({ label: 'Grassy Terrain', mult: 1.3 });
  } else if (field.terrain === 'psychic' && move.type === 'psychic') {
    mod *= 1.3;
    breakdown.push({ label: 'Psychic Terrain', mult: 1.3 });
  } else if (field.terrain === 'misty' && move.type === 'dragon') {
    mod *= 0.5;
    breakdown.push({ label: 'Misty Terrain', mult: 0.5 });
  }

  // Critical hit
  if (field.critical) {
    mod *= 1.5;
    breakdown.push({ label: 'Crítico', mult: 1.5 });
  }

  // STAB
  let stab = attacker.types.includes(move.type) ? 1.5 : 1;
  if (stab > 1 && attacker.ability === 'adaptability') {
    stab = 2;
    breakdown.push({ label: 'Adaptability STAB', mult: 2 });
  } else if (stab > 1) {
    breakdown.push({ label: 'STAB', mult: 1.5 });
  }
  mod *= stab;

  // Type effectiveness
  let effectiveness = 1;
  for (const def of defender.types) {
    const m = TYPE_CHART[move.type][def];
    if (m !== undefined) effectiveness *= m;
  }
  if (effectiveness === 0) {
    return {
      rolls: new Array(16).fill(0),
      minDamage: 0,
      maxDamage: 0,
      minPct: 0,
      maxPct: 0,
      defenderHp: defHp,
      ohkoPct: 0,
      worstHitsToKo: Infinity,
      bestHitsToKo: Infinity,
      category: move.category,
      attackStat,
      defenseStat,
      modifierBreakdown: [{ label: 'INMUNE', mult: 0 }],
    };
  }
  // Filter / Solid Rock
  if (effectiveness > 1 && (defender.ability === 'filter' || defender.ability === 'solid-rock')) {
    mod *= 0.75;
    breakdown.push({ label: defender.ability, mult: 0.75 });
  }
  // Tinted Lens
  if (effectiveness < 1 && attacker.ability === 'tinted-lens') {
    mod *= 2;
    breakdown.push({ label: 'Tinted Lens', mult: 2 });
  }
  mod *= effectiveness;
  breakdown.push({ label: `Tipo ${effectiveness}×`, mult: effectiveness });

  // Burn (physical only, no Guts)
  // We don't model status here; skipped.

  // Screens
  if (move.category === 'physical' && field.reflect && !field.critical) {
    mod *= 0.5;
    breakdown.push({ label: 'Reflect', mult: 0.5 });
  }
  if (move.category === 'special' && field.lightScreen && !field.critical) {
    mod *= 0.5;
    breakdown.push({ label: 'Light Screen', mult: 0.5 });
  }
  if (field.auroraVeil && !field.critical) {
    mod *= 0.5;
    breakdown.push({ label: 'Aurora Veil', mult: 0.5 });
  }

  // Items (attacker boost + type item)
  const item = ITEM_MODIFIERS[attacker.item ?? 'none'];
  if (item) {
    if (item.allMoves) {
      mod *= item.allMoves;
      breakdown.push({ label: attacker.item ?? '', mult: item.allMoves });
    }
    if (item.physicalOnly && move.category === 'physical') {
      mod *= item.physicalOnly;
      breakdown.push({ label: attacker.item ?? '', mult: item.physicalOnly });
    }
    if (item.specialOnly && move.category === 'special') {
      mod *= item.specialOnly;
      breakdown.push({ label: attacker.item ?? '', mult: item.specialOnly });
    }
    if (item.typeBoost && item.typeBoost.type === move.type) {
      mod *= item.typeBoost.mult;
      breakdown.push({ label: `${attacker.item} (boost ${move.type})`, mult: item.typeBoost.mult });
    }
    if (item.expertBeltOnSE && effectiveness >= 2) {
      mod *= item.expertBeltOnSE;
      breakdown.push({ label: 'Expert Belt SE', mult: item.expertBeltOnSE });
    }
  }

  // Attacker abilities — flat / conditional damage mods
  if (atkMods) {
    if (atkMods.damageMult) {
      mod *= atkMods.damageMult;
      breakdown.push({ label: attacker.ability ?? '', mult: atkMods.damageMult });
    }
    if (atkMods.byTag && move.tags) {
      for (const t of move.tags) {
        const m = atkMods.byTag[t];
        if (m) {
          mod *= m;
          breakdown.push({ label: `${attacker.ability} (${t})`, mult: m });
        }
      }
    }
    if (atkMods.byMoveType && atkMods.byMoveType[move.type]) {
      mod *= atkMods.byMoveType[move.type]!;
      breakdown.push({ label: `${attacker.ability} ${move.type}`, mult: atkMods.byMoveType[move.type]! });
    }
    if (atkMods.technicianMaxBp && move.basePower <= atkMods.technicianMaxBp) {
      mod *= 1.5;
      breakdown.push({ label: 'Technician', mult: 1.5 });
    }
  }

  // Defender abilities
  if (defMods) {
    if (defMods.damageReceivedMult) {
      mod *= defMods.damageReceivedMult;
      breakdown.push({ label: `${defender.ability} (recv)`, mult: defMods.damageReceivedMult });
    }
    if (defMods.receivedByMoveType && defMods.receivedByMoveType[move.type]) {
      mod *= defMods.receivedByMoveType[move.type]!;
      breakdown.push({
        label: `${defender.ability} vs ${move.type}`,
        mult: defMods.receivedByMoveType[move.type]!,
      });
    }
    if (
      defMods.multiscale &&
      (defender.currentHpPct ?? 100) >= 100
    ) {
      mod *= 0.5;
      breakdown.push({ label: 'Multiscale', mult: 0.5 });
    }
  }

  const modified = Math.floor(baseDamage * mod);

  // Random factor: 16 rolls from 85% to 100%
  const rolls = Array.from({ length: 16 }, (_, i) => Math.floor((modified * (85 + i)) / 100));

  const minDamage = rolls[0];
  const maxDamage = rolls[15];
  const minPct = (minDamage / defHp) * 100;
  const maxPct = (maxDamage / defHp) * 100;

  // OHKO chance: count rolls where damage >= defenderHp
  const ohkoRolls = rolls.filter((r) => r >= defHp).length;
  const ohkoPct = (ohkoRolls / 16) * 100;

  // Hits to KO (worst case = uses lowest roll, best = highest)
  const worstHitsToKo = minDamage === 0 ? Infinity : Math.ceil(defHp / minDamage);
  const bestHitsToKo = maxDamage === 0 ? Infinity : Math.ceil(defHp / maxDamage);

  return {
    rolls,
    minDamage,
    maxDamage,
    minPct,
    maxPct,
    defenderHp: defHp,
    ohkoPct,
    worstHitsToKo,
    bestHitsToKo,
    category: move.category,
    attackStat,
    defenseStat,
    modifierBreakdown: breakdown,
  };
}
