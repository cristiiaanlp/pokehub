// Quiz tipo entrenador — 8 preguntas, suma scores por arquetipo, devuelve
// el resultado dominante. Resultado es shareable vía URL + OG image generada.

export type TrainerArchetype =
  | 'sweeper'
  | 'stall'
  | 'balance'
  | 'hyperOffense'
  | 'gimmick'
  | 'bulkyOffense';

export interface QuizOption {
  text: string;
  scores: Partial<Record<TrainerArchetype, number>>;
}

export interface QuizQuestion {
  q: string;
  options: QuizOption[];
}

export const TRAINER_QUIZ: QuizQuestion[] = [
  {
    q: 'En el primer turno de una batalla competitiva tú...',
    options: [
      {
        text: 'Pongo Stealth Rock o Spikes — gano el long game con chip damage',
        scores: { stall: 3, balance: 2, bulkyOffense: 1 },
      },
      {
        text: 'Mando mi lead más rápido y empiezo a golpear desde turno 1',
        scores: { hyperOffense: 3, sweeper: 2 },
      },
      {
        text: 'Setup con Dragon Dance / Swords Dance — preparo el sweep',
        scores: { sweeper: 3, hyperOffense: 1 },
      },
      {
        text: 'Trick Room / Tailwind / lluvia — cambio las reglas del campo',
        scores: { gimmick: 3, balance: 1 },
      },
    ],
  },
  {
    q: 'Tu Pokémon favorito del meta es...',
    options: [
      {
        text: 'Dragapult — velocidad y mixed offense',
        scores: { sweeper: 3, hyperOffense: 2 },
      },
      {
        text: 'Gliscor — Toxic Heal + Protect = eternidad',
        scores: { stall: 3 },
      },
      {
        text: 'Kingambit — late-game cleaner con Supreme Overlord',
        scores: { bulkyOffense: 3, sweeper: 1 },
      },
      {
        text: 'Ditto / Smeargle — algo random que rompa el meta',
        scores: { gimmick: 3 },
      },
    ],
  },
  {
    q: 'Cuando enfrentas un equipo Stall...',
    options: [
      {
        text: 'Saco mi wallbreaker más bestia y rompo todo',
        scores: { hyperOffense: 3, bulkyOffense: 2 },
      },
      {
        text: 'Calmadamente PP-stall sus moves más peligrosos',
        scores: { stall: 3 },
      },
      {
        text: 'Setup mi sweeper detrás de pivots seguros',
        scores: { sweeper: 3 },
      },
      {
        text: 'Taunt en switch + Knock Off → caos',
        scores: { balance: 2, gimmick: 2 },
      },
    ],
  },
  {
    q: 'Tu condición win-con ideal es...',
    options: [
      {
        text: '+2 Atk Dragon Dance con un sweeper +6 Speed',
        scores: { sweeper: 3 },
      },
      {
        text: 'Toxic + Recover hasta que el rival se rinda',
        scores: { stall: 3 },
      },
      {
        text: 'Trade favorable con cada Pokémon, momentum constante',
        scores: { balance: 3, bulkyOffense: 1 },
      },
      {
        text: '6-0 con un setup oscuro que nadie veía venir',
        scores: { gimmick: 3, hyperOffense: 1 },
      },
    ],
  },
  {
    q: 'Si tuvieras que elegir un solo move para tu equipo entero...',
    options: [
      { text: 'Earthquake — daño bruto y reliable', scores: { hyperOffense: 2, balance: 2 } },
      { text: 'Recover — la vida es eterna', scores: { stall: 3 } },
      { text: 'Swords Dance — boost al máximo', scores: { sweeper: 3 } },
      { text: 'Trick Room — invierto la velocidad', scores: { gimmick: 3 } },
    ],
  },
  {
    q: 'Tu item favorito para un sweeper es...',
    options: [
      { text: 'Life Orb — máximo daño, vida me da igual', scores: { hyperOffense: 3, sweeper: 1 } },
      { text: 'Leftovers — sustain es vida', scores: { stall: 3, bulkyOffense: 1 } },
      { text: 'Booster Energy — boost una vez y rompe', scores: { sweeper: 3 } },
      { text: 'Choice Scarf — velocidad y rezar', scores: { balance: 3 } },
    ],
  },
  {
    q: 'Cuando te encuentras a Tera Stellar Terapagos...',
    options: [
      {
        text: 'Le meto un priority hit antes de que se setupee',
        scores: { hyperOffense: 3 },
      },
      {
        text: 'Toxic + Protect + Recover loop',
        scores: { stall: 3 },
      },
      {
        text: 'Mi Kingambit Sucker Punch espera el momento exacto',
        scores: { bulkyOffense: 3, sweeper: 1 },
      },
      {
        text: 'Le mando un Ditto y disfruto el espejo',
        scores: { gimmick: 3 },
      },
    ],
  },
  {
    q: 'Después de perder una partida importante...',
    options: [
      {
        text: 'Reviso el replay y tweakeo los EV spreads de mi equipo',
        scores: { balance: 3, bulkyOffense: 2 },
      },
      {
        text: 'Decido que necesito MÁS damage en mi próximo team',
        scores: { hyperOffense: 3, sweeper: 1 },
      },
      {
        text: 'Añado otra capa de hazards y un cleric más',
        scores: { stall: 3 },
      },
      {
        text: 'Pruebo algo MÁS raro la próxima vez',
        scores: { gimmick: 3 },
      },
    ],
  },
];

