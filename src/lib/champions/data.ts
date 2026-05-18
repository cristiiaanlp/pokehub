// Pokémon Champions — datos del juego competitivo más actual.
// Fuentes: Champions Meta, Pokémon Zone, Pikalytics, Switchblade Gaming (mayo 2026).
// Reg M-A activo del 8 abril al 17 junio 2026. Mega Evolutions legales.
// Paradox Pokémon y Treasures of Ruin baneados.

export const CHAMPIONS_FORMAT = {
  id: 'reg-ma',
  label: 'Regulation M-A',
  active: '8 abril – 17 junio 2026',
  rules: [
    'Mega Evolutions legales',
    'Paradox Pokémon prohibidos',
    'Treasures of Ruin prohibidos',
    'Format Singles oficial',
  ],
  sampleSize: 15380,
};

export interface ChampionsUsage {
  name: string;
  usagePct: number; // % of teams it appears on
  winRatePct?: number;
}

export const CHAMPIONS_TOP_USAGE: ChampionsUsage[] = [
  { name: 'Incineroar', usagePct: 62.4, winRatePct: 58.2 },
  { name: 'Sneasler', usagePct: 47.4, winRatePct: 56.0 },
  { name: 'Garchomp', usagePct: 39.8, winRatePct: 55.5 },
  { name: 'Kingambit', usagePct: 32.2, winRatePct: 54.1 },
  { name: 'Basculegion', usagePct: 30.3, winRatePct: 53.8 },
  { name: 'Sinistcha', usagePct: 26.2, winRatePct: 52.3 },
  { name: 'Kleavor', usagePct: 22.5, winRatePct: 61.1 },
  { name: 'Wash Rotom', usagePct: 21.0, winRatePct: 54.3 },
  { name: 'Mr. Rime', usagePct: 18.6, winRatePct: 51.1 },
  { name: 'Froslass', usagePct: 15.8, winRatePct: 63.8 },
];

export interface ChampionsCore {
  pokemonA: string;
  pokemonB: string;
  winRatePct: number;
  note?: string;
}

export const CHAMPIONS_CORE_PAIRS: ChampionsCore[] = [
  { pokemonA: 'Luxray', pokemonB: 'Blastoise', winRatePct: 73, note: 'Mega Blastoise · Rain-bait core' },
  { pokemonA: 'Tauros-Paldea-Blaze', pokemonB: 'Kleavor', winRatePct: 70 },
  { pokemonA: 'Rotom-Mow', pokemonB: 'Kleavor', winRatePct: 70 },
  { pokemonA: 'Rotom-Wash', pokemonB: 'Tauros-Paldea-Blaze', winRatePct: 70 },
  { pokemonA: 'Incineroar', pokemonB: 'Sneasler', winRatePct: 67 },
  { pokemonA: 'Mr. Rime', pokemonB: 'Froslass', winRatePct: 65 },
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
        teraType: 'Rock',
        moves: ['Stone Edge', 'Earthquake', 'Crunch', 'Roost'],
        evs: { atk: 252, spe: 252, hp: 4 },
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
    name: 'World Championships',
    date: '2026-08-28 → 2026-08-30',
    description: 'Mundial. Reg M-A vigente.',
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
