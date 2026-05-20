// Cambios notables por generación para los Pokémon más relevantes.
// PokéAPI no expone snapshots históricos de stats — data curada a mano.
//
// Sirve la página /pokedex/[id]/history que capta queries SEO tipo
// "garchomp gen 4 vs gen 9 stats", "gengar perdió levitate cuándo", etc.

export type Gen =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9;

export interface GenChange {
  gen: Gen;
  /** Game(s) que introducen el cambio */
  game: string;
  changes: string[];
}

export interface PokemonHistory {
  pokemonId: number;
  /** En qué gen apareció por primera vez */
  introducedIn: Gen;
  /** Eventos clave (cambios de stats, habilidad, tipo, movepool, banlist) */
  timeline: GenChange[];
  /** Resumen ejecutivo */
  summary: string;
}

export const POKEMON_HISTORY: Record<number, PokemonHistory> = {
  // === GENGAR (94) — clásico de cambios notables ===
  94: {
    pokemonId: 94,
    introducedIn: 1,
    summary:
      'Gengar pasó de ser un sweeper élite con Levitate a un atacante medio cuando se la quitaron en Gen 7. Quizás el "nerf" más notable de la franquicia competitiva.',
    timeline: [
      { gen: 1, game: 'Red/Blue', changes: ['Debut como Fantasma/Veneno. Stats: 60/65/60/130/75/110 (BST 500).'] },
      { gen: 3, game: 'Ruby/Sapphire', changes: ['Habilidad oculta introducida (todavía Levitate como única).'] },
      { gen: 6, game: 'X/Y', changes: ['Mega Gengar añadido — BST 600, Speed 130, habilidad Shadow Tag. Domina OU como wallbreaker.'] },
      { gen: 7, game: 'Sun/Moon', changes: ['Mega Gengar retirado de competitivo. Ability principal cambia a Cursed Body en Gen 7.'] },
      { gen: 8, game: 'Sword/Shield', changes: ['Sigue con Cursed Body — pierde Levitate definitivamente.'] },
      { gen: 9, game: 'Scarlet/Violet', changes: ['Tier OU/UU según meta — no domina como antes.'] },
    ],
  },

  // === GARCHOMP (445) ===
  445: {
    pokemonId: 445,
    introducedIn: 4,
    summary:
      'Garchomp ha sido top-tier desde su debut en Gen 4. Banido a Ubers brevemente en Gen 4 por Sand Veil + Stealth Rock. Sigue siendo OU 15 años después.',
    timeline: [
      { gen: 4, game: 'Diamond/Pearl', changes: ['Debut como pseudo-legendario Dragón/Tierra. BST 600. Stats: 108/130/95/80/85/102.'] },
      { gen: 4, game: 'DPP late', changes: ['Banido temporalmente a Ubers por Sand Veil + SR + boost de Dragon Dance.'] },
      { gen: 6, game: 'X/Y', changes: ['Mega Garchomp introducido. Speed -10 a cambio de +30 Atk/SpA, controversial.'] },
      { gen: 7, game: 'Sun/Moon', changes: ['Mega Garchomp pierde popularidad — base form vuelve a ser superior.'] },
      { gen: 8, game: 'Sword/Shield', changes: ['DLC: aprende Scale Shot — boost de Speed + rompe Multiscale. Cambia el meta.'] },
      { gen: 9, game: 'Scarlet/Violet', changes: ['Sigue OU. Pierde Mega. Scale Shot sigue siendo su mejor set.'] },
    ],
  },

  // === CHARIZARD (6) ===
  6: {
    pokemonId: 6,
    introducedIn: 1,
    summary:
      'El starter más icónico. Tiró 5 generaciones en tier bajo hasta que las Mega Evolutions de Gen 6 lo subieron a Ubers (Mega Y) y OU (Mega X). En Gen 9 vuelve a OU con sets Tera Dragon.',
    timeline: [
      { gen: 1, game: 'Red/Blue', changes: ['Debut Fuego/Volador. BST 534. Speed 100 lo hacía decente para la época.'] },
      { gen: 4, game: 'Diamond/Pearl', changes: ['Stealth Rock × 4 weakness lo destruye competitivamente.'] },
      { gen: 6, game: 'X/Y', changes: [
        'Mega Charizard X (Fuego/Dragón, Tough Claws): OU tier.',
        'Mega Charizard Y (Drought + SpA 159): Ubers tier.',
      ] },
      { gen: 7, game: 'Sun/Moon', changes: ['Mega Y sigue Ubers, X cae a UU.'] },
      { gen: 8, game: 'Sword/Shield', changes: ['Sin Megas (retiradas). Vuelve a tier bajo. Gigantamax en Dynamax pero limitado.'] },
      { gen: 9, game: 'Scarlet/Violet', changes: ['Tera Dragon + Belly Drum lo devuelve a OU. Sin necesitar Mega.'] },
    ],
  },

  // === KINGAMBIT (983) ===
  983: {
    pokemonId: 983,
    introducedIn: 9,
    summary:
      'Evolución de Bisharp introducida en Gen 9. Inmediatamente top-1 del tier por Supreme Overlord — habilidad que escala con aliados debilitados.',
    timeline: [
      { gen: 9, game: 'Scarlet/Violet base', changes: [
        'Debut como evolución de Bisharp. BST 550. Stats: 100/135/120/60/85/50.',
        'Ability Supreme Overlord (nueva): +10% Atk/SpA por aliado debilitado, hasta +50%.',
        'Sucker Punch + Kowtow Cleave + Iron Head es win-con dominante.',
      ] },
      { gen: 9, game: 'Indigo Disk DLC', changes: ['Sin cambios en stats. Acceso a TM Tera Blast lo mantiene OU top-3.'] },
    ],
  },

  // === DRAGAPULT (887) ===
  887: {
    pokemonId: 887,
    introducedIn: 8,
    summary:
      'Pseudo-legendario de Gen 8. Speed base 142 lo hace uno de los Pokémon más rápidos del juego. Mixed attacker con Specs Draco / DD físico.',
    timeline: [
      { gen: 8, game: 'Sword/Shield', changes: [
        'Debut Dragón/Fantasma. BST 600. Stats: 88/120/75/100/75/142.',
        'Sets dominantes: Choice Specs Draco / Dragon Dance / Substitute Hex.',
      ] },
      { gen: 8, game: 'Crown Tundra DLC', changes: ['Sigue OU. Sin cambios mecánicos.'] },
      { gen: 9, game: 'Scarlet/Violet', changes: ['Mantiene OU. Tera Ghost / Tera Fairy lo hacen incluso más versátil.'] },
    ],
  },

  // === INCINEROAR (727) ===
  727: {
    pokemonId: 727,
    introducedIn: 7,
    summary:
      'Starter de Gen 7. En singles fue UU/RU, pero en VGC se convirtió en el Pokémon más usado de Gen 7, 8 y 9 — por la combinación Intimidate + Fake Out + Parting Shot.',
    timeline: [
      { gen: 7, game: 'Sun/Moon', changes: ['Debut Fuego/Siniestro. BST 530. Ability Blaze (oculta: Intimidate).'] },
      { gen: 7, game: 'USUM', changes: ['VGC tier S inmediato — pivot definitivo.'] },
      { gen: 8, game: 'Sword/Shield', changes: ['Vetado de singles OU brevemente — luego permitido. VGC sigue top-1.'] },
      { gen: 9, game: 'Scarlet/Violet base', changes: ['NO disponible base SV.'] },
      { gen: 9, game: 'Indigo Disk DLC', changes: ['Añadido al juego. VGC SV Reg G/H: vuelve a ser el pivot más usado.'] },
    ],
  },

  // === MEWTWO (150) ===
  150: {
    pokemonId: 150,
    introducedIn: 1,
    summary:
      'El primer banned-to-Ubers de la historia (1999). Su BST 680 y movepool han sido demasiado para OU desde el inicio.',
    timeline: [
      { gen: 1, game: 'Red/Blue', changes: ['Debut. BST 680. Stats: 106/110/90/154/90/130.'] },
      { gen: 1, game: 'Smogon early days', changes: ['Banido a Ubers — primera vez que se banea un Pokémon en formato comunitario.'] },
      { gen: 6, game: 'X/Y', changes: ['Mega Mewtwo X (BST 780) y Mega Mewtwo Y (BST 780) — ambos en Ubers/AG.'] },
      { gen: 8, game: 'Sword/Shield', changes: ['Sin Megas. Sigue Ubers/AG.'] },
      { gen: 9, game: 'Scarlet/Violet', changes: ['No disponible en SV base. Volverá con DLC futuro.'] },
    ],
  },

  // === BLAZIKEN (257) — Speed Boost ban ===
  257: {
    pokemonId: 257,
    introducedIn: 3,
    summary:
      'Starter Fuego/Lucha de Gen 3. En Gen 5 obtuvo Speed Boost como ability oculta — banned a Ubers. Sigue Ubers en Gen 9.',
    timeline: [
      { gen: 3, game: 'Ruby/Sapphire', changes: ['Debut Fuego/Lucha. BST 530. Ability Blaze.'] },
      { gen: 5, game: 'B/W (event)', changes: ['Speed Boost (hidden ability) liberada — banido a Ubers inmediatamente.'] },
      { gen: 6, game: 'X/Y', changes: ['Mega Blaziken: Ubers/AG tier por scaling absurdo.'] },
      { gen: 8, game: 'Sword/Shield', changes: ['Sigue Ubers sin Mega.'] },
      { gen: 9, game: 'Scarlet/Violet', changes: ['Banned. Ubers.'] },
    ],
  },

  // === GHOLDENGO (1000) ===
  1000: {
    pokemonId: 1000,
    introducedIn: 9,
    summary:
      'Evolución de Gimmighoul, introducido en Gen 9. Su ability Good as Gold (inmune a status moves no-damage) cambió el meta de hazards y spinblocking.',
    timeline: [
      { gen: 9, game: 'Scarlet/Violet base', changes: [
        'Debut Acero/Fantasma. BST 550. Stats: 87/60/95/133/91/84.',
        'Good as Gold: inmunidad a Toxic/Will-O/Encore — primera ability con este efecto.',
        'Spinblocker dominante en OU.',
      ] },
      { gen: 9, game: 'Teal Mask DLC', changes: ['Sin cambios. Sigue top OU.'] },
    ],
  },

  // === GREAT TUSK (984) ===
  984: {
    pokemonId: 984,
    introducedIn: 9,
    summary:
      'Paradox del pasado (versión ancestral de Donphan). Introducido en Gen 9 con Protosynthesis — el mejor wallbreaker físico + Rapid Spin del meta.',
    timeline: [
      { gen: 9, game: 'Scarlet base', changes: [
        'Exclusivo Scarlet. BST 570. Stats: 115/131/131/53/53/87.',
        'Protosynthesis: Atk boost ×1.3 en sol o con Booster Energy.',
        'OU tier S desde día 1.',
      ] },
    ],
  },

  // === OGERPON (1017) ===
  1017: {
    pokemonId: 1017,
    introducedIn: 9,
    summary:
      'Introducido en Teal Mask DLC. Tiene 4 formas (Teal/Wellspring/Hearthflame/Cornerstone), cada una con Tera obligatorio y ability Embody Aspect.',
    timeline: [
      { gen: 9, game: 'Teal Mask DLC', changes: [
        'Debut con 4 formas. BST 550. Stats variables según máscara.',
        'Tera obligatorio = primer Pokémon "Tera-locked" del meta.',
        'Embody Aspect: al Tera, boost a una stat según forma.',
        'Form Wellspring (Agua) = tier S en OU. Hearthflame (Fuego) banned a Ubers VGC.',
      ] },
    ],
  },
};

export function getPokemonHistory(id: number): PokemonHistory | undefined {
  return POKEMON_HISTORY[id];
}

export const ALL_HISTORY_IDS = Object.keys(POKEMON_HISTORY).map(Number);

export const GEN_LABELS: Record<Gen, string> = {
  1: 'Gen 1 (1996)',
  2: 'Gen 2 (1999)',
  3: 'Gen 3 (2002)',
  4: 'Gen 4 (2006)',
  5: 'Gen 5 (2010)',
  6: 'Gen 6 (2013)',
  7: 'Gen 7 (2016)',
  8: 'Gen 8 (2019)',
  9: 'Gen 9 (2022)',
};
