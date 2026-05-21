// Abilities competitivas curadas — overlay para /database/abilities/[name].
//
// Solo cubrimos las abilities más relevantes en el meta SV. PokéAPI
// proporciona la data live, esto añade descripción competitiva + tip.

export interface AbilityNote {
  slug: string;
  description: string;
  notableUsers: number[];
  notes?: string;
  tier?: 'S' | 'A' | 'B';
}

const ABILITY_NOTES: Record<string, AbilityNote> = {
  // === TIER S — Meta-defining ===
  intimidate: {
    slug: 'intimidate',
    description:
      'Reduce el Atk de los rivales activos en -1 al entrar al campo. La ability más impactante de VGC — pivot Incineroar es el Pokémon más usado de la historia gracias a esto.',
    notableUsers: [727, 130, 645, 260],
    notes: 'En VGC pega a 2 rivales por entrada. Clear Body / White Smoke / Hyper Cutter lo ignoran. Covert Cloak en SV también.',
    tier: 'S',
  },
  protosynthesis: {
    slug: 'protosynthesis',
    description:
      'Boost ×1.3 a la stat más alta en sol o con Booster Energy (×1.5 si es Speed). Exclusiva de los Paradox del pasado (Iron Hands NO — esos son Quark Drive).',
    notableUsers: [984, 1003, 1005, 1021],
    notes: 'La stat boostada se calcula al activar — manipula EV spreads para forzar el boost que quieras (Speed vs Atk).',
    tier: 'S',
  },
  'quark-drive': {
    slug: 'quark-drive',
    description:
      'Versión futuro de Protosynthesis. Activa con Electric Terrain o Booster Energy. Boost ×1.3 stat alta (×1.5 Speed).',
    notableUsers: [1006, 968, 998, 996],
    notes: 'Iron Hands Booster Atk + AV es uno de los wallbreakers más sólidos de Gen 9.',
    tier: 'S',
  },
  'supreme-overlord': {
    slug: 'supreme-overlord',
    description:
      'Boost +10% Atk/SpA por cada aliado debilitado (hasta +50% con 5 KOs). Kingambit late-game con +50% es win-con #1 del meta.',
    notableUsers: [983],
    notes: 'Diseña tu equipo aceptando perder Pokémon estratégicamente para preparar el sweep final con Kingambit.',
    tier: 'S',
  },
  'good-as-gold': {
    slug: 'good-as-gold',
    description:
      'Inmune a TODOS los status moves (Toxic, Will-O-Wisp, Encore, Taunt). Primer ability de este tipo, exclusiva de Gholdengo.',
    notableUsers: [1000],
    notes: 'NO bloquea moves de daño con efecto secundario (Scald sigue quemándote). Pero counterea spinblockers tipo Defog.',
    tier: 'S',
  },
  'embody-aspect': {
    slug: 'embody-aspect',
    description:
      'Al hacer Tera, sube +1 a una stat según forma de Ogerpon: Teal (Speed), Wellspring (SpD), Hearthflame (Atk), Cornerstone (Def).',
    notableUsers: [1017],
    notes: 'Primer ability tied a Tera. Ogerpon-Wellspring + Tera Water = +Atk físico + SpD boost = monstruosidad VGC.',
    tier: 'S',
  },
  'magic-guard': {
    slug: 'magic-guard',
    description:
      'Ignora todo damage indirecto: hazards, weather, burn/poison, Life Orb recoil, Curse. Sustain definitivo.',
    notableUsers: [113, 122, 579],
    notes: 'Life Orb Magic Guard = +30% damage sin recoil. Clefable / Reuniclus son perfect abusers.',
    tier: 'A',
  },
  multiscale: {
    slug: 'multiscale',
    description:
      'Reduce damage recibido al 50% si está a full HP. Dragonite Roost + Multiscale = sustain casi infinito.',
    notableUsers: [149, 144],
    notes: 'Stealth Rock rompe Multiscale al entrar. Bring Heavy-Duty Boots o Defog primero.',
    tier: 'A',
  },
  levitate: {
    slug: 'levitate',
    description:
      'Inmune a moves tipo Tierra. Earthquake (el move más usado del juego) no le afecta. Sigue siendo top tier defensivo.',
    notableUsers: [50, 169, 376],
    notes: 'En SV, Pokémon clásicos perdieron Levitate (Gengar → Cursed Body). Pero los que aún la tienen son OP.',
    tier: 'A',
  },
  prankster: {
    slug: 'prankster',
    description:
      'Status moves obtienen +1 priority. Tailwind, Thunder Wave, Encore, Reflect — todo al instante. VGC support staple.',
    notableUsers: [488, 547, 145, 869],
    notes: 'NO afecta a Dark types (inmunes a Prankster Taunt/T-Wave). Riley/Whimsicott Prankster Tailwind define el meta.',
    tier: 'A',
  },
  unburden: {
    slug: 'unburden',
    description:
      '+100% Speed (×2) tras consumir el item held. Sneasler / Hawlucha con Sitrus + Unburden son sweepers Acrobatics demoledores.',
    notableUsers: [903, 701],
    notes: 'Activa solo cuando el item se consume (Berry, Gem). Si Knock Off antes, Unburden no triggea.',
    tier: 'A',
  },
  'huge-power': {
    slug: 'huge-power',
    description:
      'Duplica (×2) el Atk físico. Probablemente la ability más bruta del juego. Azumarill / Mawile / Diggersby con Huge Power son OP.',
    notableUsers: [184, 303, 660],
    notes: 'Azumarill Belly Drum + Sitrus + Huge Power = uno de los wincons más viejos y consistentes del competitivo.',
    tier: 'A',
  },
  'speed-boost': {
    slug: 'speed-boost',
    description:
      '+1 Speed al final de cada turno. Setup pasivo. Blaziken Speed Boost fue banido a Ubers por esto. Sharpedo / Yanmega también la aman.',
    notableUsers: [257, 319, 469],
    notes: 'Combina con Protect — set up Speed sin recibir daño. Después outspeeds todo.',
    tier: 'A',
  },
  adaptability: {
    slug: 'adaptability',
    description:
      'STAB pasa de ×1.5 a ×2.0. Esencialmente +33% damage en moves del mismo tipo. Greninja Protean rotacion (ya removed) era la clave.',
    notableUsers: [658, 211, 350],
    notes: 'Combinado con Choice Specs en Crawdaunt = atomic bombs. Dracovish Specs Adaptability Fishious Rend = ban.',
    tier: 'A',
  },
  drought: {
    slug: 'drought',
    description:
      'Setea sol automáticamente al entrar. Boost +50% Fire, -50% Water. Acoplado con Protosynthesis = teamwide boost.',
    notableUsers: [383, 6, 991],
    notes: 'Mega Charizard Y / Torkoal son los setters clásicos. Walking Wake en sol con Hydro Steam = OP.',
    tier: 'A',
  },
  drizzle: {
    slug: 'drizzle',
    description:
      'Setea lluvia automáticamente. Boost +50% Water, -50% Fire. Pelipper es el setter VGC standard.',
    notableUsers: [382, 279, 130],
    notes: 'Combina con Swift Swim (×2 Speed en lluvia) en Barraskewda / Floatzel = sweeper ultra rápido.',
    tier: 'A',
  },
  'sand-stream': {
    slug: 'sand-stream',
    description:
      'Setea tormenta de arena. Boost +50% SpD a Rock types. Tyranitar / Hippowdon son setters defensivos.',
    notableUsers: [248, 450, 526],
    notes: 'Chip 6.25% al final del turno a non-Rock/Ground/Steel. Excavadora en stall teams.',
    tier: 'B',
  },
  'rough-skin': {
    slug: 'rough-skin',
    description:
      'Atacante recibe 12.5% damage al hacer contacto físico. Stack con Rocky Helmet = 25%+ chip por hit.',
    notableUsers: [445, 211, 105],
    notes: 'Garchomp Rocky Helmet + Rough Skin punisha U-turn spam. Knock Off contacto te come 25%.',
    tier: 'B',
  },
  'flash-fire': {
    slug: 'flash-fire',
    description:
      'Inmune a moves Fuego + boost +50% Fire propios al recibir uno. Switch-in seguro vs Fire spam.',
    notableUsers: [38, 78, 485],
    notes: 'Heatran Flash Fire es el mejor counter a Volcarona / Cinderace. Pivot defensivo perfect.',
    tier: 'B',
  },
  'water-absorb': {
    slug: 'water-absorb',
    description:
      'Inmune a moves Agua + cura 25% HP al recibir uno. Vaporeon clásico.',
    notableUsers: [134, 211, 350],
    notes: 'Counter a rain teams. Switch-in safe a Hydro Pump / Surf que iban a wallbreakear.',
    tier: 'B',
  },
  'storm-drain': {
    slug: 'storm-drain',
    description:
      'Inmune a Water + redirige TODOS los Water moves al usuario + boost +1 SpA. Doubles game-changer.',
    notableUsers: [369, 1017],
    notes: 'Ogerpon-Wellspring redirige Hydro Pump del rival y se boostea. VGC Reg G top tier.',
    tier: 'B',
  },
  'sheer-force': {
    slug: 'sheer-force',
    description:
      'Moves con efectos secundarios pierden el efecto pero ganan +30% damage. Life Orb sin recoil con Sheer Force moves.',
    notableUsers: [34, 635, 530],
    notes: 'Nidoking Life Orb Sheer Force Earth Power es uno de los special wallbreakers más rotos.',
    tier: 'B',
  },
  'tough-claws': {
    slug: 'tough-claws',
    description:
      '+30% damage en contact moves. Diferencia entre 2HKO y OHKO en muchos cálculos.',
    notableUsers: [376, 695, 308],
    notes: 'Mega Metagross Meteor Mash con Tough Claws = uno-shot machine. Greninja-Ash idem.',
    tier: 'B',
  },
  'pixilate': {
    slug: 'pixilate',
    description:
      'Normal moves se convierten en Fairy + ganan +20% damage. Hyper Voice / Boomburst se vuelven STABs Fairy super-fuertes.',
    notableUsers: [282, 700],
    notes: 'Sylveon Pixilate Hyper Voice en doubles spread STAB Fairy es VGC nasty.',
    tier: 'B',
  },
  'mold-breaker': {
    slug: 'mold-breaker',
    description:
      'Ignora abilities defensivas del rival (Levitate, Multiscale, Sturdy, Flash Fire). Earthquake Mold Breaker hit a Bronzong.',
    notableUsers: [344, 552, 720],
    notes: 'Excadrill Mold Breaker EQ es brutal — ignora Sturdy / Levitate de muchos walls comunes.',
    tier: 'B',
  },

  // === ABILITIES INFAMES / FUN ===
  truant: {
    slug: 'truant',
    description:
      'Solo puede atacar 1 de cada 2 turnos. La peor ability del juego — limita a Slaking pese a su BST 670.',
    notableUsers: [289],
    notes: 'Combinable con Skill Swap (rival hereda Truant). Trick + Choice item lockea para que no Skill Swap back.',
  },
  'no-guard': {
    slug: 'no-guard',
    description:
      'Todos los moves del usuario hit con 100% accuracy. Stone Edge / Hydro Pump nunca fallan. Machamp Dynamic Punch siempre confunde.',
    notableUsers: [68, 295],
    notes: 'Beware: el rival también hit al 100% contra ti. Trade interesante.',
    tier: 'B',
  },
};

export function getAbilityNote(slug: string): AbilityNote | undefined {
  return ABILITY_NOTES[slug];
}

export const ALL_ABILITY_NOTE_SLUGS = Object.keys(ABILITY_NOTES);
