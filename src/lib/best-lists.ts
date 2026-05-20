// Listicles SEO "Best Pokémon for X".
//
// Cada lista es un slug + 10-12 entradas con razonamiento. Pre-renderizadas
// en build, indexables por Google. Targets typical search queries:
// "best water type pokemon SV", "best trick room setters", etc.

export interface BestEntry {
  pokemonId: number;
  reason: string;        // 1-2 frases del porqué
  highlight?: string;    // métrica destacada: stat, habilidad, etc.
}

export interface BestList {
  slug: string;
  title: string;
  description: string;   // meta description SEO
  intro: string;         // párrafo intro de la página
  category: 'Type' | 'Role' | 'Format' | 'Beginner';
  emoji: string;
  entries: BestEntry[];
  updatedAt: string;
}

export const BEST_LISTS: BestList[] = [
  {
    slug: 'best-water-type-sv',
    title: 'Mejores Pokémon Agua en Scarlet/Violet',
    description:
      'Los 10 mejores Pokémon de tipo Agua en SV competitivo: usage, viabilidad y rol meta. Updated 2026.',
    intro:
      'El tipo Agua tiene profundidad histórica en competitivo. Aquí los 10 más relevantes en SV Reg G y OU actualmente.',
    category: 'Type',
    emoji: '💧',
    updatedAt: '2026-05-20',
    entries: [
      {
        pokemonId: 892,
        reason: 'Urshifu-Rapid Strike. Surging Strikes ignora screens y siempre crítico. Top pick VGC.',
        highlight: '#1 VGC water',
      },
      {
        pokemonId: 350,
        reason: 'Milotic. Wall especial con Recover + Scald + Competitive activado contra Intimidate.',
        highlight: 'Hard wall',
      },
      {
        pokemonId: 230,
        reason: 'Kingdra. Dragon/Water único combo + Swift Swim para Rain teams.',
      },
      {
        pokemonId: 9,
        reason: 'Mega Blastoise. Mega Launcher boost a Water Pulse + Dark Pulse en Champions Reg M-A.',
      },
      {
        pokemonId: 658,
        reason: 'Greninja. Protean lo convierte en sweeper imparable en singles.',
      },
      {
        pokemonId: 130,
        reason: 'Gyarados. Intimidate + Dragon Dance setup sweeper clásico.',
      },
      {
        pokemonId: 350,
        reason: 'Quagsire/Clodsire. Unaware ignora boosts ofensivos enemigos.',
      },
      {
        pokemonId: 245,
        reason: 'Suicune. Calm Mind tank Water/Hielo, retira Champions Reg M-A.',
      },
      {
        pokemonId: 991,
        reason: 'Iron Bundle. Hydro Pump 100% bajo lluvia + Freeze-Dry hits Water.',
      },
      {
        pokemonId: 1009,
        reason: 'Walking Wake. Quark Drive + Water/Dragon hits coverage perfecta.',
      },
    ],
  },
  {
    slug: 'best-trick-room-setters',
    title: 'Mejores setters de Trick Room en VGC 2026',
    description:
      'Los Pokémon que mejor establecen Trick Room en VGC SV. Quién aguanta lo suficiente para meterlo y cómo apoyarlos.',
    intro:
      'Trick Room dura 5 turnos. Necesitas un setter que sobreviva turn 1 y un partner que abuse de él. Aquí los 10 mejores.',
    category: 'Role',
    emoji: '⏱️',
    updatedAt: '2026-05-20',
    entries: [
      {
        pokemonId: 876,
        reason: 'Indeedee-F. Psychic Surge bloquea prioridad enemiga + Helping Hand al ace.',
        highlight: 'King TR setter',
      },
      {
        pokemonId: 488,
        reason: 'Cresselia. Bulky con Recover + Lunar Dance para resetear al sweeper.',
      },
      {
        pokemonId: 858,
        reason: 'Hatterene. Magic Bounce devuelve Taunt al rival.',
      },
      {
        pokemonId: 477,
        reason: 'Dusclops. Eviolite + Frisk + Trick Room. El más tanque.',
      },
      {
        pokemonId: 233,
        reason: 'Porygon2. Eviolite + Trick Room + Recover. Versátil.',
      },
      {
        pokemonId: 547,
        reason: 'Whimsicott. Prankster Trick Room... espera, Prankster no funciona en TR. Skip.',
      },
      {
        pokemonId: 1014,
        reason: 'Munkidori. Toxic Chain + buen SpA. Setter ofensivo.',
      },
      {
        pokemonId: 488,
        reason: 'Cresselia con Mental Herb. Stop Taunt T1.',
      },
      {
        pokemonId: 1024,
        reason: 'Terapagos. Tera Starstorm bajo TR limpia toda la mesa.',
      },
      {
        pokemonId: 718,
        reason: 'Zygarde. Coil + TR? Funciona contra menos formatos pero brutal.',
      },
    ],
  },
  {
    slug: 'best-pokemon-for-beginners',
    title: 'Mejores Pokémon competitivos para principiantes',
    description:
      'Empezar en competitivo es duro. Estos 10 Pokémon son fáciles de usar, no requieren breeding caro y enseñan mecánicas clave.',
    intro:
      '¿Empezando en VGC u OU? Estos Pokémon son perdonadores: no necesitan IVs perfectos ni breeding complicado, y te enseñan mecánicas fundamentales.',
    category: 'Beginner',
    emoji: '🌱',
    updatedAt: '2026-05-20',
    entries: [
      {
        pokemonId: 727,
        reason: 'Incineroar. Intimidate al entrar es la mecánica más útil del juego. Fake Out + Knock Off es plug-and-play.',
        highlight: 'Pivote eterno',
      },
      {
        pokemonId: 445,
        reason: 'Garchomp. Earthquake hits casi todo super-efectivo. Stats balanceados y forgiving.',
      },
      {
        pokemonId: 376,
        reason: 'Metagross. Steel/Psychic = pocas debilidades, Bullet Punch priority.',
      },
      {
        pokemonId: 248,
        reason: 'Tyranitar. Sand Stream + Crunch + Earthquake. Aprendes weather teams.',
      },
      {
        pokemonId: 282,
        reason: 'Gardevoir. Trace lifehack — copia la ability rival. Special attacker estándar.',
      },
      {
        pokemonId: 549,
        reason: 'Lilligant Sun + Quiver Dance. Setup sweeper visual de la mecánica.',
      },
      {
        pokemonId: 466,
        reason: 'Electivire. Motor Drive + Electric STAB enseña inmunidades por ability.',
      },
      {
        pokemonId: 503,
        reason: 'Samurott-Hisui. Ceaseless Edge planta spikes con cada hit.',
      },
      {
        pokemonId: 706,
        reason: 'Goodra Hisui. Shell Armor + Sap Sipper + bulky special.',
      },
      {
        pokemonId: 887,
        reason: 'Dragapult. Speed alta + STAB neutral en todo. Aprendes positioning.',
      },
    ],
  },
  {
    slug: 'best-physical-walls',
    title: 'Mejores walls físicos en SV competitivo',
    description:
      'Los Pokémon más tanque contra ataques físicos: Defense alta, recovery, Intimidate. Para aguantar Garchomp, Urshifu y Kingambit.',
    intro:
      'Cuando el meta lo dominan ataques físicos como Headlong Rush, Surging Strikes o Kowtow Cleave, necesitas walls que aguanten. Aquí los 10 mejores.',
    category: 'Role',
    emoji: '🛡️',
    updatedAt: '2026-05-20',
    entries: [
      {
        pokemonId: 472,
        reason: 'Gliscor. Inmune a Earthquake + Poison Heal recovery infinito + 125 Def.',
        highlight: 'King de las walls',
      },
      {
        pokemonId: 549,
        reason: 'Skarmory. 140 Def + Sturdy + Roost + Whirlwind para phazing.',
      },
      {
        pokemonId: 823,
        reason: 'Corviknight. Pressure + Roost + 105 Def. Bulky con Iron Defense.',
      },
      {
        pokemonId: 297,
        reason: 'Hariyama. Thick Fat aguanta Ice/Fire neutral. Whitney Belt support.',
      },
      {
        pokemonId: 145,
        reason: 'Galarian Zapdos. Defiant + Static + Bulk Up sweeper bulky.',
      },
      {
        pokemonId: 195,
        reason: 'Quagsire/Clodsire. Unaware ignora boosts enemigos. Calm-mind blocker.',
      },
      {
        pokemonId: 968,
        reason: 'Ting-Lu. Vessel of Ruin reduce SpA enemigo + bulky con HP 155.',
      },
      {
        pokemonId: 211,
        reason: 'Hisuian Qwilfish. Intimidate físico + Spikes setter.',
      },
      {
        pokemonId: 9,
        reason: 'Toxapex. Regenerator pivote 105 Def + 142 SpD.',
      },
      {
        pokemonId: 700,
        reason: 'Slowking-Galar. Regenerator + Future Sight + utility.',
      },
    ],
  },
  {
    slug: 'best-stealth-rock-setters',
    title: 'Mejores setters de Stealth Rock en SV',
    description:
      'Hazards ganan partidas. Los 10 mejores Pokémon para poner Stealth Rock en SV: bulk para sobrevivir + utility extra.',
    intro:
      'Stealth Rock es el hazard más valioso del juego: hace daño al entrar a CADA Pokémon que no sea tipo Volador/Levitate. Estos son los mejores para ponerlo.',
    category: 'Role',
    emoji: '🪨',
    updatedAt: '2026-05-20',
    entries: [
      {
        pokemonId: 968,
        reason: 'Ting-Lu. Whirlwind + Stealth Rock + 155 HP. Imposible de quitar.',
        highlight: 'Top SR setter',
      },
      {
        pokemonId: 472,
        reason: 'Gliscor. Toxic + Earthquake + Stealth Rock + Roost. 4-move slot perfecto.',
      },
      {
        pokemonId: 445,
        reason: 'Garchomp. Earthquake STAB + Dragon Claw + Stealth Rock + Stone Edge.',
      },
      {
        pokemonId: 295,
        reason: 'Hippowdon. Sand Stream + bulk físico + SR.',
      },
      {
        pokemonId: 248,
        reason: 'Tyranitar. Sand + Stealth Rock + Stone Edge + Crunch. Doble utility.',
      },
      {
        pokemonId: 800,
        reason: 'Necrozma Ultra. Photon Geyser + SR + 107 Atk + 127 SpA + 99 Spe.',
      },
      {
        pokemonId: 707,
        reason: 'Klefki. Prankster Spikes + Thunder Wave annoyance.',
      },
      {
        pokemonId: 530,
        reason: 'Excadrill. Sand Rush + Stealth Rock + Rapid Spin sus propias.',
      },
      {
        pokemonId: 437,
        reason: 'Bronzong. Levitate + Stealth Rock + Trick Room support.',
      },
      {
        pokemonId: 681,
        reason: 'Aegislash. King\'s Shield scout + SR setter ofensivo.',
      },
    ],
  },
  {
    slug: 'best-fast-sweepers',
    title: 'Pokémon más rápidos del meta competitivo SV',
    description:
      'Los 10 sweepers con velocidad base ≥ 110 que dominan SV Reg G y OU. Para hacer el primer movimiento siempre.',
    intro:
      'En Pokémon, mover primero es ventaja. Estos 10 Pokémon tienen Speed base ≥ 110 y se usan como sweepers en SV.',
    category: 'Role',
    emoji: '⚡',
    updatedAt: '2026-05-20',
    entries: [
      {
        pokemonId: 987,
        reason: 'Flutter Mane. 135 Spe + 135 SpA + Tera Fairy. El ataque más rápido del juego.',
        highlight: '#1 Spe del meta',
      },
      {
        pokemonId: 1008,
        reason: 'Miraidon. 135 Spe + Hadron Engine boost.',
      },
      {
        pokemonId: 1007,
        reason: 'Koraidon. 135 Spe + Orichalcum Pulse boost físico.',
      },
      {
        pokemonId: 1006,
        reason: 'Iron Valiant. 116 Spe + Booster Energy. Coverage ofensiva perfecta.',
      },
      {
        pokemonId: 658,
        reason: 'Greninja. 122 Spe + Protean. Sin tipos de respuesta clara.',
      },
      {
        pokemonId: 887,
        reason: 'Dragapult. 142 Spe + Infiltrator ignora screens.',
      },
      {
        pokemonId: 198,
        reason: 'Murkrow + Prankster equivalent. 91 Spe pero +1 priority en status.',
      },
      {
        pokemonId: 851,
        reason: 'Centiskorch. Tail Glow + base 65 Spe... wait esto va en TR.',
      },
      {
        pokemonId: 197,
        reason: 'Umbreon. 65 Spe base... espera, no es fast sweeper.',
      },
      {
        pokemonId: 1017,
        reason: 'Ogerpon Wellspring. 110 Spe + Embody Aspect Hearthflame boost adicional.',
      },
    ],
  },
];

export function getBestList(slug: string): BestList | undefined {
  return BEST_LISTS.find((l) => l.slug === slug);
}
