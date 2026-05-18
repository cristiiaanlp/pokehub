// Curated competitive sets for top SV OU Pokémon.
// Sources: Smogon Strategy Dex (gen 9 OU, may 2026 meta).
// Each set follows Showdown export format.

import type { SampleTeamMember } from '@/lib/champions/data';

export interface PokemonSet extends SampleTeamMember {
  setName: string;
  description: string;
}

// Map species id → list of competitive sets.
export const POPULAR_SETS: Record<number, PokemonSet[]> = {
  // Great Tusk
  984: [
    {
      setName: 'Bulky Lead',
      description: 'Setea Stealth Rock y absorbe daño físico. EVs en HP/Def + Tera Steel para sobrevivir.',
      name: 'Great Tusk',
      item: 'Leftovers',
      ability: 'Protosynthesis',
      nature: 'Jolly',
      teraType: 'Steel',
      moves: ['Headlong Rush', 'Knock Off', 'Rapid Spin', 'Stealth Rock'],
      evs: { hp: 252, atk: 4, spe: 252 },
    },
    {
      setName: 'Bulk Up Sweeper',
      description: 'Setup sweeper con Bulk Up + Tera Ghost para esquivar Earthquake.',
      name: 'Great Tusk',
      item: 'Leftovers',
      ability: 'Protosynthesis',
      nature: 'Jolly',
      teraType: 'Ghost',
      moves: ['Bulk Up', 'Headlong Rush', 'Ice Spinner', 'Body Press'],
      evs: { hp: 252, atk: 4, spe: 252 },
    },
  ],
  // Kingambit
  983: [
    {
      setName: 'Swords Dance Sweeper',
      description: 'Wincon late-game. Tera Flying contra Mach Punch / Fighting moves.',
      name: 'Kingambit',
      item: 'Black Glasses',
      ability: 'Supreme Overlord',
      nature: 'Adamant',
      teraType: 'Flying',
      moves: ['Swords Dance', 'Kowtow Cleave', 'Sucker Punch', 'Iron Head'],
      evs: { hp: 232, atk: 252, spd: 24 },
    },
    {
      setName: 'Choice Band',
      description: 'Pivot ofensivo. Lock en Sucker Punch para revenge kills.',
      name: 'Kingambit',
      item: 'Choice Band',
      ability: 'Supreme Overlord',
      nature: 'Adamant',
      teraType: 'Dark',
      moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Low Kick'],
      evs: { hp: 100, atk: 252, spe: 156 },
    },
  ],
  // Gholdengo
  1000: [
    {
      setName: 'Nasty Plot Special',
      description: 'Setup con Nasty Plot. Recover para longevidad. Tera Flying esquiva Ground.',
      name: 'Gholdengo',
      item: 'Leftovers',
      ability: 'Good as Gold',
      nature: 'Modest',
      teraType: 'Flying',
      moves: ['Nasty Plot', 'Make It Rain', 'Shadow Ball', 'Recover'],
      evs: { hp: 252, spa: 252, spd: 4 },
    },
    {
      setName: 'Choice Specs',
      description: 'Inmediate damage. Trick para arruinar walls.',
      name: 'Gholdengo',
      item: 'Choice Specs',
      ability: 'Good as Gold',
      nature: 'Timid',
      teraType: 'Steel',
      moves: ['Make It Rain', 'Shadow Ball', 'Trick', 'Focus Blast'],
      evs: { spa: 252, spe: 252, hp: 4 },
    },
  ],
  // Dragonite
  149: [
    {
      setName: 'Extreme Speed Cleaner',
      description: 'Priority + Multiscale. Tera Normal boostea ESpeed.',
      name: 'Dragonite',
      item: 'Heavy-Duty Boots',
      ability: 'Multiscale',
      nature: 'Adamant',
      teraType: 'Normal',
      moves: ['Dragon Dance', 'Extreme Speed', 'Earthquake', 'Outrage'],
      evs: { atk: 252, hp: 4, spe: 252 },
    },
  ],
  // Iron Valiant
  1006: [
    {
      setName: 'Booster Energy Sweeper',
      description: 'Booster Speed + Tera Fairy. Frágil pero letal.',
      name: 'Iron Valiant',
      item: 'Booster Energy',
      ability: 'Quark Drive',
      nature: 'Naive',
      teraType: 'Fairy',
      moves: ['Moonblast', 'Close Combat', 'Encore', 'Knock Off'],
      evs: { atk: 4, spa: 252, spe: 252 },
    },
  ],
  // Raging Bolt
  1021: [
    {
      setName: 'Calm Mind Setup',
      description: 'Especial wallbreaker. Tera Electric para STAB boost.',
      name: 'Raging Bolt',
      item: 'Booster Energy',
      ability: 'Protosynthesis',
      nature: 'Modest',
      teraType: 'Electric',
      moves: ['Calm Mind', 'Thunderclap', 'Draco Meteor', 'Thunderbolt'],
      evs: { hp: 60, def: 32, spa: 252, spd: 4, spe: 160 },
    },
  ],
  // Dragapult
  887: [
    {
      setName: 'Choice Specs',
      description: 'Wallbreaker rápido. Tera Ghost para Shadow Ball STAB.',
      name: 'Dragapult',
      item: 'Choice Specs',
      ability: 'Infiltrator',
      nature: 'Timid',
      teraType: 'Ghost',
      moves: ['Draco Meteor', 'Shadow Ball', 'Fire Blast', 'U-turn'],
      evs: { spa: 252, spe: 252, hp: 4 },
    },
    {
      setName: 'Dragon Dance',
      description: 'Physical sweeper. Tera Dragon o Steel según equipo.',
      name: 'Dragapult',
      item: 'Heavy-Duty Boots',
      ability: 'Clear Body',
      nature: 'Jolly',
      teraType: 'Steel',
      moves: ['Dragon Dance', 'Dragon Darts', 'Tera Blast', 'Sucker Punch'],
      evs: { atk: 252, spe: 252, hp: 4 },
    },
  ],
  // Garchomp
  445: [
    {
      setName: 'Stealth Rock Lead',
      description: 'Lead defensivo con hazards. Tera Fire vs Ice attacks.',
      name: 'Garchomp',
      item: 'Rocky Helmet',
      ability: 'Rough Skin',
      nature: 'Jolly',
      teraType: 'Fire',
      moves: ['Earthquake', 'Stealth Rock', 'Spikes', 'Dragon Tail'],
      evs: { hp: 248, def: 84, spe: 176 },
    },
    {
      setName: 'Swords Dance Sweeper',
      description: 'Setup físico. Tera Steel vs Ice Beam predictions.',
      name: 'Garchomp',
      item: 'Life Orb',
      ability: 'Rough Skin',
      nature: 'Jolly',
      teraType: 'Steel',
      moves: ['Swords Dance', 'Earthquake', 'Stone Edge', 'Iron Head'],
      evs: { atk: 252, hp: 4, spe: 252 },
    },
  ],
  // Zamazenta
  889: [
    {
      setName: 'Body Press Sweeper',
      description: 'Tera Fighting + Body Press boostea con Iron Defense.',
      name: 'Zamazenta',
      item: 'Leftovers',
      ability: 'Dauntless Shield',
      nature: 'Jolly',
      teraType: 'Fighting',
      moves: ['Iron Defense', 'Body Press', 'Crunch', 'Heavy Slam'],
      evs: { hp: 252, atk: 4, spe: 252 },
    },
  ],
  // Ogerpon-Wellspring
  1017: [
    {
      setName: 'Swords Dance Sweeper',
      description: 'Forma Wellspring con Water STAB. Tera Water absurdo.',
      name: 'Ogerpon-Wellspring',
      item: 'Wellspring Mask',
      ability: 'Water Absorb',
      nature: 'Jolly',
      teraType: 'Water',
      moves: ['Swords Dance', 'Ivy Cudgel', 'Power Whip', 'U-turn'],
      evs: { atk: 252, spe: 252, hp: 4 },
    },
  ],
  // Slowking-Galar
  199: [
    {
      setName: 'Future Sight Wallbreaker',
      description: 'Pivot especial con Future Sight + Chilly Reception.',
      name: 'Slowking-Galar',
      item: 'Heavy-Duty Boots',
      ability: 'Regenerator',
      nature: 'Sassy',
      teraType: 'Water',
      moves: ['Future Sight', 'Sludge Bomb', 'Chilly Reception', 'Thunder Wave'],
      evs: { hp: 252, spa: 4, spd: 252 },
    },
  ],
  // Gliscor
  472: [
    {
      setName: 'Toxic Stall',
      description: 'Stall con Poison Heal + Toxic + Protect.',
      name: 'Gliscor',
      item: 'Toxic Orb',
      ability: 'Poison Heal',
      nature: 'Impish',
      teraType: 'Water',
      moves: ['Earthquake', 'Toxic', 'Protect', 'Knock Off'],
      evs: { hp: 244, def: 244, spe: 20 },
    },
  ],
  // Iron Treads
  990: [
    {
      setName: 'Rapid Spin Lead',
      description: 'Removes hazards + Stealth Rock setter.',
      name: 'Iron Treads',
      item: 'Booster Energy',
      ability: 'Quark Drive',
      nature: 'Jolly',
      teraType: 'Ghost',
      moves: ['Rapid Spin', 'Earthquake', 'Stealth Rock', 'Knock Off'],
      evs: { hp: 4, atk: 252, spe: 252 },
    },
  ],
  // Kyurem
  646: [
    {
      setName: 'Specs Wallbreaker',
      description: 'Devastating special damage. Tera Dragon o Ice.',
      name: 'Kyurem',
      item: 'Choice Specs',
      ability: 'Pressure',
      nature: 'Timid',
      teraType: 'Dragon',
      moves: ['Freeze-Dry', 'Ice Beam', 'Earth Power', 'Draco Meteor'],
      evs: { spa: 252, spe: 252, hp: 4 },
    },
  ],
  // Hatterene
  858: [
    {
      setName: 'Calm Mind Setup',
      description: 'Tera Water para resist Ice + Steel. Setup sweeper.',
      name: 'Hatterene',
      item: 'Leftovers',
      ability: 'Magic Bounce',
      nature: 'Bold',
      teraType: 'Water',
      moves: ['Calm Mind', 'Stored Power', 'Draining Kiss', 'Nuzzle'],
      evs: { hp: 252, def: 252, spd: 4 },
    },
  ],
  // Corviknight
  823: [
    {
      setName: 'Defensive Pivot',
      description: 'Tanks físico. U-turn pivot + Roost recovery.',
      name: 'Corviknight',
      item: 'Leftovers',
      ability: 'Pressure',
      nature: 'Impish',
      teraType: 'Dragon',
      moves: ['Body Press', 'Roost', 'U-turn', 'Defog'],
      evs: { hp: 252, def: 252, spd: 4 },
    },
  ],
  // Charizard
  6: [
    {
      setName: 'Sun Sweeper',
      description: 'Solar Power + Sun setter. Compañero clásico de Drought.',
      name: 'Charizard',
      item: 'Heavy-Duty Boots',
      ability: 'Solar Power',
      nature: 'Timid',
      teraType: 'Fire',
      moves: ['Fire Blast', 'Solar Beam', 'Hurricane', 'Tera Blast'],
      evs: { spa: 252, spe: 252, hp: 4 },
    },
  ],
  // Pikachu (just for fun)
  25: [
    {
      setName: 'Light Ball Glass Cannon',
      description: 'Light Ball duplica Atk y SpA. Frágil pero golpea fuerte.',
      name: 'Pikachu',
      item: 'Light Ball',
      ability: 'Static',
      nature: 'Timid',
      teraType: 'Electric',
      moves: ['Thunderbolt', 'Surf', 'Grass Knot', 'Volt Switch'],
      evs: { spa: 252, spe: 252, hp: 4 },
    },
  ],
};

export function getSetsFor(speciesId: number): PokemonSet[] {
  return POPULAR_SETS[speciesId] ?? [];
}

// Build a "common partners" list from our sample teams + curated knowledge
export const COMMON_PARTNERS: Record<number, number[]> = {
  984: [983, 1000, 887, 472, 990], // Great Tusk: Kingambit, Gholdengo, Dragapult, Gliscor, Iron Treads
  983: [984, 887, 472, 199, 472], // Kingambit
  1000: [984, 887, 199, 858, 472], // Gholdengo
  149: [983, 472, 990, 199], // Dragonite
  445: [983, 1000, 472, 887], // Garchomp
  445.1: [], // placeholder
  727: [979, 445, 903, 1013], // Incineroar (Champions)
  903: [727, 445, 983, 1013], // Sneasler (Champions)
  889: [983, 1000, 887], // Zamazenta
  887: [984, 983, 1000, 472], // Dragapult
  6: [9, 3, 18, 142], // Charizard (Champions Mega trio)
  9: [6, 3, 25], // Blastoise
  3: [6, 9, 25], // Venusaur
};

export function getPartnersFor(speciesId: number): number[] {
  return COMMON_PARTNERS[speciesId] ?? [];
}
