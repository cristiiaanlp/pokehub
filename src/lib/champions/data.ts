// Pokémon Champions — datos del juego competitivo más actual.
// Fuentes: Champions Meta, Pokémon Zone, Pikalytics, Switchblade Gaming.
// Refresh manual: 2026-05-20 (mitad de Reg M-A). Para datos live, /api/meta/threats
// scrapea Pikalytics directamente.
//
// Reg M-A activo 8-abril–17-junio 2026. Mega Evolutions legales.
// Paradox Pokémon y Treasures of Ruin baneados.

export const CHAMPIONS_FORMAT = {
  id: 'reg-ma',
  label: 'Regulation M-A',
  active: '8 abril – 17 junio 2026',
  rules: [
    'Mega Evolutions legales (Charizard, Venusaur, Lucario, Salamence, Tyranitar, Garchomp…)',
    'Paradox Pokémon prohibidos (Iron Valiant, Flutter Mane, Great Tusk…)',
    'Treasures of Ruin prohibidos (Chien-Pao, Chi-Yu, Ting-Lu, Wo-Chien)',
    'Format Singles oficial',
  ],
  sampleSize: 24820,
  lastUpdated: '2026-05-20',
};

export interface ChampionsUsage {
  name: string;
  usagePct: number; // % of teams it appears on
  winRatePct?: number;
}

export const CHAMPIONS_TOP_USAGE: ChampionsUsage[] = [
  { name: 'Incineroar', usagePct: 58.9, winRatePct: 57.4 },
  { name: 'Garchomp', usagePct: 47.1, winRatePct: 56.8 },
  { name: 'Sneasler', usagePct: 44.6, winRatePct: 55.9 },
  { name: 'Kingambit', usagePct: 36.8, winRatePct: 54.7 },
  { name: 'Mega Charizard Y', usagePct: 31.5, winRatePct: 58.1 },
  { name: 'Sinistcha', usagePct: 28.4, winRatePct: 53.2 },
  { name: 'Mega Tyranitar', usagePct: 26.7, winRatePct: 60.4 },
  { name: 'Basculegion', usagePct: 25.3, winRatePct: 52.8 },
  { name: 'Kleavor', usagePct: 23.9, winRatePct: 59.6 },
  { name: 'Mega Salamence', usagePct: 22.2, winRatePct: 56.0 },
  { name: 'Mega Lucario', usagePct: 21.1, winRatePct: 55.5 },
  { name: 'Wash Rotom', usagePct: 20.4, winRatePct: 53.8 },
  { name: 'Mr. Rime', usagePct: 18.2, winRatePct: 51.0 },
  { name: 'Mega Gardevoir', usagePct: 17.8, winRatePct: 54.6 },
  { name: 'Froslass', usagePct: 16.3, winRatePct: 62.1 },
  { name: 'Mega Mawile', usagePct: 14.8, winRatePct: 58.3 },
  { name: 'Mega Venusaur', usagePct: 13.6, winRatePct: 56.7 },
  { name: 'Hydreigon', usagePct: 12.9, winRatePct: 52.4 },
  { name: 'Mega Aerodactyl', usagePct: 11.7, winRatePct: 55.1 },
  { name: 'Clefable', usagePct: 10.5, winRatePct: 53.5 },
];

export interface ChampionsCore {
  pokemonA: string;
  pokemonB: string;
  winRatePct: number;
  note?: string;
}

export const CHAMPIONS_CORE_PAIRS: ChampionsCore[] = [
  { pokemonA: 'Mega Tyranitar', pokemonB: 'Excadrill', winRatePct: 74, note: 'Sand offense — Sand Stream + Sand Rush' },
  { pokemonA: 'Mega Charizard Y', pokemonB: 'Venusaur', winRatePct: 72, note: 'Sun core — Drought + Chlorophyll' },
  { pokemonA: 'Incineroar', pokemonB: 'Sneasler', winRatePct: 70, note: 'Pivot + cleaner clásico' },
  { pokemonA: 'Mega Salamence', pokemonB: 'Heatran', winRatePct: 69, note: 'Bulky offense — Salamence Earthquake + Heatran Fire' },
  { pokemonA: 'Mega Lucario', pokemonB: 'Garchomp', winRatePct: 68, note: 'Doble setup sweeper' },
  { pokemonA: 'Garchomp', pokemonB: 'Kingambit', winRatePct: 67, note: 'Ground + Dark priority closer' },
  { pokemonA: 'Mega Mawile', pokemonB: 'Sinistcha', winRatePct: 66, note: 'Trick Room hard counter' },
  { pokemonA: 'Mr. Rime', pokemonB: 'Froslass', winRatePct: 65, note: 'Ice spread + Spikes setter' },
];

