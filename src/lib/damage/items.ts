import type { ItemId } from './formula';
import type { PokemonType } from '@/types/pokemon';

interface ItemModifier {
  /** Multiplies all damaging moves */
  allMoves?: number;
  /** Multiplies only physical moves */
  physicalOnly?: number;
  /** Multiplies only special moves */
  specialOnly?: number;
  /** Multiplies if move matches type */
  typeBoost?: { type: PokemonType; mult: number };
  /** Multiplies on super-effective hits (Expert Belt) */
  expertBeltOnSE?: number;
}

export const ITEM_MODIFIERS: Record<ItemId, ItemModifier | undefined> = {
  'none': undefined,
  'life-orb': { allMoves: 1.3 },
  'choice-band': { physicalOnly: 1.5 },
  'choice-specs': { specialOnly: 1.5 },
  'expert-belt': { expertBeltOnSE: 1.2 },
  'muscle-band': { physicalOnly: 1.1 },
  'wise-glasses': { specialOnly: 1.1 },
  'leftovers': undefined,
  'assault-vest': undefined, // defensive only
  'silk-scarf': { typeBoost: { type: 'normal', mult: 1.2 } },
  'charcoal': { typeBoost: { type: 'fire', mult: 1.2 } },
  'mystic-water': { typeBoost: { type: 'water', mult: 1.2 } },
  'magnet': { typeBoost: { type: 'electric', mult: 1.2 } },
  'miracle-seed': { typeBoost: { type: 'grass', mult: 1.2 } },
  'never-melt-ice': { typeBoost: { type: 'ice', mult: 1.2 } },
  'black-belt': { typeBoost: { type: 'fighting', mult: 1.2 } },
  'poison-barb': { typeBoost: { type: 'poison', mult: 1.2 } },
  'soft-sand': { typeBoost: { type: 'ground', mult: 1.2 } },
  'sharp-beak': { typeBoost: { type: 'flying', mult: 1.2 } },
  'twisted-spoon': { typeBoost: { type: 'psychic', mult: 1.2 } },
  'silver-powder': { typeBoost: { type: 'bug', mult: 1.2 } },
  'hard-stone': { typeBoost: { type: 'rock', mult: 1.2 } },
  'spell-tag': { typeBoost: { type: 'ghost', mult: 1.2 } },
  'dragon-fang': { typeBoost: { type: 'dragon', mult: 1.2 } },
  'black-glasses': { typeBoost: { type: 'dark', mult: 1.2 } },
  'metal-coat': { typeBoost: { type: 'steel', mult: 1.2 } },
  'pixie-plate': { typeBoost: { type: 'fairy', mult: 1.2 } },
};

export const ITEM_LABELS: Record<ItemId, string> = {
  'none': 'Sin objeto',
  'life-orb': 'Life Orb (×1.3 all)',
  'choice-band': 'Choice Band (×1.5 phys)',
  'choice-specs': 'Choice Specs (×1.5 spec)',
  'expert-belt': 'Expert Belt (×1.2 SE)',
  'muscle-band': 'Muscle Band (×1.1 phys)',
  'wise-glasses': 'Wise Glasses (×1.1 spec)',
  'leftovers': 'Leftovers (no daño)',
  'assault-vest': 'Assault Vest (SpD)',
  'silk-scarf': 'Silk Scarf (Normal)',
  'charcoal': 'Charcoal (Fuego)',
  'mystic-water': 'Mystic Water (Agua)',
  'magnet': 'Magnet (Eléctrico)',
  'miracle-seed': 'Miracle Seed (Planta)',
  'never-melt-ice': 'Never-Melt Ice (Hielo)',
  'black-belt': 'Black Belt (Lucha)',
  'poison-barb': 'Poison Barb (Veneno)',
  'soft-sand': 'Soft Sand (Tierra)',
  'sharp-beak': 'Sharp Beak (Vuelo)',
  'twisted-spoon': 'Twisted Spoon (Psíquico)',
  'silver-powder': 'Silver Powder (Bicho)',
  'hard-stone': 'Hard Stone (Roca)',
  'spell-tag': 'Spell Tag (Fantasma)',
  'dragon-fang': 'Dragon Fang (Dragón)',
  'black-glasses': 'Black Glasses (Siniestro)',
  'metal-coat': 'Metal Coat (Acero)',
  'pixie-plate': 'Pixie Plate (Hada)',
};
