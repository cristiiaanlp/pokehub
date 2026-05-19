// Catálogo estático de guías SEO. Cada slug es una URL canónica
// /guides/[slug]. Los datos viven aquí porque queremos SSG completo
// (sin BD) y que Google los indexe inmediatamente.

export interface GuideSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: 'VGC' | 'OU' | 'Casual' | 'Estrategia';
  readingTime: string;
  publishedAt: string;
  heroPokemon: number[]; // ids para el banner
  intro: string;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'counters-vs-kingambit',
    title: 'Cómo contrarrestar a Kingambit en VGC 2026',
    description:
      'Kingambit domina el meta competitivo gracias a Supreme Overlord. Te enseñamos los 6 mejores counters, sets de prueba y posicionamiento.',
    category: 'VGC',
    readingTime: '6 min',
    publishedAt: '2026-05-15',
    heroPokemon: [983, 968, 503],
    intro:
      'Kingambit (#983) es probablemente el Pokémon más temido del meta SV gracias a su habilidad **Supreme Overlord** que escala con cada compañero KO. Veremos cómo neutralizarlo sin renunciar a tipos defensivos.',
    sections: [
      {
        heading: 'Por qué es tan dominante',
        body:
          'Supreme Overlord aumenta su Atk y SpAtk un 10% por cada miembro KOd. Sumado a Sucker Punch (prioridad) y Iron Head + Kowtow Cleave, se convierte en un sweeper de fin de partida casi imposible de revenge-killear.',
      },
      {
        heading: 'Los 6 mejores counters',
        body:
          'Estos Pokémon le ganan en intercambio 1v1 cuando Kingambit ya ha hecho un par de KOs, no antes:',
        bullets: [
          'Great Tusk — STAB Earthquake + Headlong Rush; resiste Iron Head.',
          'Iron Hands — Wild Charge + Drain Punch, no le teme a Sucker Punch si usa moves no-damage primero.',
          'Garchomp — Earthquake clean y resiste +1 Sucker Punch con HP investido.',
          'Volcanion / Rotom-Heat — Lava Plume / Overheat ignoran su Defensa alta.',
          'Skeledirge — Torch Song +1 SpA cada uso, lo cocina en 2 hits sin recibir mucho a cambio.',
          'Ting-Lu — Vessel of Ruin reduce el SpA enemigo, y Whirlwind anula Swords Dance.',
        ],
      },
      {
        heading: 'Trampas posicionales',
        body:
          'En dobles, nunca dejes a Kingambit limpiar la última pareja: matchea contra Tera Fairy / Tera Fighting antes del endgame. Una pareja Tera Fighting + Protect Support neutraliza el snowball.',
      },
      {
        heading: 'Items y sets recomendados de los counters',
        body:
          'Loaded Dice para Great Tusk (Rock Blast a través de Sashes), Booster Energy para Iron Hands, Heavy-Duty Boots para Skeledirge.',
      },
    ],
  },
  {
    slug: 'top-pokemon-vgc-reg-g',
    title: 'Top 10 Pokémon VGC Reg G (Mayo 2026)',
    description:
      'Ranking basado en Pikalytics: usage, win rate y combinaciones más vistas. Sets exactos y partners típicos.',
    category: 'VGC',
    readingTime: '8 min',
    publishedAt: '2026-05-10',
    heroPokemon: [1024, 1007, 1008],
    intro:
      'Datos en vivo de Pikalytics actualizados al ladder del último ciclo. Si quieres ver la versión interactiva con sets exactos, visita [/meta/champions](/meta/champions).',
    sections: [
      {
        heading: '1. Terapagos',
        body:
          'Tera Stellar STAB Tera Starstorm es lo más dañino de la generación. Casi siempre con Calm Mind + Protect en forma Tera-Stellar.',
      },
      {
        heading: '2. Miraidon',
        body:
          'Setter de terreno eléctrico semipermanente. Comparte slot con Iron Hands (Wild Charge x2 STAB).',
      },
      {
        heading: '3. Calyrex-Shadow',
        body:
          'As One (Spectrier) + Astral Barrage = barrido inmediato. Counter: Dark types con Sucker Punch.',
      },
      {
        heading: '4-10: el resto',
        body:
          'Urshifu-Rapid Strike, Whimsicott (Tailwind soft), Rillaboom (Grassy Glide spam), Incineroar (pivote por excelencia), Ogerpon-Hearthflame, Flutter Mane, Iron Hands.',
      },
      {
        heading: 'Cómo construir alrededor de uno',
        body:
          'Pillar (Miraidon) + Restricted (Terapagos / Calyrex) + Speed control (Tornadus o Whimsicott) + Redirección (Amoonguss) + Pivote (Incineroar) + Cierre (Urshifu-RS).',
      },
    ],
  },
  {
    slug: 'mejores-leads-trick-room',
    title: 'Mejores leads para Trick Room en VGC',
    description:
      'Trick Room invierte el orden de velocidad. Aquí los 5 setters más fiables y los compañeros que aprovechan la ventaja.',
    category: 'Estrategia',
    readingTime: '5 min',
    publishedAt: '2026-05-05',
    heroPokemon: [474, 706, 437],
    intro:
      'Trick Room dura 5 turnos. Los primeros 2 turnos son críticos: necesitas un setter resistente y partners lentos que peguen MUY fuerte mientras dure.',
    sections: [
      {
        heading: 'Setters fiables (con Mental Herb / Lum Berry)',
        body:
          'El item Mental Herb cancela el primer Taunt del oponente. Lum Berry te cubre confusion / sleep en el turno crucial.',
        bullets: [
          'Indeede-F + Psychic Surge: garantiza la subida y bloquea prioridad enemiga.',
          'Cresselia: bulky, también lleva Lunar Dance para resetear al ace.',
          'Hatterene: Magic Bounce devuelve Taunt al rival.',
          'Porygon2 con Eviolite + Trick Room.',
          'Dusclops con Eviolite — el más bulky de todos.',
        ],
      },
      {
        heading: 'Aces lentos que destruyen',
        body:
          'Ursaluna, Iron Hands, Hatterene ofensivo, Calyrex-Ice. Velocidad 50 o menos = primero bajo TR.',
      },
      {
        heading: 'Cómo cerrar el matchup en turno 5',
        body:
          'Cuando TR está por acabar, pivota hacia un Pokémon rápido que aproveche el speed control normal (típicamente Tornadus con Tailwind).',
      },
    ],
  },
  {
    slug: 'tier-list-tipos-defensivos',
    title: 'Tier list: mejores tipos defensivos en Gen 9',
    description:
      'Análisis de los tipos con menos debilidades y mejores resistencias en la generación 9. Útil para builder.',
    category: 'OU',
    readingTime: '4 min',
    publishedAt: '2026-04-28',
    heroPokemon: [798, 805, 887],
    intro:
      'No todos los tipos defienden igual. Esta tier list considera: nº de debilidades, nº de resistencias, inmunidades, y la prevalencia de los tipos atacantes en el meta actual.',
    sections: [
      {
        heading: 'S Tier — los gigantes',
        body:
          '**Acero/Volador** (Corviknight): 1 sola debilidad x4 (Electric) y 6 resistencias. Estrella defensiva.',
        bullets: [
          'Acero/Volador (Corviknight, Scizor-Mega).',
          'Acero/Hada (Magearna, Tinkaton): inmunidad a Dragon + cobertura limpia.',
          'Veneno/Acero (Glimmora, Toxapex): muchas resistencias, immune a Toxic.',
        ],
      },
      {
        heading: 'A Tier — sólidos',
        body:
          'Agua/Tierra (Quagsire/Clodsire), Fantasma/Hada (Mimikyu), Planta/Acero (Kartana, Ferrothorn).',
      },
      {
        heading: 'B Tier — situacionales',
        body:
          'Fuego/Agua (Volcanion), Dragón/Tierra (Garchomp). Bien pero con holes.',
      },
      {
        heading: 'Tipos a evitar como combinación defensiva',
        body:
          'Hielo (4 debs nuevas), Roca solo (Stealth Rock auto-kill), Lucha/Hada (no, espera, esto es bueno).',
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