export interface SampleTeam {
  id: string;
  name: string;
  author: string;
  tournament: string;
  format: 'reg-ma' | 'gen9ou' | 'gen9vgc';
  game: 'champions' | 'sv';
  date: string;
  members: SampleTeamMember[];
  description?: string;
  archetype: string;
}

export interface SampleTeamMember {
  name: string;
  /** Pre-resolved PokéAPI species ID. When undefined, falls back to runtime resolution. */
  speciesId?: number | null;
  item?: string;
  ability?: string;
  nature?: string;
  teraType?: string;
  moves: string[];
  evs?: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
}

export const CHAMPIONS_SAMPLE_TEAMS: SampleTeam[] = [
  {
    id: 'champ-extreme-speed',
    name: 'Mega Charizard Y Sun Offense',
    author: 'Punihina',
    tournament: 'Extreme Speed Pokémon Champions #5',
    format: 'reg-ma',
    game: 'champions',
    date: '2026-05-04',
    archetype: 'Sun Offense',
    description:
      'Sol con Mega Charizard Y como wincon principal. Tauros Aqua presiona, Garchomp y Kingambit cierran.',
    members: [
      {
        name: 'Charizard',
        item: 'Charizardite Y',
        ability: 'Solar Power',
        nature: 'Timid',
        teraType: 'Fire',
        moves: ['Heat Wave', 'Solar Beam', 'Tailwind', 'Protect'],
        evs: { hp: 4, spa: 252, spe: 252 },
      },
      {
        name: 'Tauros-Paldea-Aqua',
        item: 'Mystic Water',
        ability: 'Intimidate',
        nature: 'Adamant',
        teraType: 'Water',
        moves: ['Wave Crash', 'Close Combat', 'Rock Slide', 'Protect'],
        evs: { atk: 252, hp: 156, spe: 100 },
      },
      {
        name: 'Whimsicott',
        item: 'Focus Sash',
        ability: 'Prankster',
        nature: 'Timid',
        teraType: 'Ghost',
        moves: ['Tailwind', 'Encore', 'Moonblast', 'Sunny Day'],
        evs: { hp: 252, spd: 100, spe: 156 },
      },
      {
        name: 'Garchomp',
        item: 'Life Orb',
        ability: 'Rough Skin',
        nature: 'Jolly',
        teraType: 'Steel',
        moves: ['Earthquake', 'Dragon Claw', 'Stealth Rock', 'Protect'],
        evs: { atk: 252, hp: 4, spe: 252 },
      },
      {
        name: 'Kingambit',
        item: 'Black Glasses',
        ability: 'Defiant',
        nature: 'Adamant',
        teraType: 'Dark',
        moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Protect'],
        evs: { atk: 252, hp: 252, spe: 4 },
      },
      {
        name: 'Farigiraf',
        item: 'Mental Herb',
        ability: 'Armor Tail',
        nature: 'Sassy',
        teraType: 'Water',
        moves: ['Trick Room', 'Helping Hand', 'Foul Play', 'Psychic Noise'],
        evs: { hp: 244, spa: 4, spd: 252 },
      },
    ],
  },
  {
    id: 'champ-tadl-vgc',
    name: 'Aegislash Balance',
    author: 'Faiyex',
    tournament: 'TADL VGC Tournament',
    format: 'reg-ma',
    game: 'champions',
    date: '2026-04-28',
    archetype: 'Balance',
    description:
      'Balance con Mega Venusaur tanking + Aegislash como pivot. Wash Rotom y Hydreigon cubren coverage especial.',
    members: [
      {
        name: 'Venusaur',
        item: 'Venusaurite',
        ability: 'Thick Fat',
        nature: 'Bold',
        teraType: 'Steel',
        moves: ['Sludge Bomb', 'Giga Drain', 'Sleep Powder', 'Protect'],
        evs: { hp: 252, def: 252, spd: 4 },
      },
      {
        name: 'Incineroar',
        item: 'Sitrus Berry',
        ability: 'Intimidate',
        nature: 'Careful',
        teraType: 'Ghost',
        moves: ['Fake Out', 'Knock Off', 'Parting Shot', 'Flare Blitz'],
        evs: { hp: 244, atk: 4, spd: 252 },
      },
      {
        name: 'Garchomp',
        item: 'Choice Scarf',
        ability: 'Rough Skin',
        nature: 'Jolly',
        teraType: 'Ground',
        moves: ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Stomping Tantrum'],
        evs: { atk: 252, hp: 4, spe: 252 },
      },
      {
        name: 'Aegislash',
        item: 'Weakness Policy',
        ability: 'Stance Change',
        nature: 'Quiet',
        teraType: 'Fairy',
        moves: ['Shadow Ball', 'Flash Cannon', 'Wide Guard', 'King\'s Shield'],
        evs: { hp: 252, spa: 252, def: 4 },
      },
      {
        name: 'Rotom-Wash',
        item: 'Safety Goggles',
        ability: 'Levitate',
        nature: 'Modest',
        teraType: 'Electric',
        moves: ['Hydro Pump', 'Thunderbolt', 'Will-O-Wisp', 'Protect'],
        evs: { hp: 252, spa: 252, spd: 4 },
      },
      {
        name: 'Hydreigon',
        item: 'Life Orb',
        ability: 'Levitate',
        nature: 'Modest',
        teraType: 'Steel',
        moves: ['Draco Meteor', 'Dark Pulse', 'Flash Cannon', 'Protect'],
        evs: { spa: 252, spe: 252, hp: 4 },
      },
    ],
  },
  {
    id: 'champ-delites',
    name: 'Sneasler Hyper Offense',
    author: 'DisPlotfr',
    tournament: 'Delites Champions Cup #3',
    format: 'reg-ma',
    game: 'champions',
    date: '2026-05-10',
    archetype: 'Hyper Offense',
    description:
      'Wincon principal Mega Delphox con Sneasler abriendo huecos. Aerodactyl Mega outpaces todo.',
    members: [
      {
        name: 'Delphox',
        item: 'Wise Glasses',
        ability: 'Magician',
        nature: 'Timid',
        teraType: 'Fire',
        moves: ['Fire Blast', 'Psychic', 'Dazzling Gleam', 'Protect'],
        evs: { spa: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Tsareena',
        item: 'Assault Vest',
        ability: 'Queenly Majesty',
        nature: 'Adamant',
        teraType: 'Steel',
        moves: ['Power Whip', 'Triple Axel', 'U-turn', 'High Jump Kick'],
        evs: { atk: 252, spd: 252, hp: 4 },
      },
      {
        name: 'Sneasler',
        item: 'Life Orb',
        ability: 'Unburden',
        nature: 'Jolly',
        teraType: 'Fighting',
        moves: ['Close Combat', 'Dire Claw', 'Throat Chop', 'Acrobatics'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Hydreigon',
        item: 'Choice Specs',
        ability: 'Levitate',
        nature: 'Timid',
        teraType: 'Fairy',
        moves: ['Draco Meteor', 'Dark Pulse', 'Flash Cannon', 'Earth Power'],
        evs: { spa: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Clefable',
        item: 'Leftovers',
        ability: 'Magic Guard',
        nature: 'Calm',
        teraType: 'Steel',
        moves: ['Moonblast', 'Moonlight', 'Calm Mind', 'Stored Power'],
        evs: { hp: 252, spd: 252, def: 4 },
      },
      {
        name: 'Aerodactyl',
        item: 'Aerodactylite',
        ability: 'Tough Claws',
        nature: 'Jolly',
        teraType: 'Flying',
        moves: ['Stone Edge', 'Earthquake', 'Crunch', 'Roost'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
    ],
  },
  // ─── Equipos añadidos en refresh 2026-05-20 ──────────────────────────
  {
    id: 'champ-sand-mega-ttar',
    name: 'Sand Offense Mega Tyranitar',
    author: 'CybertronVGC',
    tournament: 'Champions Open · Mayo 2026',
    format: 'reg-ma',
    game: 'champions',
    date: '2026-05-12',
    archetype: 'Sand Offense',
    description:
      'Mega Tyranitar setea Sand + Excadrill abusa Sand Rush. Doble priority con Kingambit Sucker. Heatran trampea Water enemigos.',
    members: [
      {
        name: 'Tyranitar',
        item: 'Tyranitarite',
        ability: 'Sand Stream',
        nature: 'Jolly',
        teraType: 'Flying',
        moves: ['Stone Edge', 'Crunch', 'Earthquake', 'Dragon Dance'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Excadrill',
        item: 'Life Orb',
        ability: 'Sand Rush',
        nature: 'Jolly',
        teraType: 'Steel',
        moves: ['Earthquake', 'Iron Head', 'Rock Slide', 'Rapid Spin'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Heatran',
        item: 'Leftovers',
        ability: 'Flash Fire',
        nature: 'Modest',
        teraType: 'Grass',
        moves: ['Magma Storm', 'Earth Power', 'Stealth Rock', 'Protect'],
        evs: { hp: 252, spa: 252, spd: 4 },
      },
      {
        name: 'Kingambit',
        item: 'Black Glasses',
        ability: 'Supreme Overlord',
        nature: 'Adamant',
        teraType: 'Dark',
        moves: ['Sucker Punch', 'Kowtow Cleave', 'Iron Head', 'Swords Dance'],
        evs: { atk: 252, hp: 252, spd: 4 },
      },
      {
        name: 'Garchomp',
        item: 'Choice Scarf',
        ability: 'Rough Skin',
        nature: 'Jolly',
        teraType: 'Ground',
        moves: ['Earthquake', 'Dragon Claw', 'Stone Edge', 'Outrage'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Clefable',
        item: 'Leftovers',
        ability: 'Magic Guard',
        nature: 'Calm',
        teraType: 'Steel',
        moves: ['Moonblast', 'Wish', 'Protect', 'Stealth Rock'],
        evs: { hp: 252, spd: 252, def: 4 },
      },
    ],
  },
  {
    id: 'champ-tr-mawile',
    name: 'Trick Room Mega Mawile',
    author: 'BlaziKing',
    tournament: 'Champions Cup Iberian #2',
    format: 'reg-ma',
    game: 'champions',
    date: '2026-05-14',
    archetype: 'Trick Room',
    description:
      'Hatterene/Cresselia setean TR. Mega Mawile cierra con Play Rough + Sucker. Sinistcha utility/healer.',
    members: [
      {
        name: 'Hatterene',
        item: 'Mental Herb',
        ability: 'Magic Bounce',
        nature: 'Quiet',
        teraType: 'Water',
        moves: ['Trick Room', 'Dazzling Gleam', 'Psychic', 'Helping Hand'],
        evs: { hp: 252, spa: 252, def: 4 },
      },
      {
        name: 'Mawile',
        item: 'Mawilite',
        ability: 'Huge Power',
        nature: 'Brave',
        teraType: 'Steel',
        moves: ['Play Rough', 'Iron Head', 'Sucker Punch', 'Protect'],
        evs: { hp: 252, atk: 252, spd: 4 },
      },
      {
        name: 'Cresselia',
        item: 'Mental Herb',
        ability: 'Levitate',
        nature: 'Relaxed',
        teraType: 'Fairy',
        moves: ['Trick Room', 'Lunar Dance', 'Moonblast', 'Helping Hand'],
        evs: { hp: 252, def: 252, spd: 4 },
      },
      {
        name: 'Sinistcha',
        item: 'Sitrus Berry',
        ability: 'Hospitality',
        nature: 'Quiet',
        teraType: 'Water',
        moves: ['Matcha Gotcha', 'Strength Sap', 'Trick Room', 'Protect'],
        evs: { hp: 252, spa: 252, def: 4 },
      },
      {
        name: 'Incineroar',
        item: 'Safety Goggles',
        ability: 'Intimidate',
        nature: 'Sassy',
        teraType: 'Ghost',
        moves: ['Fake Out', 'Knock Off', 'Parting Shot', 'Flare Blitz'],
        evs: { hp: 252, spd: 252, atk: 4 },
      },
      {
        name: 'Ursaluna',
        item: 'Flame Orb',
        ability: 'Guts',
        nature: 'Brave',
        teraType: 'Ghost',
        moves: ['Facade', 'Headlong Rush', 'Earthquake', 'Protect'],
        evs: { hp: 252, atk: 252, spd: 4 },
      },
    ],
  },
  {
    id: 'champ-tailwind-salamence',
    name: 'Tailwind Mega Salamence',
    author: 'JackVGC',
    tournament: 'Pokémon Champions Online Series Wave 7',
    format: 'reg-ma',
    game: 'champions',
    date: '2026-05-16',
    archetype: 'Bulky Offense + Tailwind',
    description:
      'Whimsicott Prankster Tailwind + Mega Salamence Aerilate Hyper Voice spread. Heatran traps Steels, Sinistcha Strength Sap.',
    members: [
      {
        name: 'Salamence',
        item: 'Salamencite',
        ability: 'Intimidate',
        nature: 'Naive',
        teraType: 'Normal',
        moves: ['Hyper Voice', 'Earthquake', 'Draco Meteor', 'Protect'],
        evs: { spa: 252, spe: 252, atk: 4 },
      },
      {
        name: 'Whimsicott',
        item: 'Focus Sash',
        ability: 'Prankster',
        nature: 'Timid',
        teraType: 'Ghost',
        moves: ['Tailwind', 'Encore', 'Moonblast', 'Helping Hand'],
        evs: { hp: 252, spd: 100, spe: 156 },
      },
      {
        name: 'Heatran',
        item: 'Choice Specs',
        ability: 'Flash Fire',
        nature: 'Modest',
        teraType: 'Grass',
        moves: ['Magma Storm', 'Earth Power', 'Flash Cannon', 'Solar Beam'],
        evs: { spa: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Garchomp',
        item: 'Life Orb',
        ability: 'Rough Skin',
        nature: 'Jolly',
        teraType: 'Steel',
        moves: ['Earthquake', 'Dragon Claw', 'Stone Edge', 'Protect'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Sinistcha',
        item: 'Leftovers',
        ability: 'Heatproof',
        nature: 'Calm',
        teraType: 'Water',
        moves: ['Matcha Gotcha', 'Strength Sap', 'Hex', 'Protect'],
        evs: { hp: 252, spd: 252, def: 4 },
      },
      {
        name: 'Lucario',
        item: 'Lucarionite',
        ability: 'Inner Focus',
        nature: 'Adamant',
        teraType: 'Fighting',
        moves: ['Close Combat', 'Bullet Punch', 'Meteor Mash', 'Swords Dance'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
    ],
  },
  // ─── SV Reg G (regular VGC sin Champions) ───────────────────────────
  {
    id: 'svvgc-miraidon-ironhands',
    name: 'Miraidon Electric Spam',
    author: 'WolfeyVGC',
    tournament: 'EUIC 2026 Top 4',
    format: 'gen9vgc',
    game: 'sv',
    date: '2026-05-08',
    archetype: 'Electric Spam · Restricted',
    description:
      'Miraidon + Iron Hands clásico. Tornadus Tailwind support, Farigiraf Trick Room backup. Urshifu cierra contra Steels.',
    members: [
      {
        name: 'Miraidon',
        item: 'Choice Specs',
        ability: 'Hadron Engine',
        nature: 'Modest',
        teraType: 'Electric',
        moves: ['Electro Drift', 'Draco Meteor', 'Volt Switch', 'Dazzling Gleam'],
        evs: { spa: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Iron Hands',
        item: 'Assault Vest',
        ability: 'Quark Drive',
        nature: 'Adamant',
        teraType: 'Grass',
        moves: ['Wild Charge', 'Drain Punch', 'Fake Out', 'Heavy Slam'],
        evs: { hp: 252, atk: 252, spd: 4 },
      },
      {
        name: 'Tornadus',
        item: 'Covert Cloak',
        ability: 'Prankster',
        nature: 'Timid',
        teraType: 'Flying',
        moves: ['Tailwind', 'Bleakwind Storm', 'Taunt', 'Protect'],
        evs: { hp: 252, spa: 4, spe: 252 },
      },
      {
        name: 'Urshifu-Rapid-Strike',
        item: 'Mystic Water',
        ability: 'Unseen Fist',
        nature: 'Adamant',
        teraType: 'Water',
        moves: ['Surging Strikes', 'Close Combat', 'Aqua Jet', 'Detect'],
        evs: { atk: 252, hp: 156, spe: 100 },
      },
      {
        name: 'Farigiraf',
        item: 'Electric Seed',
        ability: 'Armor Tail',
        nature: 'Sassy',
        teraType: 'Water',
        moves: ['Trick Room', 'Psychic Noise', 'Foul Play', 'Helping Hand'],
        evs: { hp: 244, spd: 252, spa: 12 },
      },
      {
        name: 'Ogerpon-Hearthflame',
        item: 'Hearthflame Mask',
        ability: 'Mold Breaker',
        nature: 'Jolly',
        teraType: 'Fire',
        moves: ['Ivy Cudgel', 'Wood Hammer', 'Follow Me', 'Spiky Shield'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
    ],
  },
  {
    id: 'svvgc-calyrex-shadow',
    name: 'Calyrex-Shadow Hyper Offense',
    author: 'Markus Stadter',
    tournament: 'Liverpool Regional Top 8',
    format: 'gen9vgc',
    game: 'sv',
    date: '2026-05-04',
    archetype: 'Hyper Offense · Restricted',
    description:
      'Calyrex-Shadow + Indeedee Psychic Surge. Astral Barrage spam con Tera Fairy para evitar Sucker Punch.',
    members: [
      {
        name: 'Calyrex-Shadow',
        item: 'Choice Scarf',
        ability: 'As One',
        nature: 'Timid',
        teraType: 'Fairy',
        moves: ['Astral Barrage', 'Psychic', 'Pollen Puff', 'Trick'],
        evs: { spa: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Indeedee-Female',
        item: 'Psychic Seed',
        ability: 'Psychic Surge',
        nature: 'Calm',
        teraType: 'Fairy',
        moves: ['Follow Me', 'Helping Hand', 'Trick Room', 'Dazzling Gleam'],
        evs: { hp: 252, spd: 252, def: 4 },
      },
      {
        name: 'Urshifu-Single-Strike',
        item: 'Focus Sash',
        ability: 'Unseen Fist',
        nature: 'Adamant',
        teraType: 'Ghost',
        moves: ['Wicked Blow', 'Close Combat', 'Sucker Punch', 'Detect'],
        evs: { atk: 252, spe: 252, hp: 4 },
      },
      {
        name: 'Whimsicott',
        item: 'Covert Cloak',
        ability: 'Prankster',
        nature: 'Timid',
        teraType: 'Steel',
        moves: ['Tailwind', 'Moonblast', 'Encore', 'Light Screen'],
        evs: { hp: 252, spe: 252, def: 4 },
      },
      {
        name: 'Iron Hands',
        item: 'Assault Vest',
        ability: 'Quark Drive',
        nature: 'Adamant',
        teraType: 'Fire',
        moves: ['Wild Charge', 'Drain Punch', 'Fake Out', 'Heavy Slam'],
        evs: { hp: 252, atk: 252, spd: 4 },
      },
      {
        name: 'Rillaboom',
        item: 'Loaded Dice',
        ability: 'Grassy Surge',
        nature: 'Adamant',
        teraType: 'Fire',
        moves: ['Grassy Glide', 'Wood Hammer', 'Fake Out', 'U-turn'],
        evs: { atk: 252, hp: 252, spd: 4 },
      },
    ],
  },
];

export const CHAMPIONS_UPCOMING = [
  {
    name: 'Indianapolis Regionals',
    date: '2026-05-29 → 2026-05-31',
    description: 'Primer Regional VGC oficial sobre Pokémon Champions.',
  },
  {
    name: 'Stuttgart Special Event',
    date: '2026-06-13 → 2026-06-15',
    description: 'Último torneo grande de Reg M-A antes del rotation.',
  },
  {
    name: 'Reg N-A inicio',
    date: '2026-06-18',
    description: 'Nuevo regulation set. Mega Evolutions probablemente quedan.',
  },
  {
    name: 'World Championships',
    date: '2026-08-28 → 2026-08-30',
    description: 'Mundial. Reg N-A vigente con clasificados de toda la temporada.',
  },
];

// Convert a sample team to Showdown export format
export function teamToShowdown(team: SampleTeam): string {
  return team.members
    .map((m) => {
      const lines: string[] = [];
      lines.push(`${m.name}${m.item ? ` @ ${m.item}` : ''}`);
      if (m.ability) lines.push(`Ability: ${m.ability}`);
      if (m.teraType) lines.push(`Tera Type: ${m.teraType}`);
      if (m.evs) {
        const evParts: string[] = [];
        const e = m.evs;
        if (e.hp) evParts.push(`${e.hp} HP`);
        if (e.atk) evParts.push(`${e.atk} Atk`);
        if (e.def) evParts.push(`${e.def} Def`);
        if (e.spa) evParts.push(`${e.spa} SpA`);
        if (e.spd) evParts.push(`${e.spd} SpD`);
        if (e.spe) evParts.push(`${e.spe} Spe`);
        if (evParts.length) lines.push(`EVs: ${evParts.join(' / ')}`);
      }
      if (m.nature) lines.push(`${m.nature} Nature`);
      for (const move of m.moves) lines.push(`- ${move}`);
      return lines.join('\n');
    })
    .join('\n\n');
}
