// Glosario competitivo de Pokémon. Cada término tiene su propia URL
// /glossary/[slug] indexable por Google. Búsquedas tipo "what is stab pokemon",
// "what is ohko", etc. traen tráfico decente.
//
// Pre-rendered como SSG → coste 0, indexación inmediata.

export interface GlossaryTerm {
  slug: string;
  term: string;          // como se muestra
  short: string;         // descripción 1-línea
  body: string;          // explicación completa (markdown light)
  category:
    | 'Estadísticas'
    | 'Mecánicas'
    | 'Estrategia'
    | 'Juego'
    | 'Formato';
  related?: string[];    // slugs de términos relacionados
}

export const GLOSSARY: GlossaryTerm[] = [
  // ─── Estadísticas ───────────────────────────────────────────────────
  {
    slug: 'stab',
    term: 'STAB',
    short: 'Same-Type Attack Bonus. +50% daño cuando un Pokémon usa un movimiento de su mismo tipo.',
    body: '**STAB** (Same-Type Attack Bonus) es la bonificación de daño que recibe un Pokémon al usar un movimiento que comparte tipo con uno de los suyos.\n\nEjemplo: **Charizard** (Fuego/Volador) usando **Lanzallamas** (Fuego) gana ×1.5 de daño. Si Tera-Estellarizes a tipo Fuego, el STAB pasa a ×2.0 SOLO la primera vez (mecánica única del Tera Stellar).\n\nSi tu Pokémon es **mono-tipo**, solo gana STAB con un tipo. Si es **dual-tipo**, gana STAB con ambos.',
    category: 'Mecánicas',
    related: ['tera', 'damage-formula'],
  },
  {
    slug: 'ohko',
    term: 'OHKO',
    short: 'One-Hit Knockout. Cuando un movimiento KO al rival en un solo ataque.',
    body: '**OHKO** es el acrónimo de "One-Hit Knockout" — KO en un solo turno. En Damage Calc se reporta como porcentaje: "98.4% OHKO" significa que con los 16 damage rolls del calc, 16 de ellos KO; "70% OHKO" significa que ~12 de 16 rolls KO.\n\n**2HKO**, **3HKO**, etc. = KO en 2, 3 turnos. Útil para planear cuántos turnos necesitas para limpiar a un rival.\n\nMovimientos con efecto OHKO real (Sheer Cold, Fissure, Guillotine, Horn Drill) tienen 30% precisión + solo afectan a niveles iguales o menores.',
    category: 'Estrategia',
    related: ['damage-formula', '2hko'],
  },
  {
    slug: '2hko',
    term: '2HKO',
    short: 'Two-Hit Knockout. KO en dos ataques consecutivos.',
    body: '**2HKO** = dos hits necesarios para KO. La gran mayoría de matchups en singles competitivos son 2HKOs.\n\nClave: si haces 2HKO al rival y él te hace OHKO, pierdes. Si haces 2HKO y él 3HKO, ganas el intercambio.\n\nEn dobles VGC los 2HKOs son frecuentes porque el "spread damage" (Earthquake hits both) reduce el daño individual.',
    category: 'Estrategia',
    related: ['ohko', 'damage-formula'],
  },
  {
    slug: 'ev',
    term: 'EV',
    short: 'Effort Values. Puntos de entrenamiento que personalizan stats. Máx 252 por stat, 510 totales.',
    body: '**EVs** (Effort Values, "Esfuerzos") son puntos invisibles que personalizan las stats de tu Pokémon.\n\nReglas:\n- **Máximo 252 EVs por stat individual** (= +63 al stat al lvl 100)\n- **Máximo 510 EVs totales** por Pokémon (no puedes maxear todas)\n- 4 EVs = +1 stat al nivel 100\n\nDistribuciones estándar:\n- **Sweeper**: 252 Atk/SpA + 252 Spe + 4 HP\n- **Wall**: 252 HP + 252 Def (o SpD) + 4 sobrante\n\nMira nuestro [EV Optimizer](/tools/ev-optimizer) para benchmarks reales.',
    category: 'Estadísticas',
    related: ['iv', 'bst', 'nature'],
  },
  {
    slug: 'iv',
    term: 'IV',
    short: 'Individual Values. La "genética" innata de cada Pokémon. 0-31 por stat.',
    body: '**IVs** (Individual Values) son la "genética" oculta de cada Pokémon individual. Cada stat tiene un IV de **0 a 31**.\n\nUn IV de 31 = +31 al stat al nivel 100, +15 al lvl 50.\n\nEn SV con la DLC, los **Bottle Caps** y **Hyper Training** permiten maxear IVs sin breeding. Los **Gold Bottle Caps** maxean los 6 a la vez.\n\nCasos donde quieres IV 0 (no 31):\n- **IV Spe = 0** → para Trick Room, ser el más lento\n- **IV Atk = 0** → en special attackers, reduce daño de confusion self-hit',
    category: 'Estadísticas',
    related: ['ev', 'nature'],
  },
  {
    slug: 'bst',
    term: 'BST',
    short: 'Base Stat Total. Suma de los 6 stats base del Pokémon. Indicador de poder bruto.',
    body: '**BST** (Base Stat Total) es la suma de los 6 stats base de un Pokémon: HP + Atk + Def + SpA + SpD + Spe.\n\nRangos típicos:\n- **<400**: NFE (no fully evolved) o débiles\n- **400-499**: Generalistas decentes\n- **500-579**: Pokémon meta (OU)\n- **580-599**: Pseudo-legendarios\n- **600+**: Legendarios y restricted\n- **680+**: Box legendaries\n- **720**: Arceus, Mega-Mewtwo X/Y, Eternatus',
    category: 'Estadísticas',
    related: ['ev', 'iv'],
  },
  {
    slug: 'nature',
    term: 'Naturaleza',
    short: '25 naturalezas que dan ±10% en pares de stats. 5 son neutras.',
    body: '**Naturaleza** modifica las stats: +10% una, -10% otra. Hay **25** en total, 5 son neutras.\n\nTop S-tier:\n- **Adamant** (+Atk/-SpA) — sweepers físicos\n- **Modest** (+SpA/-Atk) — sweepers especiales\n- **Jolly** (+Spe/-SpA) — physical sweepers que necesitan Spe\n- **Timid** (+Spe/-Atk) — special sweepers que necesitan Spe\n\nMira nuestra [tier list de naturalezas](/guides/tier-list-naturalezas).',
    category: 'Estadísticas',
    related: ['ev', 'iv'],
  },
  {
    slug: 'speed-tier',
    term: 'Speed Tier',
    short: 'Posición de un Pokémon en el ranking de velocidad del meta.',
    body: '**Speed Tier** es la posición de tu Pokémon en el ranking de velocidad. Crítico porque mover primero suele decidir el matchup.\n\nFranjas comunes en SV competitivo (lvl 50 max EVs +nature):\n- 🔥 **>200 Spe**: Flutter Mane (222), Miraidon (222), Iron Valiant (216)\n- ⚡ **180-200**: Tornadus, Iron Bundle\n- 💨 **150-180**: Sweepers estándar\n- 🐢 **<100**: Bulky offense, Trick Room candidates\n\nMira el [Speed Tier Visualizer](/tools/speed-tier).',
    category: 'Estrategia',
    related: ['ev', 'priority'],
  },
  // ─── Mecánicas ───────────────────────────────────────────────────────
  {
    slug: 'tera',
    term: 'Tera Type',
    short: 'Mecánica SV: cambias tu tipo defensivo (y boost de STAB) una vez por partida.',
    body: '**Tera Type** es la mecánica signature de Pokémon SV. Cada Pokémon puede Tera-statellizarse **una vez por partida** y su tipo defensivo cambia al Tera Type asignado.\n\nReglas:\n- Tu Tera Type reemplaza tu typing defensivo (resistencias/debilidades cambian)\n- Si el Tera coincide con un STAB original, el STAB pasa de ×1.5 a ×2.0\n- Si el Tera es de un tipo diferente, GANAS STAB del nuevo tipo a ×1.5\n- Solo una Tera por equipo por partida\n\nMira nuestro [Tera Optimizer](/team-builder) en el Team Builder.',
    category: 'Mecánicas',
    related: ['stab', 'tera-stellar'],
  },
  {
    slug: 'tera-stellar',
    term: 'Tera Stellar',
    short: 'Tera Type especial: STAB ×2 SOLO el primer uso de cada tipo, después ×1.5.',
    body: '**Tera Stellar** es un Tera Type especial conseguido en el DLC The Indigo Disk. A diferencia de los normales:\n\n- El primer movimiento de **cada tipo** que uses recibe STAB ×2 (en lugar de ×1.5)\n- Los siguientes movimientos del mismo tipo vuelven a ×1.5\n- Tu tipo defensivo NO cambia (mantienes tu original)\n\n**Terapagos** (#1024) viene con Stellar por defecto y tiene su signature **Tera Starstorm** (120 BP) que es Stellar STAB.',
    category: 'Mecánicas',
    related: ['tera', 'stab'],
  },
  {
    slug: 'priority',
    term: 'Priority',
    short: 'Movimientos que van primero sin importar la velocidad. +1 a +5.',
    body: '**Priority** = los moves se ejecutan en orden de priority, **antes** del cálculo de velocidad. Stages comunes:\n\n- **+1**: Quick Attack, Bullet Punch, Aqua Jet, Mach Punch, Sucker Punch, Ice Shard, Shadow Sneak, Grassy Glide (en Grassy Terrain)\n- **+2**: Extreme Speed, Fake Out (solo turno 1)\n- **+3**: Protect, Detect, Endure\n- **+5**: Helping Hand (singles helper)\n\nEl orden interno entre +1 y +1 se decide por Speed normal.',
    category: 'Mecánicas',
    related: ['speed-tier'],
  },
  {
    slug: 'damage-formula',
    term: 'Damage Formula',
    short: 'Fórmula oficial del daño. Considera level, ataque, defensa, BP, STAB, types y rolls.',
    body: '**Damage Formula** Gen 9:\n\n```\nDamage = ((((2×Level/5 + 2) × BP × Atk/Def) / 50) + 2)\n         × STAB × Type × Random(0.85-1.0) × Modifiers\n```\n\nClaves:\n- **Random 0.85-1.0** = los 16 damage rolls (variabilidad ±15%)\n- **STAB**: ×1.5 (×2 con Adaptability)\n- **Type**: ×0.25 a ×4 según matchup\n- **Modifiers**: items (Choice Specs ×1.5), abilities, weather, crits (×1.5), etc.\n\nUsa nuestro [Damage Calculator](/tools/damage-calc) para no hacer cuentas a mano.',
    category: 'Mecánicas',
    related: ['stab', 'ohko'],
  },
  {
    slug: 'weather',
    term: 'Weather',
    short: 'Clima en el campo. Sol/Lluvia/Arena/Nieve. Modifica daño y trigger abilities.',
    body: '**Weather** (clima) afecta a todo el campo de batalla durante 5 turnos (8 con item adecuado).\n\n- **Sol** (Drought/Sunny Day): Fuego ×1.5, Agua ×0.5, Chlorophyll dobla Spe\n- **Lluvia** (Drizzle/Rain Dance): Agua ×1.5, Fuego ×0.5, Swift Swim dobla Spe, Thunder/Hurricane 100% acc\n- **Arena** (Sand Stream): Roca SpD ×1.5, daño residual 1/16 HP a no-Roca/Acero/Tierra\n- **Nieve** (Snow Warning): Hielo Def ×1.5, Slush Rush dobla Spe\n\nLa weather de un Pokémon con habilidad permanente se establece al entrar; los moves duran solo 5/8 turnos.',
    category: 'Mecánicas',
    related: ['terrain'],
  },
  {
    slug: 'terrain',
    term: 'Terrain',
    short: 'Mecánica del campo. 4 terrains que afectan Pokémon en suelo.',
    body: '**Terrain** afecta solo a los Pokémon **en el suelo** (no Volador/Levitate/Air Balloon).\n\nLos 4 terrains:\n- **Electric**: bloquea sleep + boost Eléctrico ×1.3\n- **Grassy**: cura 1/16 HP/turn + boost Planta ×1.3 + Earthquake ×0.5\n- **Misty**: bloquea status + Dragon ×0.5\n- **Psychic**: bloquea priority + boost Psychic ×1.3\n\nDuran 5 turnos. Habilidades como Electric Surge / Grassy Surge / Psychic Surge / Misty Surge los activan al entrar.',
    category: 'Mecánicas',
    related: ['weather', 'priority'],
  },
  {
    slug: 'status',
    term: 'Status condition',
    short: 'Condiciones de estado: burn, paralysis, sleep, poison, freeze.',
    body: '**Status conditions**:\n\n- **Burn** (BRN): -50% Atk físico + 1/16 HP/turn. Will-O-Wisp, Scald.\n- **Paralysis** (PAR): -50% Spe + 25% no se mueve. Thunder Wave, Stun Spore.\n- **Sleep** (SLP): 1-3 turnos no mueve. Spore, Sleep Powder, Hypnosis.\n- **Poison** (PSN): 1/8 HP/turn. Toxic stacks (1/16, 2/16, 3/16…).\n- **Freeze** (FRZ): 20% chance descongelar cada turno. Ice Beam, Blizzard (10% rate).\n\nMisty Terrain bloquea TODO status. Lum Berry cura uno.',
    category: 'Mecánicas',
  },
  // ─── Estrategia ──────────────────────────────────────────────────────
  {
    slug: 'sweeper',
    term: 'Sweeper',
    short: 'Pokémon diseñado para barrer al equipo rival tras un setup o boost.',
    body: '**Sweeper** = Pokémon ofensivo cuyo objetivo es KO 3+ Pokémon enemigos en una partida. Típicamente alto Atk/SpA + alta Spe.\n\nTipos:\n- **Setup Sweeper**: usa Swords Dance, Calm Mind, Dragon Dance antes de atacar (ej: Garchomp DD, Kingambit SD)\n- **Choice Sweeper**: locked a un move por Choice item (Scarf, Specs, Band) — máxima velocidad\n- **Weather Sweeper**: bajo weather, dobla Spe (Swift Swim, Chlorophyll, Sand Rush)\n- **Booster Sweeper**: Paradox Pokémon con Booster Energy',
    category: 'Estrategia',
    related: ['setup', 'wall', 'pivot'],
  },
  {
    slug: 'wall',
    term: 'Wall',
    short: 'Pokémon con bulk altísimo, diseñado para tankear hits e impedir sweeps rivales.',
    body: '**Wall** = Pokémon con stats defensivas altas + recovery, diseñado para aguantar ataques específicos.\n\nTipos:\n- **Physical Wall**: alta Def + Intimidate/burn (Gliscor, Skarmory, Quagsire)\n- **Special Wall**: alta SpD + status (Blissey, Chansey, Goodra-Hisui)\n- **Mixed Wall**: balanceado (Slowking-Galar, Toxapex)\n\nClave: **Recovery move** (Recover, Roost, Slack Off, Wish) o **Leftovers/Black Sludge**.\n\nMira nuestra lista de [mejores walls físicos](/best/best-physical-walls).',
    category: 'Estrategia',
    related: ['sweeper', 'cleric'],
  },
  {
    slug: 'pivot',
    term: 'Pivot',
    short: 'Pokémon que usa U-turn / Volt Switch para forzar matchups favorables.',
    body: '**Pivot** = Pokémon especializado en cambiar entre miembros del equipo manteniendo momentum.\n\nMoves de pivote:\n- **U-turn** (Bug, físico)\n- **Volt Switch** (Eléctrico, especial)\n- **Flip Turn** (Agua, físico)\n- **Parting Shot** (Dark, status + Intimidate al cambio)\n- **Teleport** (Psychic, prioridad -7 pero seguro)\n- **Chilly Reception** (Ice, planta nieve al cambiar)\n\nIncineroar es el pivote por excelencia (Fake Out + Knock Off + Parting Shot).',
    category: 'Estrategia',
    related: ['sweeper', 'momentum'],
  },
  {
    slug: 'lead',
    term: 'Lead',
    short: 'El Pokémon que envías primero en una partida. Suele setear hazards o weather.',
    body: '**Lead** = el primer Pokémon que envías. Roles típicos:\n\n- **Hazard setter**: Stealth Rock turn 1 (Garchomp, Hippowdon, Tyranitar)\n- **Weather setter**: Drizzle/Drought/Sand Stream al entrar\n- **Tailwind/TR setter**: VGC, control de velocidad al setup\n- **Fake Out lead**: VGC, garantizar chip damage + flinch turn 1\n- **Suicide Lead**: planta hazards y muere intencionalmente para preservar el resto del team',
    category: 'Estrategia',
    related: ['hazards', 'pivot'],
  },
  {
    slug: 'hazards',
    term: 'Hazards',
    short: 'Trampas de entrada: Stealth Rock, Spikes, Toxic Spikes, Sticky Web.',
    body: '**Hazards** = trampas que dañan o ralentizan a Pokémon al entrar a la batalla.\n\n- **Stealth Rock**: daño Roca al entrar (12.5% a neutral, 25% a Volador weak, 50% a 4× weak)\n- **Spikes**: 12-25% HP físico al entrar (stack hasta 3 capas)\n- **Toxic Spikes**: envenena (Toxic stack en 2 capas)\n- **Sticky Web**: -1 Spe al entrar\n\nSe quitan con **Rapid Spin** o **Defog**.\nMira [mejores SR setters](/best/best-stealth-rock-setters).',
    category: 'Estrategia',
    related: ['lead', 'hazard-removal'],
  },
  {
    slug: 'hazard-removal',
    term: 'Hazard removal',
    short: 'Moves para quitar hazards rivales: Rapid Spin, Defog, Mortal Spin.',
    body: '**Hazard removal** elimina hazards del campo:\n\n- **Rapid Spin** (Normal, físico): quita hazards de TU lado + boost Spe propia (Gen 8+)\n- **Defog** (Volador, status): quita hazards de **ambos lados** + screens enemigas\n- **Mortal Spin** (Veneno, físico): rapid spin + envenena\n- **Court Change** (Normal): swap hazards al otro campo (Cinderace)\n\nSi llevas Pokémon weak a Stealth Rock (Charizard, Volcarona, Ho-Oh), necesitas hazard removal CRÍTICAMENTE.',
    category: 'Estrategia',
    related: ['hazards'],
  },
  {
    slug: 'setup',
    term: 'Setup',
    short: 'Mover stat-boost moves antes de atacar: Swords Dance, Calm Mind, etc.',
    body: '**Setup** = usar moves de boost antes de empezar a atacar.\n\nTop setup moves:\n- **Swords Dance**: +2 Atk\n- **Nasty Plot**: +2 SpA\n- **Calm Mind**: +1 SpA +1 SpD\n- **Bulk Up**: +1 Atk +1 Def\n- **Dragon Dance**: +1 Atk +1 Spe (best del juego)\n- **Quiver Dance**: +1 SpA +1 SpD +1 Spe (top S)\n- **Shell Smash**: +2 Atk/SpA/Spe pero -1 Def/SpD\n\nClave: **predecir el switch** para setup gratis. O usar **Substitute** para protegerte del Taunt enemigo.',
    category: 'Estrategia',
    related: ['sweeper'],
  },
  {
    slug: 'cleric',
    term: 'Cleric',
    short: 'Pokémon que cura status del equipo: Wish, Heal Bell, Aromatherapy.',
    body: '**Cleric** = Pokémon con moves para curar status del equipo:\n\n- **Wish**: cura 50% HP del Pokémon en el slot 2 turnos después\n- **Heal Bell**: cura status del equipo completo\n- **Aromatherapy**: como Heal Bell\n- **Lunar Dance / Healing Wish**: cura full HP + status pero el cleric muere\n\nBlissey/Chansey son los clerics típicos. Útiles para teams con Pokémon weak a Toxic o paralysis.',
    category: 'Estrategia',
    related: ['wall', 'status'],
  },
  {
    slug: 'wallbreaker',
    term: 'Wallbreaker',
    short: 'Pokémon ofensivo con tanto poder que rompe walls. Choice Specs + STABs spam.',
    body: '**Wallbreaker** = Pokémon ofensivo cuyo rol es romper walls específicas del meta. Suelen:\n\n- BST 580+ con stat ofensiva 130+\n- Item Choice Specs/Band (×1.5 damage)\n- STABs spammeables\n\nEjemplos SV OU: Iron Valiant Choice Specs, Hydreigon Choice Specs, Roaring Moon Booster Atk.\n\nDiferencia con sweeper: el wallbreaker NO necesita setup, hace damage desde el primer turno.',
    category: 'Estrategia',
    related: ['sweeper', 'wall'],
  },
  // ─── Formato ────────────────────────────────────────────────────────
  {
    slug: 'vgc',
    term: 'VGC',
    short: 'Video Game Championships. Formato oficial de Pokémon Company. Dobles, lvl 50.',
    body: '**VGC** (Video Game Championships) es el **formato oficial** de Pokémon Company.\n\nReglas:\n- **Dobles**: 2v2 simultáneo\n- **Nivel 50** forzado\n- **Equipos de 4-6** (eliges 4 antes de cada batalla)\n- Reglas Regulation que cambian cada ~2 meses (Reg G actual permite 2 restricted, Reg H sin paradox, etc.)\n- Mundial cada año (Worlds en agosto)\n\nDistinto de **Smogon** (formato fanmade, singles lvl 100).',
    category: 'Formato',
    related: ['singles', 'doubles'],
  },
  {
    slug: 'ou',
    term: 'OU',
    short: 'OverUsed. Tier principal de Smogon. Singles lvl 100.',
    body: '**OU** (OverUsed) es el **tier principal de Smogon**. Pokémon que se usan más del **3.4% de las partidas** mensualmente entran en OU.\n\nReglas SV OU:\n- Singles, lvl 100\n- Sin Ubers (box legendaries banned)\n- Sin Paradox (algunos baneados específicamente)\n- Species clause (no repetir species)\n- Sleep clause (solo un Pokémon dormido por bando)\n\nMira [meta SV OU](/meta).',
    category: 'Formato',
    related: ['vgc', 'ubers'],
  },
  {
    slug: 'ubers',
    term: 'Ubers',
    short: 'Tier más alto de Smogon. Permite TODOS los Pokémon (incluso restricted).',
    body: '**Ubers** = tier de Smogon que permite **todos los Pokémon legales** incluyendo box legendaries (Calyrex-Shadow, Miraidon, etc.).\n\nReglas:\n- Singles, lvl 100\n- Solo bannean Mythicals con uso infinito (Mew, Arceus, etc.)\n- Species clause + Sleep clause\n\nMeta dominado por Calyrex-Shadow, Miraidon, Koraidon, Zacian-Crowned y Necrozma-Dusk-Mane.',
    category: 'Formato',
    related: ['ou'],
  },
  {
    slug: 'monotype',
    term: 'Monotype',
    short: 'Tier Smogon donde TODOS los miembros del team comparten al menos un tipo.',
    body: '**Monotype** = formato Smogon donde tus 6 Pokémon deben compartir **al menos un tipo común**.\n\nEjemplo: team Fire necesita los 6 con tipo Fuego (mono o dual). Charizard (Fuego/Volador) cuenta para Fire monotype Y Flying monotype.\n\nReglas estándar OU + restricción de tipo. Top teams: Steel, Water, Dragon, Fairy, Psychic.',
    category: 'Formato',
    related: ['ou'],
  },
  {
    slug: 'doubles',
    term: 'Doubles',
    short: '2v2 simultáneo. Cada bando envía 2 Pokémon a la vez. Estándar de VGC.',
    body: '**Doubles** = formato donde **2 Pokémon de cada bando luchan a la vez**.\n\nDiferencias clave vs singles:\n- **Spread moves** existen: Earthquake hits a ambos rivales + tu compañero (excepto Levitate/Air Balloon)\n- Daño spread = ×0.75 a cada uno (en lugar de ×1.0)\n- **Helping Hand** boost al compañero ×1.5\n- **Wide Guard** protege spread moves\n- **Follow Me / Rage Powder** redirige ataques al usuario\n- **Tailwind / Trick Room** son MÁS importantes\n\nVGC es doubles. Smogon también tiene Doubles OU (DOU).',
    category: 'Formato',
    related: ['vgc', 'singles'],
  },
  {
    slug: 'singles',
    term: 'Singles',
    short: '1v1 simultáneo. Solo un Pokémon de cada bando en campo a la vez.',
    body: '**Singles** = formato 1v1. Solo un Pokémon de cada lado en campo. Smogon OU/Ubers/UU son singles.\n\nDiferencias vs doubles:\n- No spread damage\n- **Switching** es la mecánica clave (predecir lo que cambia el rival)\n- Setup sweepers más viables\n- Walls puras más útiles\n- Toxic stall es viable',
    category: 'Formato',
    related: ['doubles', 'ou'],
  },
  {
    slug: 'restricted',
    term: 'Restricted',
    short: 'Pokémon que están limitados a 1 o 2 por equipo en formatos oficiales.',
    body: '**Restricted** son los box legendaries y similares que en formatos oficiales (VGC) están limitados.\n\nEjemplos: Calyrex (Ice/Shadow), Miraidon, Koraidon, Terapagos, Zacian, Zamazenta, Kyogre, Groudon, Rayquaza, los Cosmog line.\n\nReg G (VGC 2026) = **máximo 2 restricted** por team. Reg H = **0 restricted**.',
    category: 'Formato',
    related: ['vgc', 'ubers'],
  },
  // ─── Juego ───────────────────────────────────────────────────────────
  {
    slug: 'mega-evolution',
    term: 'Mega Evolution',
    short: 'Mecánica Gen 6 reintroducida en Pokémon Champions. +100 BST y nuevo typing.',
    body: '**Mega Evolution** = transformación temporal que da **+100 BST** y a veces cambia el typing.\n\nDetalles:\n- Necesitas la **Mega Stone** específica (ej: Charizardite Y para Mega Charizard Y)\n- Solo **1 Mega Evolution por equipo por partida**\n- Cambia stats Y a veces ability\n- Estuvo en Gen 6-7, **regresó en Pokémon Champions Reg M-A**\n\nMega Pokémon meta SV/Champions: Mega Charizard Y, Mega Tyranitar, Mega Salamence, Mega Lucario, Mega Gardevoir, Mega Mawile, Mega Venusaur, Mega Aerodactyl.',
    category: 'Juego',
    related: ['z-move'],
  },
  {
    slug: 'z-move',
    term: 'Z-Move',
    short: 'Mecánica Gen 7. Ataque único super-potente por partida con Z-Crystal.',
    body: '**Z-Move** = ataque ultra-poderoso de Gen 7. Solo se podía usar **una vez por partida**. Requiere Z-Crystal específico.\n\nCada tipo tenía su Z-Move base. Ciertos Pokémon tenían Z-Moves signature (ej: Pikachu Z-Move).\n\nNO está en SV (eliminado en Gen 8). Sigue existiendo en juegos antiguos y se usa nostálgicamente. Reemplazado por Dynamax (Gen 8) y luego Tera (Gen 9).',
    category: 'Juego',
    related: ['mega-evolution', 'tera'],
  },
  {
    slug: 'dynamax',
    term: 'Dynamax / Gigantamax',
    short: 'Mecánica Gen 8 (Sword/Shield). Tu Pokémon crece y sus moves se transforman.',
    body: '**Dynamax** = mecánica Gen 8. Tu Pokémon crece (cambia visualmente), sus stats se multiplican (HP ×1.5 a ×2.0) y sus moves se transforman en **Max Moves** con efectos secundarios (Max Lightning planta Electric Terrain, etc.).\n\n**Gigantamax** = forma especial con apariencia única + un G-Max Move signature por especie.\n\nDuraba 3 turnos. Solo un Pokémon Dynamax/Gigantamax por partida.\n\nEliminado en SV. Sigue en SwSh y usable en BDSP/Legends Arceus.',
    category: 'Juego',
    related: ['z-move', 'tera'],
  },
  {
    slug: 'paradox',
    term: 'Paradox Pokémon',
    short: 'Pokémon antiguos (Scarlet) y futuristas (Violet) signature de Gen 9.',
    body: '**Paradox Pokémon** = especies signature de Gen 9.\n\n- **Paradox antiguos** (Scarlet, "Past"): Great Tusk, Brute Bonnet, Sandy Shocks, Scream Tail, Flutter Mane, Slither Wing, Roaring Moon. Habilidad **Protosynthesis** activada por sol/Booster Energy.\n- **Paradox futuristas** (Violet, "Future"): Iron Treads, Iron Moth, Iron Hands, Iron Jugulis, Iron Thorns, Iron Bundle, Iron Valiant. Habilidad **Quark Drive** activada por Electric Terrain/Booster Energy.\n- **Loyal Three** y **Walking Wake/Iron Leaves** (DLC): variantes adicionales.\n\nBaneados en Champions Reg M-A.',
    category: 'Juego',
    related: ['protosynthesis', 'quark-drive'],
  },
  {
    slug: 'protosynthesis',
    term: 'Protosynthesis',
    short: 'Ability de Paradox antiguos. +30% a la stat más alta bajo sol o Booster Energy.',
    body: '**Protosynthesis** se activa por:\n- **Sol** en el campo (Drought, Sunny Day, Orichalcum Pulse)\n- **Booster Energy** (item consumible)\n\nBoost la **stat más alta** del Pokémon en +30% (×1.3). Si la stat más alta es Spe, dura mientras el sol esté activo. Si es otra stat, dura toda la partida o hasta cambio.\n\nPokémon con Protosynthesis: Great Tusk (Atk), Roaring Moon (Atk), Flutter Mane (SpA), Brute Bonnet (Atk).',
    category: 'Juego',
    related: ['paradox', 'quark-drive'],
  },
  {
    slug: 'quark-drive',
    term: 'Quark Drive',
    short: 'Ability de Paradox futuristas. +30% a la stat más alta bajo Electric Terrain o Booster.',
    body: '**Quark Drive** es la versión "futurista" de Protosynthesis.\n\nSe activa por:\n- **Electric Terrain** en el campo (Electric Surge, Hadron Engine)\n- **Booster Energy** (item consumible)\n\nMismo efecto: +30% (×1.3) a la stat más alta.\n\nPokémon con Quark Drive: Iron Valiant (Atk/SpA), Iron Hands (Atk), Iron Bundle (SpA), Iron Treads (Atk).',
    category: 'Juego',
    related: ['paradox', 'protosynthesis'],
  },
  // ─── Conceptos avanzados ─────────────────────────────────────────────
  {
    slug: 'momentum',
    term: 'Momentum',
    short: 'Control del flujo de la partida. Quién dicta los próximos turnos.',
    body: '**Momentum** = concepto abstracto: quién está controlando el flujo de la partida. Si fuerzas al rival a hacer switches defensivos mientras tú atacas, tienes el momentum.\n\nClave: los **pivot moves** (U-turn, Volt Switch) mantienen momentum. Los **walls** lo reseteen.',
    category: 'Estrategia',
    related: ['pivot'],
  },
  {
    slug: 'switch-in',
    term: 'Switch-in',
    short: 'Pokémon que entra al campo. Su habilidad/item pueden activarse al entrar.',
    body: '**Switch-in** = el momento en que un Pokémon entra a la batalla.\n\nQué se activa al entrar:\n- **Habilidades** "on switch-in": Intimidate, Drought, Drizzle, Sand Stream, Snow Warning, Hadron Engine, Orichalcum Pulse, Protosynthesis (bajo condiciones)\n- **Hazards** dañan al switch-in (Stealth Rock, Spikes, Toxic Spikes)\n- **Sticky Web** lower Spe -1\n- **Items consumibles** se activan inmediatamente si las condiciones cumplen (ej: Booster Energy)',
    category: 'Estrategia',
    related: ['hazards', 'pivot'],
  },
  {
    slug: 'choice-lock',
    term: 'Choice lock',
    short: 'Estar locked a un move después de usar Choice Scarf/Specs/Band.',
    body: '**Choice lock** = restricción de los items Choice (Scarf, Specs, Band, Trick item swap).\n\nReglas:\n- Una vez eliges un move, **estás locked a ese move** hasta cambiar de Pokémon\n- A cambio del lock, el Choice da boost ×1.5 a la stat correspondiente (Scarf=Spe, Specs=SpA, Band=Atk)\n\nManiobra: **Trick / Switcheroo** roba el Choice rival, transfiriendo el lock.',
    category: 'Estrategia',
    related: ['sweeper'],
  },
  {
    slug: '50-50',
    term: '50/50',
    short: 'Situación donde dos opciones del rival son igualmente probables. No se puede predecir.',
    body: '**50/50** = situación donde tu rival tiene dos opciones igualmente probables y debes "adivinar" cuál. Ejemplos:\n\n- Tu Garchomp vs Glaceon: si te quedas, te puede pegar Ice Beam (te 1HKO). Si cambias, te quedas vulnerable a algo más.\n- Tu Pokémon weak a Earthquake vs Garchomp: ¿cambia o se queda a EQ?\n\nLos competitivos top son los que pierden menos 50/50 porque leen patrones de su rival.',
    category: 'Estrategia',
    related: ['momentum'],
  },
  {
    slug: 'win-condition',
    term: 'Win Condition (Wincon)',
    short: 'El Pokémon o estrategia que va a cerrar la partida si todo va bien.',
    body: '**Win Condition** (o "wincon") = el Pokémon o secuencia que va a ganarte la partida si llegas al endgame.\n\nEjemplos:\n- Tu Calyrex-Shadow es el wincon: limpiar últimos 2-3 con Astral Barrage\n- Tu Hatterene + Calyrex-Ice TR core es el wincon\n- Tu Kingambit Supreme Overlord es el wincon de fin de partida\n\nClave: **proteger tu wincon** durante midgame. Sacrificar piezas si hace falta.',
    category: 'Estrategia',
    related: ['sweeper'],
  },
  // ─── Misc ────────────────────────────────────────────────────────────
  {
    slug: 'shiny',
    term: 'Shiny',
    short: 'Variante de color rara de cada Pokémon. ~1/4096 spawn natural.',
    body: '**Shiny** = variante de color rara y única de cada Pokémon. Sin diferencia stats; solo cosmético + valor de coleccionista.\n\nRates:\n- **Spawn salvaje normal**: 1/4096 (Gen 6+)\n- **Masuda Method** (breeding con padre extranjero): 1/683\n- **Shiny Charm** (item post-Pokédex completa): 1/1365\n- **Sándwich con Sparkling Power 3** (SV): 1/512',
    category: 'Juego',
  },
  {
    slug: 'ev-spread',
    term: 'EV spread',
    short: 'La distribución de los 510 EVs entre los 6 stats de un Pokémon.',
    body: '**EV spread** = la distribución específica de los 510 EVs disponibles.\n\nFormatos comunes:\n- **252/252/4** (full offensive): 252 Atk/SpA + 252 Spe + 4 sobrante\n- **252/252/4** (full defensive): 252 HP + 252 Def/SpD + 4\n- **Mixed spreads** (VGC): ej. 244 HP / 4 Atk / 252 SpD para tank híbrido\n\nMira nuestro [EV Optimizer](/tools/ev-optimizer) para benchmarks competitivos.',
    category: 'Estadísticas',
    related: ['ev', 'iv'],
  },
  {
    slug: 'fake-out',
    term: 'Fake Out',
    short: 'Move signature de turnos 1: prioridad +3 + 100% flinch chance.',
    body: '**Fake Out** = move clave en VGC.\n\nMecánica:\n- **Solo funciona turno 1** desde que entras al campo\n- **+3 priority** (va antes de casi todo)\n- 40 BP físico Normal\n- **100% flinch** si el rival no se ha movido aún\n\nPokémon con Fake Out: Incineroar, Ambipom, Mienshao, Hitmontop, Iron Hands (vía Quark Drive sweeper but Fake Out util). Usarlo turn 1 = -1 turno al rival.',
    category: 'Mecánicas',
    related: ['priority', 'doubles'],
  },
  {
    slug: 'intimidate',
    term: 'Intimidate',
    short: 'Habilidad: al entrar, reduce Atk físico del rival -1.',
    body: '**Intimidate** = habilidad de Salamence, Incineroar, Landorus-T, Mawile, Gyarados, Arbok, etc.\n\nEfecto: al **entrar al campo**, todos los rivales activos pierden -1 Atk físico.\n\nEn dobles, intimida a ambos rivales = -2 Atk total al equipo enemigo.\nCounters:\n- **Clear Body / Hyper Cutter / White Smoke / Defiant**: bloquean Intimidate\n- **Defiant**: además sube +2 Atk al ser intimidado\n\nMás impactante move de utility en VGC. Incineroar 60% usage gracias a Intimidate.',
    category: 'Mecánicas',
    related: ['pivot'],
  },
  {
    slug: 'ditto',
    term: 'Ditto',
    short: 'Pokémon que copia al rival con Transform. Item key: Choice Scarf + Imposter.',
    body: '**Ditto** es Pokémon único: solo aprende **Transform** + Struggle.\n\nMecánica: copia stats, moves, habilidad y typing del rival al entrar.\n\nCompetitivamente:\n- **Imposter** (ability): transforma automáticamente al entrar (en lugar de gastar turn 1 usando Transform)\n- **Choice Scarf**: dobla Spe del copiado\n- IVs: bajo Spe (0) NO se transfiere; el Spe de Ditto sí cuenta',
    category: 'Juego',
  },
  {
    slug: 'rage-fist',
    term: 'Rage Fist',
    short: 'Move signature de Annihilape. +50 BP por cada hit recibido en la partida.',
    body: '**Rage Fist** es el signature move de **Annihilape**.\n\nMecánica:\n- **50 BP base**\n- **+50 BP por cada hit recibido** durante la partida actual\n- Cap a 350 BP\n\nDespués de aguantar 4-5 hits, Rage Fist se convierte en 250-300 BP STAB Ghost + tipo Lucha (segunda STAB). Hace OHKO consistente al endgame.',
    category: 'Mecánicas',
    related: ['stab'],
  },
  {
    slug: 'sucker-punch',
    term: 'Sucker Punch',
    short: 'Priority +1 Dark. Solo funciona si el rival va a atacar este turno.',
    body: '**Sucker Punch** = move clave Dark.\n\nMecánica:\n- **+1 priority** físico\n- 70 BP\n- **Falla si el rival selecciona status/protect**\n\nUso clásico: Kingambit Sucker Punch + Iron Head/Kowtow Cleave coverage. Adivinas si el rival va a atacar o cambiar.',
    category: 'Mecánicas',
    related: ['priority'],
  },
  {
    slug: 'taunt',
    term: 'Taunt',
    short: 'Status move que impide al rival usar status moves durante 3 turnos.',
    body: '**Taunt** (Dark, status) impide al rival usar moves **no-attacking** durante 3 turnos.\n\nBloquea: setup (Swords Dance), recovery (Roost), Trick Room, Stealth Rock, Will-O-Wisp, etc. **Counter perfecto a walls y setup sweepers**.\n\nMental Herb cancela el primer Taunt. Magic Bounce (Hatterene) lo devuelve al rival.',
    category: 'Mecánicas',
    related: ['setup'],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}

// Categories indexable
export const GLOSSARY_CATEGORIES = Array.from(
  new Set(GLOSSARY.map((t) => t.category))
);
