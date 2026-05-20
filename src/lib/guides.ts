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
  category: 'VGC' | 'OU' | 'Casual' | 'Estrategia' | 'Mecánicas' | 'Principiante';
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
  {
    slug: 'counters-vs-miraidon',
    title: 'Cómo contrarrestar a Miraidon en VGC Reg G',
    description:
      'Miraidon es el restrictado más usado de la temporada. Hadron Engine + Electric Terrain + Draco Meteor lo convierten en sweeper inmediato. Estos counters lo paran.',
    category: 'VGC',
    readingTime: '7 min',
    publishedAt: '2026-05-25',
    heroPokemon: [1008, 968, 1024],
    intro:
      'Miraidon (#1008) abre **40.2% de partidas VGC Reg G** según Pikalytics. Su set estándar es **Choice Specs** con Draco Meteor + Electroshock + Volt Switch + Dazzling Gleam. Si no lo cuentas, te limpia.',
    sections: [
      {
        heading: 'Por qué da tanto miedo',
        body:
          '**Hadron Engine** sube su SpA un 33% al entrar y crea Electric Terrain (también boost Electroshock). Sin Tera, su Electroshock pega 130 BP + STAB + boost de terreno + 33% Hadron = roll OHKO contra cualquier Pokémon que no resista.',
      },
      {
        heading: 'Los counters definitivos',
        body:
          'Pokémon que pueden quedarse delante de Miraidon y darle vuelta:',
        bullets: [
          'Great Tusk — inmune a Electric, Booster Atk + Headlong Rush 2HKO.',
          'Ting-Lu — Vessel of Ruin reduce SpA enemigo 25%. Ruination dump consistente.',
          'Terapagos Stellar — Tera Starstorm OHKO si está fully invested SpA.',
          'Hisuian Goodra — Shell Armor + bulk especial muy alto, tanquea Electroshocks.',
          'Iron Hands — Booster Atk + Drain Punch recupera mientras pega.',
          'Calyrex-Shadow — outspeedea y OHKO con Astral Barrage (si no es Tera Fairy).',
        ],
      },
      {
        heading: 'Movimientos a temer',
        body:
          'Cuando Miraidon es Tera Fairy (situacional), gana inmunidad a Dragon y resistencia clave contra Dark. Su Dazzling Gleam pasa a STAB.',
      },
      {
        heading: 'Plays clave',
        body:
          'Nunca dejes que Hadron Engine procce gratis: ten un Pokémon listo para forzar switch en turno 1. Tailwind aliada permite a tus mons +base 100 outspeedearlo. Recuerda que Choice Specs lo bloquea a un movimiento — fuerza Electroshock y trae tu Ground.',
      },
    ],
  },
  {
    slug: 'counters-vs-calyrex-shadow',
    title: 'Counters definitivos contra Calyrex-Shadow',
    description:
      'Calyrex-Shadow + Astral Barrage es probablemente el ataque más roto del juego competitivo. As One (Spectrier) le da +1 SpA por KO. Aquí los counters reales.',
    category: 'VGC',
    readingTime: '6 min',
    publishedAt: '2026-05-24',
    heroPokemon: [898, 983, 983],
    intro:
      '**Calyrex-Shadow Rider** tiene el At. Especial más alto del juego competitivo (165). Su Astral Barrage (120 BP Fantasma con prioridad de uso en doubles) golpea a ambos rivales y le da +1 SpA por KO (As One). Si lo dejas vivo más de 2 turnos, pierdes.',
    sections: [
      {
        heading: 'La trampa Tera',
        body:
          'Casi siempre Tera Fairy o Tera Normal para reducir su 4x weak a Dark y Ghost. Si juegas Sucker Punch Kingambit, recuerda que tras Tera Fairy ya no es 4x weak — solo neutral.',
      },
      {
        heading: 'Counters físicos',
        body:
          'Su SpD base 100 es OK pero su DEF base 80 es horrible. Pega con lo físico:',
        bullets: [
          'Kingambit (Tera Dark, Sucker Punch) — prioridad + STAB OHKO si no es Tera Fairy.',
          'Urshifu Single-Strike (Surging Strikes ignora Detect)— pero solo Single, no Rapid.',
          'Garchomp scarf + Earthquake — outspeedea y limpia.',
          'Annihilape — Rage Fist escala con cada hit. Inmune a Astral Barrage (es tipo Lucha/Fantasma).',
        ],
      },
      {
        heading: 'Counters especiales',
        body:
          'Sin Tera Fairy, le pegas con Dark/Ghost especial: Gholdengo (Shadow Ball), Hisuian Typhlosion (Shadow Ball + Eruption STAB).',
      },
      {
        heading: 'Trick Room reversal',
        body:
          'Calyrex Shadow es base 150 Spe. Bajo TR, se convierte en el más lento — cualquier sweeper TR (Iron Hands, Ursaluna, Calyrex-Ice) lo destruye antes de que mueva. Setear TR turno 1 con Indeedee-F + Calyrex-Ice es la composición clásica anti-Shadow Rider.',
      },
    ],
  },
  {
    slug: 'mejores-leads-rain-vgc',
    title: 'Mejores leads para equipos Rain en VGC',
    description:
      'Lluvia activada al entrar = Water STAB ×1.5, Thunder 100% accuracy. Aquí los setters y abusers fiables del meta SV.',
    category: 'Estrategia',
    readingTime: '5 min',
    publishedAt: '2026-05-23',
    heroPokemon: [792, 658, 130],
    intro:
      'La lluvia (Rain) en Gen 9 dura **5 turnos** (o infinitos si llevas Damp Rock 8). Sube los STABs Water al 1.5×, baja Fire al 0.5×, y permite que Thunder y Hurricane tengan **100% precisión**. El timing del setup es clave.',
    sections: [
      {
        heading: 'Setters principales',
        body:
          'Los Pokémon que activan lluvia automáticamente al entrar gracias a su habilidad:',
        bullets: [
          'Pelipper (Drizzle) — el setter por excelencia. Espacio para Tailwind support.',
          'Politoed (Drizzle) — más bulky que Pelipper, mejor en singles.',
          'Kyogre (Drizzle) — restrictado en Reg G. Setea Y abusea él mismo con Water Spout.',
        ],
      },
      {
        heading: 'Abusers principales (Swift Swim)',
        body:
          'Pokémon con Swift Swim doblan velocidad bajo lluvia:',
        bullets: [
          'Barraskewda — base 136 Spe → 272 bajo lluvia. Liquidation OHKO neutrals.',
          'Floatzel — Wave Crash + Aqua Jet priority.',
          'Greninja (Protean en SV, sin SS — pero abusa Hydro Pump 100% bajo lluvia).',
          'Iron Boulder con Booster Spe activado (no Swift Swim, pero rápido igual).',
        ],
      },
      {
        heading: 'Compañeros esenciales',
        body:
          'Rotom-Wash (Hydro Pump + Volt Switch pivote), Iron Bundle (Hydro Pump 100% bajo lluvia + Freeze-Dry para spam de Water), Tornadus (Tailwind backup + Hurricane 100%).',
      },
      {
        heading: 'Las trampas Tera',
        body:
          'Tera Water en tu sweeper ofensivo te da STAB×1.5 + lluvia×1.5 = 2.25× damage si Tera y Rain coinciden. Tera Eléctrico en Pelipper lo convierte en immune a Ground y le da super-efectivo en Water (espejo).',
      },
    ],
  },
  {
    slug: 'mejores-leads-sun-vgc',
    title: 'Mejores leads para equipos Sun en VGC',
    description:
      'Sol activado = Fire STAB ×1.5, Solar Beam 1 turno, Chlorophyll dobla velocidad. Los mejores setters y abusers del meta SV.',
    category: 'Estrategia',
    readingTime: '5 min',
    publishedAt: '2026-05-22',
    heroPokemon: [6, 1006, 470],
    intro:
      'El Sol (Sun) en Gen 9 dura **5 turnos** (8 con Heat Rock). Sube Fire al 1.5×, baja Water al 0.5×, permite Solar Beam instantáneo, y los Pokémon con Chlorophyll doblan velocidad. Sun teams son menos comunes que Rain pero matchup-dependientes.',
    sections: [
      {
        heading: 'Setters principales',
        body:
          'Los Pokémon que activan sol automáticamente:',
        bullets: [
          'Torkoal (Drought) — el setter más bulky. Eruption full HP = devastador.',
          'Groudon (Drought) — restrictado. Setea Y abusea con Precipice Blades.',
          'Iron Moth (Quark Drive Spe activado por sol indirectamente) — abuser ultra rápido.',
          'Mega-Charizard Y (Drought con item Charizardite Y — no legal en VGC Reg G).',
        ],
      },
      {
        heading: 'Abusers Chlorophyll',
        body:
          'Doblan Spe bajo sol:',
        bullets: [
          'Venusaur — Sunny Day + Solar Beam combo.',
          'Lilligant — Quiver Dance + Pollen Puff/Leaf Storm.',
          'Whimsicott con Sunny Day — más utility que damage.',
        ],
      },
      {
        heading: 'Abusers Fire',
        body:
          'Aprovechan el +1.5x sin necesitar Chlorophyll:',
        bullets: [
          'Iron Moth — Booster Energy activado, Fiery Dance spam.',
          'Houndstone — Sucker Punch + Last Respects.',
          'Skeledirge — Torch Song escala SpA y aprovecha sol.',
        ],
      },
      {
        heading: 'Counter-comp',
        body:
          'Si te enfrentas a Sun, lleva Tyranitar/Hippowdon (Sand) o Pelipper (Rain) para sobrescribir el weather. Pokémon con Heat Rock + Sun setup en Trick Room (Torkoal con Quiet) son un combo bestia que pocos cubren.',
      },
    ],
  },
  {
    slug: 'guia-evs-principiantes',
    title: 'Qué son los EVs (Esfuerzos): guía completa para nuevos',
    description:
      'EVs son los puntos que entrenan a tu Pokémon. Cada Pokémon puede tener máximo 510 EVs totales, 252 por stat. Aquí cómo distribuirlos según tu rol.',
    category: 'Principiante',
    readingTime: '6 min',
    publishedAt: '2026-05-20',
    heroPokemon: [25, 6, 9],
    intro:
      '**EVs (Effort Values, Esfuerzos)** son una mecánica oculta desde Pokémon Rojo/Azul. En competitivo son la diferencia entre un Pokémon mediocre y uno tier-S. Te explico qué son, cuántos pones, y cómo entrenarlos rápido en Scarlet/Violet.',
    sections: [
      {
        heading: '¿Qué hacen exactamente?',
        body:
          'Cada 4 EVs en una stat = +1 al stat real al nivel 100 (al nivel 50 es +0.5, así que 8 EVs = +1). Máximo 252 EVs por stat = +63 stat al nivel 100. Máximo 510 EVs totales por Pokémon — no puedes maxear todas las stats.',
      },
      {
        heading: 'Distribuciones estándar',
        body:
          'Las 4 distribuciones más comunes en competitivo:',
        bullets: [
          '**252 Atk / 252 Spe / 4 HP** — sweeper físico. El stat extra de HP no importa, los 4 sobrantes "no rompen el aprovechamiento".',
          '**252 HP / 252 Def / 4 SpD** — wall físico. Tank de hits físicos.',
          '**252 HP / 252 SpD / 4 Def** — wall especial.',
          '**252 SpA / 252 Spe / 4 HP** — sweeper especial.',
        ],
      },
      {
        heading: 'Cómo entrenar EVs rápido en SV',
        body:
          'Game Freak ha hecho que entrenar EVs sea trivial en SV:',
        bullets: [
          '**Vitamins** (Proteína, Calcio, Carbono, Zinc, Hierro): +10 EVs cada uno, hasta 252. Cuestan poco en boutique.',
          '**Power Items** (Power Bracer, Belt, etc): tu Pokémon gana +8 EVs extra de la stat correspondiente al ganar combate.',
          '**Pokérus** (raro pero existe): dobla EVs ganados en combate.',
          '**Cocinar** sándwiches con Encounter Power: spawnea Pokémon que dan los EVs que necesitas.',
        ],
      },
      {
        heading: 'Errores comunes',
        body:
          '1) Repartir 85+85+85+85 EVs entre todas las stats — peor que cualquier distribución 252/252. 2) Olvidarse de Speed — siempre maxear o llegar a un benchmark. 3) Invertir EVs sin nature óptima — los EVs +nature se complementan, no se sustituyen.',
      },
      {
        heading: 'Herramientas',
        body:
          'Usa nuestro [Stat Calculator](/tools/stat-calc) para ver el impacto exacto de cualquier distribución, y el [EV Optimizer](/tools/ev-optimizer) para encontrar EVs mínimos para outspeedear benchmarks del meta.',
      },
    ],
  },
  {
    slug: 'guia-ivs-scarlet-violet',
    title: 'IVs perfectos en Pokémon Scarlet/Violet: guía completa',
    description:
      'Los IVs son la genética innata de tu Pokémon. Aquí cómo conseguir IVs 31 (perfectos) en SV mediante Egg Moves, Ditto extranjero y la nueva técnica Mochi Power.',
    category: 'Principiante',
    readingTime: '7 min',
    publishedAt: '2026-05-19',
    heroPokemon: [132, 901, 905],
    intro:
      '**IVs (Individual Values)** son la "genética" oculta de cada Pokémon. Cada stat tiene un IV de 0 a 31. Un IV de 31 = +31 al stat al nivel 100. Para competitivo necesitas IVs 31 en todas las stats relevantes. Te explico cómo conseguirlos en SV sin perder la cabeza.',
    sections: [
      {
        heading: '¿Cómo afectan los IVs?',
        body:
          'Un IV 31 vs 0 = 31 stat points al nivel 100, 15 al nivel 50. En velocidad, un IV bajo puede hacer que pierdas un benchmark crítico. Atk lo quieres a 0 SI eres special attacker (para que confusion damage te haga menos daño).',
      },
      {
        heading: 'El método clásico — breeding',
        body:
          'Los huevos heredan IVs. Con Destiny Knot (item), 5 IVs aleatorios de los 2 padres pasan al huevo. Encadenando Pokémon con IVs altos vas hacia 6 IV 31:',
        bullets: [
          'Paso 1: consigue un Ditto extranjero (Masuda Method da shiny rate alto).',
          'Paso 2: empareja con un Pokémon de tu deseada especie. Destiny Knot en uno.',
          'Paso 3: descarta huevos hasta tener 4-5 IVs perfectos heredables.',
          'Paso 4: empareja entre hermanos para ir agregando IV 31s.',
        ],
      },
      {
        heading: 'El método rápido SV — Mochi Power',
        body:
          'En la DLC The Indigo Disk añadieron los **Bottle Caps** comprables + los **Mochi Power**:',
        bullets: [
          'Bottle Cap dora un IV a 31 (Hyper Training, requiere nivel 100).',
          'Gold Bottle Cap maxea TODOS los IVs a 31.',
          'Los consigues en BP shop (Battle Points) tras subir 10 niveles en League Club, o cocinando sándwiches con Sparkling Power 3.',
        ],
      },
      {
        heading: 'Atajo competitivo — alquilar online',
        body:
          'En la Cathedral (Blueberry Academy) puedes alquilar equipos de otros jugadores con IVs ya perfectos. Solo válido para ladder online, NO para torneos oficiales en persona.',
      },
      {
        heading: 'IV 0 cuando interesan',
        body:
          'Querer IV 31 NO siempre es correcto: con Trick Room necesitas IV Spe = 0 para ser el más lento. Con special attacker, IV Atk = 0 reduce el daño de confusion self-hit.',
      },
    ],
  },
  {
    slug: 'tier-list-naturalezas',
    title: 'Tier list de naturalezas Pokémon: cuál usar y por qué',
    description:
      'Las 25 naturalezas afectan ±10% una stat. Algunas son universalmente buenas, otras son trampa. Aquí el ranking completo con uso recomendado.',
    category: 'Estrategia',
    readingTime: '5 min',
    publishedAt: '2026-05-17',
    heroPokemon: [445, 376, 282],
    intro:
      'Hay **25 naturalezas** en Pokémon. 5 son **neutras** (no cambian nada) y 20 dan +10%/-10% en pares de stats. Elegir bien marca una diferencia abismal: una nature mal elegida puede arruinar al mejor Pokémon.',
    sections: [
      {
        heading: 'S Tier — las universales',
        body:
          'Funcionan en casi cualquier set:',
        bullets: [
          '**Adamant** (+Atk / −SpA) — sweepers físicos sin special move.',
          '**Modest** (+SpA / −Atk) — sweepers especiales sin physical move.',
          '**Jolly** (+Spe / −SpA) — physical sweepers que necesitan outspeedear.',
          '**Timid** (+Spe / −Atk) — special sweepers que necesitan outspeedear.',
        ],
      },
      {
        heading: 'A Tier — situacionales fuertes',
        body:
          'Buenísimas en sus contextos:',
        bullets: [
          '**Bold** (+Def / −Atk) — wall físico especial-attacker.',
          '**Calm** (+SpD / −Atk) — wall especial special-attacker.',
          '**Impish** (+Def / −SpA) — wall físico physical-attacker.',
          '**Careful** (+SpD / −SpA) — wall especial physical-attacker.',
        ],
      },
      {
        heading: 'B Tier — para Trick Room / niche',
        body:
          'Solo en composiciones específicas:',
        bullets: [
          '**Brave** (+Atk / −Spe) — sweeper físico en TR. Iron Hands clásico.',
          '**Quiet** (+SpA / −Spe) — sweeper especial en TR.',
          '**Relaxed** (+Def / −Spe) — wall físico TR.',
          '**Sassy** (+SpD / −Spe) — wall especial TR.',
        ],
      },
      {
        heading: 'D Tier — evitar casi siempre',
        body:
          'Las **neutras** (Hardy, Docile, Serious, Bashful, Quirky): no aprovechas el +10% que la mecánica regala. Solo válidas para Pokémon que tienen ambos Atk y SpA relevantes (raro). **Hasty, Naive, Lonely, Naughty**: bajan defensas — peligroso en frágiles.',
      },
      {
        heading: 'Cómo conseguir la nature que quieras',
        body:
          'Cambia el item **Everstone** a un Pokémon en breeding: pasa su nature al huevo. En SV también puedes usar Mints (Adamant Mint, Jolly Mint, etc) en cualquier Pokémon nivel 100 para cambiar la nature efectiva sin alterar la real. Los Mints están en la Treasure Pokémon League Center o de BP.',
      },
    ],
  },
  {
    slug: 'top-10-moves-fisicos-gen9',
    title: 'Top 10 ataques físicos en Gen 9 (SV)',
    description:
      'Los movimientos físicos más rotos del meta actual ordenados por daño, fiabilidad y prevalencia. Spoiler: Headlong Rush está al borde del ban.',
    category: 'Estrategia',
    readingTime: '6 min',
    publishedAt: '2026-05-14',
    heroPokemon: [984, 887, 887],
    intro:
      'Gen 9 introdujo nuevos moves físicos y rebalanceó los antiguos. Estos son los 10 más impactantes del meta SV competitivo, ordenados por **valor competitivo real** (no solo BP).',
    sections: [
      {
        heading: '1. Headlong Rush (Tierra · 120 BP)',
        body:
          'Great Tusk y Ursaluna. STAB ×1.5 + boost Booster Atk = devastador. Recoil drop de Def/SpD del usuario es relevante.',
      },
      {
        heading: '2. Kowtow Cleave (Oscuro · 85 BP)',
        body:
          'Kingambit signature move. **Nunca falla** (como Sure Hit) — ignora evasion boosts, Lock-On, Bright Powder.',
      },
      {
        heading: '3. Surging Strikes (Agua · 25 BP × 3)',
        body:
          'Urshifu Rapid-Strike signature. Siempre crítico. Total 75 BP × 1.5 (crit) = 112.5 BP STAB. Ignora screens.',
      },
      {
        heading: '4. Wicked Blow (Oscuro · 80 BP)',
        body:
          'Urshifu Single-Strike signature. Siempre crítico. Ignora screens.',
      },
      {
        heading: '5. Bitter Blade (Fuego · 90 BP)',
        body:
          'Ceruledge signature. Recupera 50% del daño infligido — sustain sweeper.',
      },
      {
        heading: '6. Glacial Lance (Hielo · 130 BP)',
        body:
          'Calyrex-Ice signature. Spread move (golpea a ambos en doubles, daño × 0.75 cada uno). Daño absurdo bajo TR.',
      },
      {
        heading: '7. Stone Axe (Roca · 65 BP)',
        body:
          'Kleavor signature. Coloca Stealth Rock al rival como efecto secundario 100%.',
      },
      {
        heading: '8. Triple Axel (Hielo · 20 BP × 3)',
        body:
          '40+60+120 BP escalando. Total 120 BP si conecta los 3, pero accuracy 90%. Cinderace, Mienshao.',
      },
      {
        heading: '9. Rage Fist (Fantasma · 50 BP escalando)',
        body:
          'Annihilape signature. **+50 BP por cada hit recibido** durante la partida. Después de 4 hits ya es 250 BP base. Endgame KO.',
      },
      {
        heading: '10. Heavy Slam (Acero · variable)',
        body:
          'Iron Hands, Donphan. BP depende del peso del usuario vs target — Iron Hands (380kg) suele estar en 120 BP.',
      },
    ],
  },
  {
    slug: 'habilidades-rotas-sv-meta',
    title: 'Las 8 habilidades más rotas del meta SV competitivo',
    description:
      'No todas las habilidades son iguales. Algunas son auténticos engaños de Game Freak. Aquí las top 8 que dominan el meta competitivo Gen 9.',
    category: 'Estrategia',
    readingTime: '7 min',
    publishedAt: '2026-05-12',
    heroPokemon: [983, 1008, 968],
    intro:
      'Una habilidad bien elegida puede valer más que 100 stat points. Estas 8 son las que actualmente **dominan** el meta SV competitivo y por las que ciertos Pokémon están al borde del ban.',
    sections: [
      {
        heading: '1. Supreme Overlord (Kingambit)',
        body:
          'Atk y SpA del usuario suben 10% por cada compañero del equipo KOed. Con 5 compañeros muertos = **+50% damage**. Combinado con Sucker Punch prioritario, late-game cleaner imposible de revenge-killear.',
      },
      {
        heading: '2. Hadron Engine (Miraidon)',
        body:
          'Crea Electric Terrain Y boost SpA 33% al entrar. Es como tener Choice Specs sin perder flexibilidad de movimiento.',
      },
      {
        heading: '3. Orichalcum Pulse (Koraidon)',
        body:
          'Versión física: crea sol Y sube Atk 33% al entrar. Mismo nivel que Hadron pero físico.',
      },
      {
        heading: '4. As One (Calyrex-Shadow/Ice)',
        body:
          '**+1 SpA o Atk por cada KO conseguido** (Spectrier/Glastrier respectivamente) + immune to Intimidate. Compounding boost — empieza débil, termina imparable.',
      },
      {
        heading: '5. Beast Boost (Iron Valiant, otros UBs)',
        body:
          '+1 a la stat más alta al conseguir un KO. Hace que el sweeper escale automáticamente sin necesitar Swords Dance.',
      },
      {
        heading: '6. Protosynthesis / Quark Drive (Paradox)',
        body:
          'Activado por sol/terreno, sube +30% la stat más alta del Pokémon. Booster Energy permite proccarlo manualmente. Hace que cualquier Paradox sea un threat con el item correcto.',
      },
      {
        heading: '7. Sword of Ruin / Beads of Ruin (Treasures)',
        body:
          'Wo-Chien, Chien-Pao, Ting-Lu, Chi-Yu. Cada uno reduce una stat de TODOS los demás Pokémon en campo (suya incluida en algunos casos). Hace stack reductions con team building specific.',
      },
      {
        heading: '8. Protean (Greninja, Cinderace baneados en algunos formatos)',
        body:
          'El usuario cambia a tipo del último move usado. Todo es STAB. Razón principal por la que estos Pokémon están baneados en OU.',
      },
    ],
  },
  {
    slug: 'guia-nuzlocke-completo',
    title: 'Guía Nuzlocke completa: reglas, estrategia y consejos',
    description:
      'Nuzlocke es el modo casual más popular: solo capturas el primer Pokémon de cada ruta y si muere, fuera. Aquí las reglas, variantes y cómo no llorar.',
    category: 'Casual',
    readingTime: '8 min',
    publishedAt: '2026-05-10',
    heroPokemon: [10, 16, 19],
    intro:
      'El **Nuzlocke Challenge** transforma cualquier Pokémon casual en una experiencia de tensión real. Si tu Pikachu muere, está muerto. Si fallas la captura del primer Pokémon de la ruta, no puedes capturar más en esa ruta. Te enseño las reglas oficiales, las variantes populares y cómo sobrevivir.',
    sections: [
      {
        heading: 'Las 3 reglas básicas',
        body:
          'Originalmente diseñadas por el comic-artist Nuzlocke (2010):',
        bullets: [
          '**Regla 1**: si un Pokémon cae a 0 HP, está **muerto permanentemente**. Hay que liberarlo o moverlo a una caja "cementerio".',
          '**Regla 2**: solo puedes **capturar el primer Pokémon salvaje** que encuentres en cada ruta nueva. Si falla la captura o se mata accidentalmente, has perdido la oportunidad de esa ruta.',
          '**Regla 3**: todos los Pokémon **deben tener un apodo**. Te encariñas más, sufres más cuando mueren.',
        ],
      },
      {
        heading: 'Variantes populares',
        body:
          'Cada comunidad añade reglas extra:',
        bullets: [
          '**Hardcore Nuzlocke**: no puedes usar items en combate (Potions, X-Attack), niveles del equipo capeados al nivel del próximo gym leader.',
          '**Wedlocke**: empareja Pokémon en "matrimonios". Solo puedes usar al "marido/esposa" del otro si uno muere.',
          '**Cagelocke**: solo puedes ver tu equipo durante combates Gym. Entre tanto, todos en la caja.',
          '**Egglocke**: tu inventario inicial son huevos misteriosos (donaciones de amigos).',
          '**Randomlocke**: combina Nuzlocke + Randomizer (Pokémon, moves, evoluciones randomizados).',
        ],
      },
      {
        heading: 'Cómo sobrevivir más turns',
        body:
          'Trucos clave:',
        bullets: [
          'Lleva siempre **un Pokémon overlevel** que pueda forzar 1v1 si tu lead muere.',
          'Compra **Revives** y **Full Restores** masivos antes de Gyms.',
          '**Save state grinding** (en emulador): muchas comunidades lo permiten en grinding antes de bosses.',
          '**Sleep moves** (Hipnosis, Spore) son tus mejores amigos vs bosses.',
          'Estudia los **movesets de los Gym Leaders** antes — un set inesperado puede borrarte el equipo entero.',
        ],
      },
      {
        heading: 'Mejores Pokémon SV para Nuzlocke',
        body:
          'En Pokémon Scarlet/Violet hay favoritos comunitarios por su disponibilidad temprana y resiliencia:',
        bullets: [
          '**Lechonk → Oinkologne**: early-game tanque + access a Stomping Tantrum.',
          '**Tinkatink → Tinkaton**: STAB Acero/Hada bestia. Sobrevive todo el game.',
          '**Pawmi → Pawmot**: Eléctrico/Lucha. Cobertura ofensiva enorme.',
          '**Charcadet → Armarouge/Ceruledge**: tarda pero termina S-tier.',
        ],
      },
      {
        heading: 'Probarlo en PokéHub',
        body:
          'Tenemos un [tracker de Nuzlocke](/casual/nuzlocke) integrado donde puedes registrar tus runs, marcar muertes y compartir progress.',
      },
    ],
  },
  {
    slug: 'mejores-equipos-trick-room-vgc',
    title: 'Mejores composiciones de equipo Trick Room en VGC 2026',
    description:
      'Trick Room invierte el orden de speed. Los mejores leads, aces y partners para una composición ganadora en el meta actual.',
    category: 'VGC',
    readingTime: '7 min',
    publishedAt: '2026-05-08',
    heroPokemon: [898, 776, 706],
    intro:
      '**Trick Room** (TR) sigue siendo una de las composiciones más temidas del meta VGC. Cuando funciona, controlas el juego completo. Cuando no se setea, eres carne de cañón. Aquí los equipos que actualmente dominan Reg G.',
    sections: [
      {
        heading: 'El core: setter + ace',
        body:
          'Composición clásica de 2 que define todo lo demás:',
        bullets: [
          '**Indeedee-F + Calyrex-Ice**: setter prankster + ace lento con Glacial Lance spread. La king comp histórica.',
          '**Cresselia + Ursaluna**: setter con Lunar Dance + ace con Headlong Rush + Facade.',
          '**Hatterene + Iron Hands**: Magic Bounce setter + ace eléctrico/lucha.',
          '**Porygon2 + Calyrex-Ice**: Eviolite setter ultra-bulky con Recover.',
        ],
      },
      {
        heading: 'Speed Control redundante',
        body:
          'TR puede fallar — necesitas un Pokémon que pueda controlar speed normal:',
        bullets: [
          'Tornadus Tailwind — apoyo si Trick Room no se setea.',
          'Whimsicott Prankster Tailwind — alternativa más bulky.',
        ],
      },
      {
        heading: 'Disruptors anti-TR',
        body:
          'Para counterar TR enemigo:',
        bullets: [
          'Tu propia Hatterene/Indeedee-F — setea TR cuando el rival lo intenta, lo cancela.',
          'Encore (Whimsicott, Iron Valiant) — bloquea al setter en su move anterior.',
          'Taunt (Tornadus, Iron Valiant) — bloquea TR si predices la setup turn.',
        ],
      },
      {
        heading: 'Items recomendados',
        body:
          'En el ace: **Life Orb** (más damage) o **Sitrus Berry** (sustain). En el setter: **Mental Herb** (cancela primer Taunt), **Lum Berry** (cura sleep/confusion) o **Eviolite** (Porygon2).',
      },
      {
        heading: 'El bot de timing',
        body:
          'TR dura **5 turnos**. Si lo seteas en T1, te queda T2-T5 para hacer daño. **No malgastes T1 con setup ofensivo del ace** — pivota a TR el primer turno o no funciona.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // BEGINNER GUIDES — top-of-funnel SEO en español
  // ═══════════════════════════════════════════════════════════════════════

  {
    slug: 'como-empezar-pokemon-competitivo',
    title: 'Cómo empezar en Pokémon competitivo desde cero',
    description:
      'Guía completa para principiantes: qué necesitas, formatos disponibles, dónde jugar gratis (Showdown) y los primeros pasos para construir tu primer equipo competitivo.',
    category: 'Principiante',
    readingTime: '10 min',
    publishedAt: '2026-05-20',
    heroPokemon: [445, 887, 6],
    intro:
      'Pokémon competitivo intimida al principio. Hay términos raros (EVs, IVs, STAB, Tera), formatos que no entiendes (VGC, OU, Ubers) y cientos de Pokémon con stats que parecen sacados de una hoja de cálculo. **Buenas noticias**: se puede empezar gratis, sin comprar nada, y en 2 semanas ya puedes jugar partidas reales contra gente del mundo entero. Esta guía te lleva de cero a tu primera victoria.',
    sections: [
      {
        heading: '1. ¿Qué es Pokémon competitivo realmente?',
        body:
          'No es como la campaña. En competitivo todos los Pokémon están a **nivel 50 o 100**, con stats igualadas. La diferencia entre ganar y perder está en: qué Pokémon eliges, qué moves les pones, sus EVs (stat investments), sus items y tus decisiones turno a turno. **Lo importante es el cerebro, no las horas grindeadas.**',
      },
      {
        heading: '2. Dónde se juega (y por qué Showdown lo cambia todo)',
        body:
          'Tienes dos opciones principales:',
        bullets: [
          '**Scarlet/Violet (juego oficial)**: Battle Stadium online, formatos VGC oficiales. Necesitas el juego (~$60), entrenar Pokémon con EVs, etc.',
          '**Pokémon Showdown (gratis)**: simulador web. Te dejas elegir cualquier Pokémon ya competitive-ready, prueba builds al instante. **Es donde el 95% del meta competitivo se juega.**',
          '**Recomendación**: empieza en Showdown. Pruebas equipos sin gastar horas entrenando. Cuando sepas qué te gusta, llevas el equipo al juego oficial si quieres jugar torneos físicos.',
        ],
      },
      {
        heading: '3. Los formatos principales explicados',
        body:
          'Cada formato es un "mini juego" con reglas distintas. Los más importantes:',
        bullets: [
          '**VGC (Video Game Championships)**: formato OFICIAL de Pokémon. Doubles (2v2 simultáneo), nivel 50. Regulación cambia cada temporada (actualmente Reg G/H).',
          '**Smogon OU (OverUsed)**: el formato comunitario más popular. Singles (1v1), nivel 100. Lista de banned Pokémon definida por la comunidad.',
          '**Smogon Ubers**: como OU pero permite legendarios broken.',
          '**Monotype**: tu equipo tiene que ser todo del mismo tipo. Reto extra divertido.',
          '**Random Battle**: equipo aleatorio. Perfecto para empezar — no necesitas saber nada de teambuilding.',
        ],
      },
      {
        heading: '4. Los términos que TIENES que saber',
        body:
          'Antes de entrar a Showdown, internaliza estos:',
        bullets: [
          '**EVs (Effort Values)**: stats extra que repartes en tus Pokémon. Máximo 510 totales, 252 por stat. Generalmente vas all-in en 2 stats (atk + speed, o hp + def).',
          '**IVs (Individual Values)**: stats "innatas" (0-31). En competitivo todas son 31 normalmente. No te preocupes mucho — Showdown te las da maxed por defecto.',
          '**STAB**: Same Type Attack Bonus. Si usas un move del mismo tipo que tú, hace ×1.5 daño.',
          '**OHKO / 2HKO**: One/Two Hit KO. Vocabulario para "puedo matarlo en 1/2 turnos".',
          '**Sweeper / Wall / Pivot**: roles de equipo. Sweeper = pega fuerte. Wall = tanquea. Pivot = cambia.',
          '**Tera**: mecánica de Gen 9. Cambias el tipo de tu Pokémon una vez por partida. Estrategia clave.',
        ],
      },
      {
        heading: '5. Tu primera semana — qué hacer en orden',
        body:
          'Olvida construir teams desde cero. Sigue este orden:',
        bullets: [
          '**Día 1-2**: Juega 10 partidas Random Battle en Showdown. Familiarízate con la interfaz, mira los Pokémon que ves, lee descripciones de moves.',
          '**Día 3-5**: Pásate a Random Battle Doubles y/o Random Battle Monotype. Mismo formato pero diferentes reglas — ves nuevas dinámicas.',
          '**Día 6-7**: Importa un equipo "Sample" de Smogon (smogon.com/forums/threads/sv-ou-sample-teams). Cópialo, pégalo en Showdown teambuilder. Juega 10 partidas con él.',
          '**Día 8-10**: Empieza a hacer tweaks pequeños — cambia un Pokémon, un item, un EV spread. Observa cómo cambia tu winrate.',
          '**Día 11-14**: Construye tu primer equipo desde cero. No tiene que ser perfecto. La práctica es lo que enseña.',
        ],
      },
      {
        heading: '6. Herramientas que necesitas (todas gratis)',
        body:
          'Para no jugar a ciegas:',
        bullets: [
          '**[PokéHub](/)** (estás aquí): pokédex con datos competitivos, damage calc, team builder, glosario.',
          '**Pokémon Showdown**: el simulador. Inevitable.',
          '**Smogon.com**: dex con análisis competitivos profundos por Pokémon.',
          '**Pikalytics**: usage stats actualizadas del meta VGC/OU.',
          '**Damage Calc** (PokéHub o el de Showdown): SIEMPRE calcula antes de atacar. La diferencia entre principiante y intermedio es: el principiante apuesta, el intermedio calcula.',
        ],
      },
      {
        heading: '7. Los errores que TODOS cometemos',
        body:
          'Para que tú no:',
        bullets: [
          '**Quedarte mirando un Pokémon roto y subir LP sin tradear**: si solo usas un Pokémon, te quedas sin él y pierdes.',
          '**No usar hazards**: Stealth Rock le quita 12-50% HP al rival al entrar. No usarlo es regalar daño gratis.',
          '**Tera turno 1**: Tera es tu último recurso. Reservarlo para tu win-con cambia partidas.',
          '**No calcular damage**: "creo que lo mato" no es estrategia. Calcula.',
          '**Tilt después de hax**: critical hits y flinches existen y son random. No te frustres, juega la siguiente partida.',
        ],
      },
      {
        heading: 'Siguiente paso',
        body:
          'Cuando hayas hecho tus primeras 50 partidas y entiendas las bases, lee nuestras guías más avanzadas: análisis de counters, builds de sweepers, estrategias por arquetipo. **Lo importante**: jugar mucho, perder mucho al principio, revisar tus replays. En 1 mes ya serás intermedio.',
      },
    ],
  },

  {
    slug: 'que-es-vgc-guia-completa',
    title: '¿Qué es VGC? Guía completa al formato oficial de Pokémon',
    description:
      'VGC explicado: formato doubles oficial de Nintendo, las reglas, los torneos World Championship, las regulaciones (Reg G/H) y cómo prepararte para competir.',
    category: 'Principiante',
    readingTime: '8 min',
    publishedAt: '2026-05-21',
    heroPokemon: [727, 898, 1017],
    intro:
      '**VGC** son las siglas de **Video Game Championships** — el formato oficial de Pokémon competitivo organizado por The Pokémon Company. Si has visto videos de torneos con premios de $25.000+ en YouTube, eso es VGC. Es donde se decide quién es "el mejor jugador del mundo" cada año.',
    sections: [
      {
        heading: 'Las reglas que definen VGC',
        body:
          'Lo que hace VGC distinto de otros formatos:',
        bullets: [
          '**Doubles**: 2v2 simultáneos. Distinto a Singles (1v1) — la sinergia entre tus 2 Pokémon activos importa muchísimo.',
          '**Nivel 50**: todos los Pokémon están al mismo nivel. No hay grindfest.',
          '**Bring 6, Pick 4**: llevas equipo de 6 Pokémon, pero solo eliges 4 al inicio de cada partida. **Decisión clave**: qué 4 eliges según el equipo del rival (team preview).',
          '**Cronómetro**: 7 minutos totales por jugador + 45 segundos por turno. La presión de tiempo es real.',
          '**Series 3 partidas**: BO3 en torneos importantes — puedes ajustar tu pick entre partidas.',
        ],
      },
      {
        heading: 'Regulaciones (Reg G, Reg H, etc.)',
        body:
          'VGC cambia las reglas cada temporada para refrescar el meta. Cada conjunto se llama "Regulación":',
        bullets: [
          '**Reg G (actual hasta agosto 2026)**: 2 Restricted Pokémon permitidos (Calyrex, Miraidon, Koraidon, etc.). El más broken meta de la historia.',
          '**Reg H**: Sin Paradox Pokémon, sin formas de Treasures of Ruin, sin legendarios — el formato "purist" más balanceado.',
          '**Reg I, J...**: vendrán después de Worlds 2026.',
          '**Importante**: no asumas que un Pokémon "siempre vale" — chequea la regulación actual antes de teambuilding.',
        ],
      },
      {
        heading: 'La estructura competitiva — del local a Worlds',
        body:
          'VGC tiene un circuito anual:',
        bullets: [
          '**Local Challenges**: torneos pequeños en tu ciudad/país. Ideal para empezar a competir presencialmente.',
          '**Regionals**: ~10 al año por región (Europa, NA, Latam, Asia). Pool 500-1500 jugadores.',
          '**Internationals**: 4 al año, uno por continente. Pool de 1500-2500. CP (Championship Points) más altos.',
          '**World Championships (Worlds)**: agosto, una vez al año. Solo los top X jugadores con más CP entran. **El torneo definitivo.**',
        ],
      },
      {
        heading: '¿Cuánto cuesta competir?',
        body:
          'Depende de tu nivel:',
        bullets: [
          '**Online (Battle Stadium / Ladder)**: gratis si ya tienes el juego.',
          '**Locales**: $10-20 de inscripción.',
          '**Regionals**: $30-50 + viaje + hotel (puede ser $200-500/torneo).',
          '**Worlds**: invitation only — si calificas, gastas en viaje internacional. Premios de Worlds: $25k al campeón Masters.',
        ],
      },
      {
        heading: 'Cómo empezar en VGC ahora mismo',
        body:
          'Plan realista para tu primer torneo:',
        bullets: [
          '**1**: Aprende Showdown VGC Doubles primero (gratis, no necesitas el juego).',
          '**2**: Cuando ganes consistentemente partidas online, mira sample teams de top players en VGCPastes.com.',
          '**3**: Llévalo al juego oficial (Scarlet/Violet) — necesitas entrenar tus Pokémon. Usa Auction House en Pokémon HOME para conseguir las naturalezas/abilities que necesitas.',
          '**4**: Juega Online Competitions oficiales — torneos mensuales donde compites por puntos.',
          '**5**: Tu primer torneo presencial: busca un Local Challenge cerca. La comunidad VGC es muy welcoming a newcomers.',
        ],
      },
      {
        heading: 'Diferencias clave con Smogon OU',
        body:
          'Si vienes de OU, ajusta tu mentalidad:',
        bullets: [
          '**Speed control reina**: Tailwind, Trick Room, Icy Wind. Outspeed manual gana partidas.',
          '**Fake Out + Intimidate**: dominan el meta. Incineroar es el Pokémon más usado del juego por una razón.',
          '**Pokémon "OU-trash" son VGC OP**: Amoonguss (spore + redirect), Pelipper (rain setter), Cresselia (Lunar Dance) — pueden ser tier S aquí.',
          '**Hazards casi no existen**: las partidas duran 8-12 turnos, Stealth Rock no compensa.',
        ],
      },
    ],
  },

  {
    slug: 'smogon-ou-vs-vgc-diferencias',
    title: 'Smogon OU vs VGC: diferencias y cuál jugar',
    description:
      'Comparativa completa: Smogon (singles, comunitario) vs VGC (doubles, oficial Nintendo). Reglas, meta, cultura, costes y cómo elegir tu formato.',
    category: 'Principiante',
    readingTime: '6 min',
    publishedAt: '2026-05-22',
    heroPokemon: [983, 727, 887],
    intro:
      '"¿Smogon o VGC?" es la primera pregunta que se hace todo nuevo jugador competitivo. La respuesta corta: **son dos juegos completamente distintos** que comparten Pokémon como recurso. Aquí están las diferencias reales y cómo elegir.',
    sections: [
      {
        heading: 'Tabla resumen rápida',
        body:
          'Si solo tienes 30 segundos, esto es lo que necesitas saber:',
        bullets: [
          '**Smogon OU**: Singles 1v1, comunitario, jugado mayormente online en Showdown. Free.',
          '**VGC**: Doubles 2v2, oficial Nintendo, torneos presenciales con premios reales. Requiere el juego.',
          '**Pool**: Smogon banea Pokémon por tier system. VGC banea por Regulation oficial.',
          '**Cultura**: Smogon = teórico/data-driven. VGC = social/torneos.',
        ],
      },
      {
        heading: 'Smogon en detalle',
        body:
          'Smogon es la comunidad competitiva más vieja de Pokémon (~20 años). Sus formatos:',
        bullets: [
          '**Tiers basados en usage**: OU (top), UU (no usados en OU), RU (no usados en UU), NU, PU. Si tu Pokémon es muy usado en un tier, sube. Si no, baja.',
          '**Ubers / AG**: los Pokémon prohibidos en OU juegan allí. Mewtwo, Calyrex, Koraidon — los broken.',
          '**Decisiones de banlist** se hacen por **tier councils** (representantes elegidos por la comunidad). Vota la comunidad.',
          '**Sin premios oficiales**: torneos comunitarios con prestige, no dinero. SPL (Smogon Premier League) es el "Champions League" del formato.',
        ],
      },
      {
        heading: 'VGC en detalle',
        body:
          'VGC existe desde 2008. Lo organiza directamente The Pokémon Company:',
        bullets: [
          '**Formato único: Doubles** (no hay tier system). Sí hay regulaciones (Reg G, Reg H) que cambian qué está permitido.',
          '**Torneos presenciales** con premios serios: $25k al campeón Worlds Masters Division.',
          '**Restricted system**: cada regulación permite 0-2 "Restricted" Pokémon (legendarios fuertes). Cambia mucho el meta.',
          '**Comunidad más pequeña pero más social**: te conoces a la gente en torneos físicos.',
        ],
      },
      {
        heading: 'Qué formato es para ti',
        body:
          'Elige según tu personalidad:',
        bullets: [
          '**Smogon OU si**: te gusta la teoría, jugar online sin gastar, formatos variados (PU, Monotype, AG), comunidad data-driven.',
          '**VGC si**: te motiva los torneos físicos, quieres premios reales, prefieres doubles más interactivo, te gusta el ambiente social.',
          '**Ambos si**: no son mutuamente excluyentes. Muchos top players juegan los dos. Comparten conocimiento de mecánicas.',
        ],
      },
      {
        heading: 'Diferencias en gameplay que no esperabas',
        body:
          'Cosas que te van a sorprender al cambiar de uno a otro:',
        bullets: [
          '**En VGC, el Stealth Rock raramente importa**: partidas de 8-12 turnos, no compensa.',
          '**En Smogon OU, Fake Out es casi inútil**: solo hit en doubles.',
          '**Intimidate vale 10× más en VGC**: pega a los 2 activos.',
          '**Tera Stellar funciona distinto**: en VGC se ven más sets defensivos, en OU más ofensivos.',
          '**Choice items (Scarf/Specs/Band) dominan en Smogon, no tanto en VGC**: en doubles cambias más, los Choice locks duelen.',
        ],
      },
      {
        heading: 'Recomendación de PokéHub',
        body:
          'Si dudas, **empieza por Smogon OU en Showdown**. Razones: gratis, instantáneo (no entrenar), singles es más fácil de aprender que doubles para principiantes, y la comunidad online es enorme. Cuando entiendas las bases, prueba VGC para ver si te enganchan los torneos físicos. **No te encasilles** — los mejores jugadores juegan ambos.',
      },
    ],
  },

  {
    slug: '10-errores-principiantes-competitivos',
    title: 'Los 10 errores más comunes de principiantes en Pokémon competitivo',
    description:
      'Lista de los 10 errores que cometes en tus primeras 100 partidas y cómo evitarlos. Desde Tera turno 1 hasta no calcular damage — la guía honesta.',
    category: 'Principiante',
    readingTime: '7 min',
    publishedAt: '2026-05-23',
    heroPokemon: [658, 887, 983],
    intro:
      'Estos errores los he cometido yo, los has cometido tú, los comete TODO el mundo en sus primeras 100 partidas. La diferencia entre quedarte en bronze y subir a plata: identificarlos y corregirlos rápido. Aquí los 10 más típicos en orden de frecuencia.',
    sections: [
      {
        heading: '1. Tera en turno 1 sin razón',
        body:
          'Tera es **el recurso más valioso de la partida** — solo puedes usarlo una vez en todo el match. Activarlo en T1 por "obligación de moda" pierde flexibilidad para el resto. **Cuándo SÍ usar Tera T1**: si necesitas resistir un hit específico que perderías sin él (típico de leads matchup). **Cuándo NO**: nunca por defecto. Espera a que tu sweeper esté listo para setupear o que el rival comprometa su Tera primero.',
      },
      {
        heading: '2. No calcular damage antes de atacar',
        body:
          '"Creo que lo mato" no es estrategia. Cada vez que dudas, **calcula con el damage calculator**. Saber si tu Earthquake 252+ Atk Garchomp + Life Orb mata o solo 2HKO a Skarmory cambia totalmente tu decisión. Los pros calculan antes de cada attacking move, especialmente en moves clave.',
      },
      {
        heading: '3. Ignorar los hazards',
        body:
          'Stealth Rock le quita al rival 12.5%-50% HP cada vez que entra un Pokémon. En una partida de 20 turnos donde el rival cambia 8 veces, eso es **100-400% de damage acumulado gratis**. No usar hazards = tirar partidas. **Setea SIEMPRE** salvo que tu equipo no pueda permitírselo (typical hyper-offense).',
      },
      {
        heading: '4. Quedarse con un solo Pokémon hasta el final',
        body:
          'Tu Garchomp está a 30% HP, has hecho 4 KOs con él, te enamoras. **No sacrifiques 5 Pokémon más para "morir con él"**. Pivotalo fuera, deja que tanquee con otro, vuelve a sacarlo cuando puedas hacer KO. La gestión de recursos es lo que separa a buenos jugadores.',
      },
      {
        heading: '5. No leer Team Preview',
        body:
          'Antes de pulsar "Battle", tienes ~30 segundos para ver los 6 Pokémon del rival. **Úsalos**. Identifica: ¿quién es su win-con? ¿qué Pokémon mío gana 6-0 si no muere? ¿hay un Choice Scarf escondido? La mitad de la partida se juega aquí. Si entras a Team Preview pensando "ya veré qué hace", vas a perder.',
      },
      {
        heading: '6. Predict everything',
        body:
          'Predict (anticipar el move del rival) es divertido pero arriesgado. Si predict mal una vez, regalas turno gratis al rival. **Regla**: predict solo si la EV (expected value) es claramente positiva. "Switch al Skarmory porque va a pegar EQ" tiene sentido si el rival lleva claramente Garchomp ofensivo. Si es un set defensivo con Roost, te comes Roost y pierdes momentum.',
      },
      {
        heading: '7. No revisar tus replays',
        body:
          'Pokémon Showdown te guarda TODOS tus replays. Cuando pierdas una partida importante, **vuelve a verla**. Identifica el turno exacto donde la perdiste. ¿Switch malo en T4? ¿Predict equivocado en T7? Aprende de errores específicos en lugar de "tilt y siguiente partida". **PokéHub tiene una herramienta gratis** (/tools/replay-analyzer) que te resume las jugadas clave + coaching automático.',
      },
      {
        heading: '8. Tilt después de hax',
        body:
          'Critical hits, flinches, missed Stone Edges — el RNG existe y va a pasarte. **No es personal**. Si pierdes una partida por un crit, no juegues 10 partidas seguidas tilteado intentando "recuperar". Cierra Showdown, da una vuelta, vuelve cuando estés calm. El tilt te hace cometer los 7 errores de arriba al mismo tiempo.',
      },
      {
        heading: '9. Copiar sample teams sin entender',
        body:
          'Los sample teams de Smogon están optimizados para jugadores que **saben jugarlos**. Si copias un team de stall sin entender cómo se juega stall, vas a perder con Pokémon que en teoría son top tier. **Lee la guía del team** o adapta uno más simple a tu nivel. Hyper Offense es más fácil de pilotar que Balance.',
      },
      {
        heading: '10. No entender tus moves',
        body:
          '"Mi Garchomp tiene Earthquake porque es Tierra". Vale, pero ¿por qué Stone Edge y no Iron Head? ¿Por qué Adamant y no Jolly? Cada decisión en tu set tiene una razón. Si copias sin entender, no vas a saber adaptarlo cuando el meta cambie. **Lee descripciones de los moves** (PokéHub tiene página por move en /database/moves/[name]), entiende por qué cada item/EV spread está ahí.',
      },
      {
        heading: 'Bonus: la regla 80/20',
        body:
          'El 80% de tus victorias vienen del 20% de tus decisiones bien jugadas. Las decisiones que más impacto tienen: **lead selection en team preview, cuándo Tera, cuándo NO atacar (switching), cuándo gastar Choice item, cuándo apostar al predict**. Domina estas 5 y subes 200 ELO. Las demás (qué move usar en cada turno) son obvias el 90% del tiempo.',
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
