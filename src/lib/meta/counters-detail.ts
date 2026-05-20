// Detailed counter data, curated for the most-searched Pokémon in competitive
// Gen 9. This powers the /pokedex/[id]/counters SEO landing pages — captures
// queries like "how to beat kingambit", "counters to landorus", etc.
//
// Mantenimiento: actualizar 1× por temporada VGC / cuando el meta SV cambie.

export interface DetailedCounter {
  /** PokéAPI numeric id */
  id: number;
  /** Why this counters the target — 1 short sentence in Spanish */
  reason: string;
  /** Move/set that makes it work (optional) */
  set?: string;
  /** Confidence tier: hard = beats almost any set, check = situational */
  tier: 'hard' | 'check';
}

export interface CounterEntry {
  /** Featured Pokémon id this entry is about */
  targetId: number;
  /** General overview — 1-2 sentences why this Pokémon is hard to face */
  overview: string;
  /** Tags: STAB types, common roles */
  threat: string[];
  /** Hand-curated counter list (hard + check) */
  counters: DetailedCounter[];
  /** Generic strategies to beat it — 3-5 bullets */
  strategies: string[];
  /** Common sets you'll face (so user can plan) */
  commonSets?: { name: string; item: string; ability: string; movesHint: string }[];
}

// Curated counters DB. We cover the 24 featured Pokémon from the sitemap.
// For starters / older legendaries, the entry is intentionally lighter
// since competitive relevance is limited.
export const COUNTERS_DB: Record<number, CounterEntry> = {
  // === FEATURED COMPETITIVE TIER (Gen 9 OU / VGC SV) ===

  983: {
    // Kingambit
    targetId: 983,
    overview:
      'Wallbreaker físico con Supreme Overlord que escala con cada aliado debilitado. ' +
      'Su STAB Iron Head + Kowtow Cleave en Tera Flying es una de las amenazas late-game más temidas del meta.',
    threat: ['Acero/Siniestro', 'Wallbreaker', 'Late-game cleaner'],
    counters: [
      { id: 445, tier: 'hard', reason: 'Resiste Iron Head y revienta con Earthquake STAB.', set: 'Scarf Earthquake' },
      { id: 472, tier: 'hard', reason: 'Gliscor inmune a Earthquake, recupera con Poison Heal y aguanta hits físicos.', set: 'Toxic Heal Defensive' },
      { id: 984, tier: 'hard', reason: 'Great Tusk OHKO con Close Combat tras chequeo de Sucker Punch.', set: 'AV Tusk' },
      { id: 968, tier: 'hard', reason: 'Iron Hands aguanta físicos y mata con Drain Punch.', set: 'AV Iron Hands' },
      { id: 1017, tier: 'check', reason: 'Ogerpon-Wellspring resiste y golpea con Ivy Cudgel + Water immunity flip.' },
      { id: 1003, tier: 'check', reason: 'Iron Treads Rapid Spin + EQ STAB lo presiona.' },
    ],
    strategies: [
      'No dejes que llegue al late-game con +4 aliados debilitados — su damage es exponencial.',
      'Cuidado con Sucker Punch: si vas a atacar y no puedes OHKO, espera con un status move.',
      'Forzarle a tera Flying neutraliza Earthquake pero pierde STAB Iron Head — buen trade para ti.',
      'Burn (Will-O-Wisp, Scald) reduce su Attack a la mitad y lo deja muerto.',
    ],
    commonSets: [
      { name: 'Tera Flying SD', item: 'Black Glasses', ability: 'Supreme Overlord', movesHint: 'Kowtow Cleave / Sucker Punch / Iron Head / Swords Dance' },
      { name: 'Lum Berry SD', item: 'Lum Berry', ability: 'Supreme Overlord', movesHint: 'Swords Dance / Kowtow Cleave / Sucker Punch / Iron Head' },
    ],
  },

  984: {
    // Great Tusk
    targetId: 984,
    overview:
      'Pivot físico ofensivo + Rapid Spin. Su Protosynthesis Atk en sol o con Booster Energy lo convierte en uno de los mejores wallbreakers del tier.',
    threat: ['Tierra/Lucha', 'Hazard Remover', 'Físico bulky'],
    counters: [
      { id: 887, tier: 'hard', reason: 'Dragapult inmune a Close Combat y Earthquake, le dispara Draco/Hex.' },
      { id: 858, tier: 'hard', reason: 'Hatterene tanquea físicos y dispara Psychic / Mystical Fire.' },
      { id: 1017, tier: 'hard', reason: 'Ogerpon-Wellspring resiste Tierra y OHKO con Ivy Cudgel.' },
      { id: 169, tier: 'check', reason: 'Crobat lo presiona con Brave Bird, inmune a Earthquake.' },
      { id: 145, tier: 'check', reason: 'Zapdos Static + Discharge le complica el switch.' },
    ],
    strategies: [
      'Voladores e inmunes a Tierra lo dejan sin STAB principal.',
      'Si Tera Steel: hits físicos defensivos lo paran.',
      'No le des oportunidad de poner Rapid Spin — fuerza el switch antes.',
      'Hadas físicamente bulky (Hatterene) tanquean Close Combat sin problema.',
    ],
  },

  1000: {
    // Gholdengo
    targetId: 1000,
    overview:
      'Spinblocker + Good as Gold (inmune a status moves no-damaging). Counterea hazards y carga Nasty Plot para barrer.',
    threat: ['Acero/Fantasma', 'Spinblocker', 'Special sweeper'],
    counters: [
      { id: 983, tier: 'hard', reason: 'Kingambit Sucker Punch + STAB Siniestro lo OHKO.' },
      { id: 887, tier: 'hard', reason: 'Dragapult outspeed + Shadow Ball STAB.' },
      { id: 1006, tier: 'hard', reason: 'Iron Valiant Moonblast / Close Combat lo borra.' },
      { id: 727, tier: 'check', reason: 'Incineroar Knock Off + Intimidate lo neutraliza.' },
      { id: 248, tier: 'check', reason: 'Tyranitar Crunch + Pursuit/Knock lo presiona.' },
    ],
    strategies: [
      'Good as Gold lo hace inmune a Toxic / Will-O-Wisp / Encore — solo daño directo lo para.',
      'Knock Off le quita el item (suele llevar Air Balloon o Choice Specs).',
      'Su Acero defensive es bueno, pero pierde a Tierra/Lucha/Fuego.',
      'Si carga Nasty Plot sin amenaza, force el switch con tu pegador especial más fuerte.',
    ],
  },

  149: {
    // Dragonite
    targetId: 149,
    overview:
      'Multiscale + Roost + Extreme Speed = la set definition de "win condition". Setup con Dragon Dance y limpia.',
    threat: ['Dragón/Volador', 'Setup sweeper', 'Multiscale'],
    counters: [
      { id: 471, tier: 'hard', reason: 'Glaceon Ice Beam STAB OHKO incluso con Multiscale roto.' },
      { id: 887, tier: 'hard', reason: 'Dragapult Draco/Shadow Ball outspeed.' },
      { id: 983, tier: 'hard', reason: 'Kingambit Iron Head + Sucker Punch lo neutraliza.' },
      { id: 144, tier: 'check', reason: 'Articuno Freeze-Dry doble efectivo.' },
      { id: 460, tier: 'check', reason: 'Abomasnow Blizzard + Hail chip lo presiona.' },
    ],
    strategies: [
      'Rompe Multiscale primero con cualquier hit chip (hazards, weather).',
      'Hielo es 4× efectivo — el counter tipo más obvio.',
      'Si está a full HP con Heavy-Duty Boots, vas a necesitar 2 turnos para tumbarlo.',
      'Encore en Dragon Dance lo locked en el setup move — opening perfecto para tu sweeper.',
    ],
  },

  445: {
    // Garchomp
    targetId: 445,
    overview:
      'Pseudo-legendario clásico, ahora Scale Shot le da boost de Speed y rompe Multiscale. Sigue siendo top wallbreaker.',
    threat: ['Dragón/Tierra', 'Físico ofensivo', 'Scale Shot'],
    counters: [
      { id: 471, tier: 'hard', reason: 'Glaceon Ice Beam OHKO doble efectivo.' },
      { id: 144, tier: 'hard', reason: 'Articuno Freeze-Dry / Ice Beam dominante.' },
      { id: 1017, tier: 'hard', reason: 'Ogerpon-Wellspring inmune a Tierra, OHKO con Ivy Cudgel.' },
      { id: 460, tier: 'check', reason: 'Abomasnow Blizzard + Snow Warning.' },
      { id: 478, tier: 'check', reason: 'Froslass Spikes + Ice STAB.' },
    ],
    strategies: [
      'Tipo Hielo es 4× efectivo — usar Glaceon / Articuno / Abomasnow / Mamoswine.',
      'Hadas físicamente bulky aguantan Dragon Claw / Outrage.',
      'Su Speed base 102 lo deja por debajo de Choice Scarf users — un Scarfer Mamoswine lo mata.',
      'Si Tera Steel: pierde el doble Hielo, pero gana inmunidad a Toxic — usa Lucha en su lugar.',
    ],
  },

  1006: {
    // Iron Valiant
    targetId: 1006,
    overview:
      'Hada/Lucha con Booster Energy Speed → uno de los Pokémon más rápidos del tier (Speed 116 base + boost). Mixed attacker letal.',
    threat: ['Hada/Lucha', 'Mixed sweeper', 'Booster Energy'],
    counters: [
      { id: 983, tier: 'hard', reason: 'Kingambit Sucker Punch + resistencias dobles a sus STABs.' },
      { id: 887, tier: 'hard', reason: 'Dragapult outspeed (incluso sin booster) y revienta con Shadow Ball.' },
      { id: 727, tier: 'check', reason: 'Incineroar Intimidate + Knock Off le quita Booster.' },
      { id: 1000, tier: 'check', reason: 'Gholdengo resiste Hada STAB, hits especiales.' },
      { id: 145, tier: 'check', reason: 'Zapdos Volt Switch + bulk especial.' },
    ],
    strategies: [
      'Knock Off antes de que active Booster Energy = lo neutralizas la partida.',
      'Acero resiste tanto Hada como Psychic (parte de su cobertura) — Kingambit / Iron Treads / Gholdengo.',
      'Sucker Punch / Extreme Speed lo mata desde priority sin importar setup.',
      'Tera Steel lo arregla defensivamente pero pierde el doble STAB ofensivo.',
    ],
  },

  887: {
    // Dragapult
    targetId: 887,
    overview:
      'Speed base 142, mixed attacker. Sets: Choice Specs Draco / SD físico Dragon Dance / Will-O Hex utility.',
    threat: ['Dragón/Fantasma', 'Ultra-fast', 'Mixed sweeper'],
    counters: [
      { id: 983, tier: 'hard', reason: 'Kingambit Iron Head + Sucker Punch (inmune a Ghost).' },
      { id: 211, tier: 'hard', reason: 'Qwilfish-Hisui Intimidate + Hada/Veneno STAB anti-Draco.' },
      { id: 727, tier: 'hard', reason: 'Incineroar Intimidate + Bulldoze, tanquea físicos.' },
      { id: 248, tier: 'check', reason: 'Tyranitar Crunch + Sand bonus SpD.' },
      { id: 968, tier: 'check', reason: 'Iron Hands AV tanquea hits especiales y mata físicos.' },
    ],
    strategies: [
      'Inmune a Ground / Fighting / Normal — no le mandes Pokémon Lucha sin Ghost coverage.',
      'Hadas físicamente bulky son la mejor respuesta defensiva.',
      'Choice Scarf Tyranitar/Garchomp lo outspeed locked en move.',
      'Disable / Encore lockean su Choice Specs Draco = oportunidad de free switch.',
    ],
  },

  727: {
    // Incineroar
    targetId: 727,
    overview:
      'El pivot más usado de VGC SV: Intimidate switch-in + Fake Out + Parting Shot. Define el meta doubles.',
    threat: ['Fuego/Siniestro', 'VGC Pivot', 'Intimidate'],
    counters: [
      { id: 392, tier: 'hard', reason: 'Infernape Close Combat OHKO + outspeed.' },
      { id: 65, tier: 'hard', reason: 'Alakazam Psychic STAB hit fuerte (cuidado con Knock).' },
      { id: 9, tier: 'hard', reason: 'Blastoise Hydro Pump / Surf doble efectivo.' },
      { id: 28, tier: 'check', reason: 'Sandslash STAB Earthquake (doble efectivo).' },
      { id: 130, tier: 'check', reason: 'Gyarados Intimidate counter + Waterfall.' },
    ],
    strategies: [
      'Lucha STAB es doble efectivo — Iron Hands, Great Tusk son mejores.',
      'Si lleva Assault Vest: especiales fuertes lo presionan.',
      'Su rol es pivot, no win-con — ignóralo y mata sus partners primero.',
      'Knock Off le quita los Sitrus / Safety Goggles.',
    ],
  },

  903: {
    // Sneasler
    targetId: 903,
    overview:
      'Lucha/Veneno con Unburden — al gastar el item duplica Speed. Acrobatics + Dire Claw lo hacen letal.',
    threat: ['Lucha/Veneno', 'Setup sweeper', 'Unburden'],
    counters: [
      { id: 727, tier: 'hard', reason: 'Incineroar Intimidate + Knock le quita el item antes de que active.' },
      { id: 472, tier: 'hard', reason: 'Gliscor Poison Heal cura Dire Claw status, inmune a Tierra/Veneno.' },
      { id: 6, tier: 'hard', reason: 'Charizard Air Slash STAB OHKO (doble efectivo).' },
      { id: 145, tier: 'check', reason: 'Zapdos Discharge + tipo Voladior resiste.' },
    ],
    strategies: [
      'Si no le dejas activar Unburden, no es amenaza.',
      'Hadas resistentes a Lucha (Hatterene) lo aguantan.',
      'Voladores son fuertes — Acrobatics no doble efectivo y le ganas con Air Slash.',
      'Si Tera Flying: pierde el doble Voladior, gana inmunidad Tierra.',
    ],
  },

  1017: {
    // Ogerpon (Wellspring form en meta)
    targetId: 1017,
    overview:
      'Hada base + Tera obligatoria. Forma Wellspring (Agua) es la más común en OU. Embody Aspect le da boost al cambiar a Tera.',
    threat: ['Planta + Tera (Agua/Fuego/Roca)', 'Sweeper físico'],
    counters: [
      { id: 983, tier: 'hard', reason: 'Kingambit Iron Head OHKO (sin Tera) + Sucker Punch.' },
      { id: 145, tier: 'hard', reason: 'Zapdos Discharge / Hurricane neutraliza Wellspring.' },
      { id: 6, tier: 'hard', reason: 'Charizard Flamethrower / Air Slash en form Wellspring.' },
      { id: 887, tier: 'check', reason: 'Dragapult Shadow Ball + outspeed.' },
    ],
    strategies: [
      'Conoce la form ANTES de cambiar — Wellspring (azul) = Agua, Hearthflame (rojo) = Fuego, etc.',
      'Cada form tiene weakness diferente: aprende sus 4 Tera resistencias.',
      'El boost de Embody Aspect ocurre al cambiar a Tera — fuerza el setup con priority hits antes.',
      'Hadas resistentes (Kingambit) o Acero (Gholdengo) tanquean Ivy Cudgel.',
    ],
  },

  1021: {
    // Raging Bolt
    targetId: 1021,
    overview:
      'Electric/Dragon especial. Protosynthesis SpA en sol o con Booster. Calm Mind sets son devastadores.',
    threat: ['Eléctrico/Dragón', 'Special sweeper', 'Setup'],
    counters: [
      { id: 983, tier: 'hard', reason: 'Kingambit Iron Head / Sucker Punch lo mata.' },
      { id: 472, tier: 'hard', reason: 'Gliscor Toxic Heal + Earthquake immune.' },
      { id: 887, tier: 'check', reason: 'Dragapult Draco Meteor / outspeed.' },
      { id: 968, tier: 'check', reason: 'Iron Hands AV tanquea especiales.' },
    ],
    strategies: [
      'Tierra es doble efectivo si Tera Electric — Garchomp / Great Tusk lo barren.',
      'Hadas (Iron Valiant) lo presionan defensivamente.',
      'Su Speed base 75 es bajísimo — cualquier Scarfer lo outspeed.',
      'Si setup Calm Mind: Encore + priority físico antes de que llegue a +2.',
    ],
  },

  // === STARTERS / OLD LEGENDS ===
  // Lighter entries — competitive relevance is limited in standard SV OU.

  3: {
    // Venusaur
    targetId: 3,
    overview:
      'Starter Gen 1 con Chlorophyll — relevante en equipos sol. Sleep Powder + Giga Drain en lluvia/clima.',
    threat: ['Planta/Veneno', 'Sun sweeper'],
    counters: [
      { id: 6, tier: 'hard', reason: 'Charizard Fire Blast doble efectivo, outspeed sin sol.' },
      { id: 887, tier: 'hard', reason: 'Dragapult Shadow Ball outspeed.' },
      { id: 149, tier: 'check', reason: 'Dragonite Hurricane / Multiscale tank.' },
    ],
    strategies: [
      'Fuego / Volador / Hielo / Psíquico / Fantasma todos super-efectivos.',
      'Sin sol, su Speed es solo 80 — cualquier scarfer lo outspeed.',
      'Sleep Powder es su as — Lum Berry o ya-dormido neutraliza.',
    ],
  },

  6: {
    // Charizard
    targetId: 6,
    overview:
      'Starter Gen 1 más icónico. En SV: sets Tera Dragon Belly Drum / Choice Specs Fire Blast.',
    threat: ['Fuego/Volador', 'Special attacker'],
    counters: [
      { id: 248, tier: 'hard', reason: 'Tyranitar Stone Edge 4× efectivo en Roca.' },
      { id: 145, tier: 'hard', reason: 'Zapdos Discharge + bulky tank.' },
      { id: 1021, tier: 'check', reason: 'Raging Bolt Thunderclap STAB hit.' },
    ],
    strategies: [
      'Roca es 4× efectivo — Stealth Rock le quita el 50% al entrar.',
      'Eléctrico STAB lo mata fácil.',
      'Si Tera Dragon: cambia debilidades, pero Hielo sigue eficaz.',
    ],
  },

  9: {
    // Blastoise
    targetId: 9,
    overview:
      'Starter Gen 1, ahora con Tera Water boost. Shell Smash + spread coverage.',
    threat: ['Agua', 'Bulky special'],
    counters: [
      { id: 1021, tier: 'hard', reason: 'Raging Bolt Thunderbolt OHKO.' },
      { id: 1017, tier: 'check', reason: 'Ogerpon-Wellspring Ivy Cudgel + Storm Drain absorb.' },
    ],
    strategies: [
      'Eléctrico / Planta lo borran.',
      'Sin Shell Smash es manejable; con setup, es win-con.',
    ],
  },

  150: {
    // Mewtwo
    targetId: 150,
    overview:
      'Legendario Ubers tier. Speed base 130 + SpA 154. Calm Mind / Nasty Plot sweeper.',
    threat: ['Psíquico', 'Ultra special'],
    counters: [
      { id: 983, tier: 'hard', reason: 'Kingambit Sucker Punch + inmune a Psychic STAB.' },
      { id: 887, tier: 'check', reason: 'Dragapult Shadow Ball + outspeed.' },
    ],
    strategies: [
      'Tipo Siniestro inmune a Psychic STAB.',
      'Banido a Ubers — solo lo verás en ese formato.',
    ],
  },

  151: {
    // Mew
    targetId: 151,
    overview:
      'Versátil — puede aprender casi todo. Sets típicos: Stealth Rock / Knock Off / Toxic utility.',
    threat: ['Psíquico', 'Utility'],
    counters: [
      { id: 983, tier: 'hard', reason: 'Kingambit Sucker Punch + Knock Off.' },
      { id: 727, tier: 'check', reason: 'Incineroar Knock + Intimidate.' },
    ],
    strategies: [
      'No tiene rol claro — depende del set. Knock Off para quitar utilities.',
      'Tipo Siniestro o Fantasma para inmunidad a Psychic.',
    ],
  },

  248: {
    // Tyranitar
    targetId: 248,
    overview:
      'Pseudo-legendario. Sand Stream + Assault Vest tank. STAB Crunch / Stone Edge / Earthquake spread.',
    threat: ['Roca/Siniestro', 'Sand setter', 'Bulky'],
    counters: [
      { id: 1017, tier: 'hard', reason: 'Ogerpon-Wellspring Ivy Cudgel doble efectivo.' },
      { id: 968, tier: 'hard', reason: 'Iron Hands Drain Punch 4× efectivo (Lucha vs Roca/Siniestro).' },
      { id: 984, tier: 'check', reason: 'Great Tusk Close Combat OHKO.' },
    ],
    strategies: [
      'Lucha 4× efectivo — Iron Hands, Great Tusk, Quaquaval.',
      'Agua / Hada también doblan.',
      'Sand chip al final del turno te limita switch-ins frágiles.',
    ],
  },

  376: {
    // Metagross
    targetId: 376,
    overview:
      'Pseudo-legendario clásico. Tough Claws + STAB Meteor Mash / Bullet Punch priority.',
    threat: ['Acero/Psíquico', 'Físico bulky'],
    counters: [
      { id: 6, tier: 'hard', reason: 'Charizard Fire Blast doble efectivo, outspeed.' },
      { id: 472, tier: 'hard', reason: 'Gliscor Toxic Heal + Earthquake STAB.' },
      { id: 727, tier: 'check', reason: 'Incineroar Intimidate + Fire STAB.' },
    ],
    strategies: [
      'Fuego / Tierra / Fantasma / Siniestro lo presionan.',
      'Su Speed 70 es bajo — outspeed con scarfer.',
    ],
  },

  448: {
    // Lucario
    targetId: 448,
    overview:
      'Acero/Lucha. Sets: Swords Dance + Extreme Speed priority, o Nasty Plot especial.',
    threat: ['Acero/Lucha', 'Priority sweeper'],
    counters: [
      { id: 6, tier: 'hard', reason: 'Charizard Air Slash + outspeed sin Choice Scarf.' },
      { id: 472, tier: 'hard', reason: 'Gliscor Earthquake STAB.' },
      { id: 145, tier: 'check', reason: 'Zapdos Hurricane / bulk special.' },
    ],
    strategies: [
      'Fuego / Tierra / Lucha lo neutralizan.',
      'Su Speed 90 es promedio — cualquier scarfer lo outspeed.',
      'Extreme Speed priority es peligroso si está a +2 SD.',
    ],
  },

  658: {
    // Greninja
    targetId: 658,
    overview:
      'Speed base 122 + Protean (cambia a tipo del move usado). Sets: Specs Hydro / Spikes / Toxic Spikes.',
    threat: ['Agua/Siniestro', 'Speed sweeper'],
    counters: [
      { id: 968, tier: 'hard', reason: 'Iron Hands Drain Punch tanquea y mata.' },
      { id: 169, tier: 'check', reason: 'Crobat Brave Bird outspeed.' },
      { id: 1017, tier: 'check', reason: 'Ogerpon-Wellspring Storm Drain + Ivy Cudgel.' },
    ],
    strategies: [
      'Eléctrico / Planta / Hada / Lucha lo presionan.',
      'Protean lo deja sin STAB neutral después del primer move — predict matters.',
      'Choice Specs lockea en move — Encore le destruye el momentum.',
    ],
  },

  // === STARTERS BEBÉ — relevancia competitiva = nula ===
  // Entradas mínimas — la página existirá pero será corta.

  1: {
    targetId: 1,
    overview:
      'Bulbasaur es la primera etapa de Venusaur. No tiene relevancia competitiva — espera a su evolución final.',
    threat: ['Planta/Veneno', 'Starter Gen 1'],
    counters: [
      { id: 6, tier: 'check', reason: 'Charmander STAB Fuego doble efectivo.' },
      { id: 16, tier: 'check', reason: 'Pidgey Gust resiste y golpea.' },
    ],
    strategies: ['Fuego, Hielo, Volador o Psíquico para dominar.'],
  },

  4: {
    targetId: 4,
    overview:
      'Charmander, primera etapa de Charizard. Sin relevancia competitiva en su forma base.',
    threat: ['Fuego', 'Starter Gen 1'],
    counters: [
      { id: 7, tier: 'check', reason: 'Squirtle Water Gun doble efectivo.' },
      { id: 95, tier: 'check', reason: 'Onix Rock Throw doble eficaz.' },
    ],
    strategies: ['Agua, Roca o Tierra son super-efectivos.'],
  },

  7: {
    targetId: 7,
    overview:
      'Squirtle, primera etapa de Blastoise. Espera a evolucionar para impacto real.',
    threat: ['Agua', 'Starter Gen 1'],
    counters: [
      { id: 1, tier: 'check', reason: 'Bulbasaur Vine Whip doble efectivo.' },
      { id: 25, tier: 'check', reason: 'Pikachu Thunder Shock doble eficaz.' },
    ],
    strategies: ['Planta o Eléctrico lo borran.'],
  },

  25: {
    targetId: 25,
    overview:
      'Pikachu — la mascota de la franquicia, no del meta. Light Ball duplica sus stats ofensivos pero sigue siendo NU/PU tier.',
    threat: ['Eléctrico', 'Mascota'],
    counters: [
      { id: 28, tier: 'hard', reason: 'Sandshrew/Sandslash inmune a Eléctrico.' },
      { id: 50, tier: 'check', reason: 'Diglett Earthquake STAB.' },
    ],
    strategies: [
      'Tierra inmune a Eléctrico.',
      'Cualquier defensa especial decente lo aguanta.',
    ],
  },
};

export function getCounterEntry(id: number): CounterEntry | undefined {
  return COUNTERS_DB[id];
}

export function hasCounterDetail(id: number): boolean {
  return id in COUNTERS_DB;
}

export const ALL_COUNTER_IDS = Object.keys(COUNTERS_DB).map(Number);