export interface TrainerResult {
  id: TrainerArchetype;
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  /** 3 Pokémon icónicos del arquetipo (pokeapi ids) */
  iconicPokemon: number[];
  /** Color hint para UI/OG */
  accent: string;
}

export const TRAINER_RESULTS: Record<TrainerArchetype, TrainerResult> = {
  sweeper: {
    id: 'sweeper',
    title: 'El Setup Sweeper',
    emoji: '⚔️',
    tagline: '+2 y nadie te para',
    description:
      'Vives para el setup. Un Dragon Dance bien colocado, un Swords Dance en la cara del rival y boom — el equipo enemigo se desmorona en 2 turnos. Tu satisfacción máxima es ganar 6-0 con un solo Pokémon a +2.',
    iconicPokemon: [149, 887, 1006], // Dragonite, Dragapult, Iron Valiant
    accent: '#c084fc', // purple-400
  },
  stall: {
    id: 'stall',
    title: 'El Stall Master',
    emoji: '🛡️',
    tagline: 'Te ganaré… con paciencia',
    description:
      'La paciencia es tu superpoder. Toxic + Protect + Recover hasta que el rival pulse "Forfeit" por aburrimiento. Sabes cada move PP de memoria. Tus partidas duran 80+ turnos y te encanta.',
    iconicPokemon: [472, 211, 145], // Gliscor, Qwilfish, Zapdos
    accent: '#86efac', // green-300
  },
  balance: {
    id: 'balance',
    title: 'El Estratega Balance',
    emoji: '🎯',
    tagline: 'Cada Pokémon, su rol',
    description:
      'Eres el chess master del meta. Cada slot tiene un propósito: hazard setter, cleric, pivot, win-con. Lees las partidas dos turnos por adelantado y casi nunca cometes errores tácticos.',
    iconicPokemon: [727, 445, 248], // Incineroar, Garchomp, Tyranitar
    accent: '#60a5fa', // blue-400
  },
  hyperOffense: {
    id: 'hyperOffense',
    title: 'El Hyper Offense',
    emoji: '🔥',
    tagline: 'Atacar es la mejor defensa',
    description:
      'Defensa es para los débiles. Tu equipo: 6 atacantes Life Orb / Choice Specs, hazards turn 1 y a presionar hasta el final. Las partidas duran 12 turnos máximo — o ganas, o pierdes, pero nunca aburres.',
    iconicPokemon: [658, 887, 6], // Greninja, Dragapult, Charizard
    accent: '#f87171', // red-400
  },
  bulkyOffense: {
    id: 'bulkyOffense',
    title: 'El Bulky Offense',
    emoji: '🪨',
    tagline: 'Tanqueo y golpeo',
    description:
      'El mejor de los dos mundos. Pegas duro pero también aguantas. Assault Vest + EVs defensivos = sustain ofensivo. Tu Kingambit late-game es el terror del meta.',
    iconicPokemon: [983, 248, 968], // Kingambit, Tyranitar, Iron Hands
    accent: '#facc15', // yellow-400
  },
  gimmick: {
    id: 'gimmick',
    title: 'El Gimmick Master',
    emoji: '✨',
    tagline: 'Esto no debería funcionar',
    description:
      'Trick Room + Belly Drum Ditto + Fissure spam. Tus equipos rompen 7 reglas no escritas del meta y aún así ganas. Las ladders tiemblan cuando subes con tu último tech. El meta no te entiende — y eso te encanta.',
    iconicPokemon: [132, 488, 235], // Ditto, Cresselia, Smeargle
    accent: '#f472b6', // pink-400
  },
};

/** Calcula el arquetipo dominante a partir de las respuestas (índices por pregunta) */
export function computeTrainerResult(answers: number[]): TrainerArchetype {
  const totals: Record<TrainerArchetype, number> = {
    sweeper: 0,
    stall: 0,
    balance: 0,
    hyperOffense: 0,
    gimmick: 0,
    bulkyOffense: 0,
  };
  answers.forEach((optIdx, qIdx) => {
    const opt = TRAINER_QUIZ[qIdx]?.options[optIdx];
    if (!opt) return;
    for (const [k, v] of Object.entries(opt.scores)) {
      totals[k as TrainerArchetype] += v ?? 0;
    }
  });

  let winner: TrainerArchetype = 'balance';
  let max = -1;
  for (const [k, v] of Object.entries(totals)) {
    if (v > max) {
      max = v;
      winner = k as TrainerArchetype;
    }
  }
  return winner;
}

export const ALL_ARCHETYPES = Object.keys(TRAINER_RESULTS) as TrainerArchetype[];
