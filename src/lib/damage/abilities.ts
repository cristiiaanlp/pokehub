import type { AbilityId } from './formula';
import type { PokemonType } from '@/types/pokemon';

interface AbilityMod {
  /** Multiplies the attacker's raw Atk/SpA stat (before stages applied later). */
  attackerStatMult?: number;
  /** Flat damage multiplier (applied to all moves) */
  damageMult?: number;
  /** Per-tag damage multipliers (punch, bite, pulse, sound, contact, ...) */
  byTag?: Partial<
    Record<'punch' | 'bite' | 'pulse' | 'sound' | 'contact' | 'recoil' | 'priority' | 'multi-hit', number>
  >;
  /** Per-move-type multiplier (e.g. Strong Jaw → bite already covered, but for type-only abilities) */
  byMoveType?: Partial<Record<PokemonType, number>>;
  /** Special: max BP for Technician bonus */
  technicianMaxBp?: number;

  // Defender side
  damageReceivedMult?: number;
  receivedByMoveType?: Partial<Record<PokemonType, number>>;
  multiscale?: boolean;
}

export const ABILITY_MODIFIERS: Record<AbilityId, AbilityMod | undefined> = {
  'none': undefined,
  // ─── Offensive ──────────────────────────────────────────────────────
  'huge-power':    { attackerStatMult: 2 },
  'pure-power':    { attackerStatMult: 2 },
  'adaptability':  undefined, // handled in formula (STAB 2.0)
  'technician':    { technicianMaxBp: 60 },
  'iron-fist':     { byTag: { punch: 1.2 } },
  'strong-jaw':    { byTag: { bite: 1.5 } },
  'tough-claws':   { byTag: { contact: 1.3 } },
  'mega-launcher': { byTag: { pulse: 1.5 } },
  'tinted-lens':   undefined, // handled in formula
  'sheer-force':   { damageMult: 1.3 }, // best-effort approx
  'water-bubble':  { byMoveType: { water: 2 } },
  'flash-fire':    undefined, // defensive immunity; we model as flat 0 if firetype
  // ─── Defensive ─────────────────────────────────────────────────────
  'filter':        undefined, // handled in formula on SE
  'solid-rock':    undefined,
  'multiscale':    { multiscale: true },
  'thick-fat':     { receivedByMoveType: { fire: 0.5, ice: 0.5 } },
  'fluffy':        { receivedByMoveType: { fire: 2 } }, // also halves contact, simplified
  'heatproof':     { receivedByMoveType: { fire: 0.5 } },
  'rough-skin':    undefined,
  'levitate':      undefined,
};

export const ABILITY_LABELS: Record<AbilityId, string> = {
  'none': 'Sin habilidad activa',
  'huge-power': 'Huge Power (×2 Atk)',
  'pure-power': 'Pure Power (×2 Atk)',
  'adaptability': 'Adaptability (STAB 2.0)',
  'technician': 'Technician (×1.5 si BP ≤ 60)',
  'iron-fist': 'Iron Fist (×1.2 punch)',
  'strong-jaw': 'Strong Jaw (×1.5 bite)',
  'tough-claws': 'Tough Claws (×1.3 contact)',
  'mega-launcher': 'Mega Launcher (×1.5 pulse)',
  'tinted-lens': 'Tinted Lens (×2 NVE)',
  'sheer-force': 'Sheer Force (×1.3)',
  'water-bubble': 'Water Bubble (×2 agua atk)',
  'flash-fire': 'Flash Fire (inmune fuego)',
  'filter': 'Filter (–25% SE recibido)',
  'solid-rock': 'Solid Rock (–25% SE recibido)',
  'multiscale': 'Multiscale (–50% a HP llena)',
  'thick-fat': 'Thick Fat (–50% fuego/hielo)',
  'fluffy': 'Fluffy (×2 fuego recibido)',
  'heatproof': 'Heatproof (–50% fuego)',
  'rough-skin': 'Rough Skin',
  'levitate': 'Levitate (inmune Tierra)',
};
