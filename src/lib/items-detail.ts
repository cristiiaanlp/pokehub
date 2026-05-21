// Items competitivos curados — overlay para /database/items/[name].
//
// Solo cubrimos los items más usados en VGC/OU. Para items no listados,
// la página muestra la data live de PokéAPI sin sección de análisis.

export interface ItemNote {
  /** Slug PokéAPI canónico — debe coincidir con [name] de la URL */
  slug: string;
  /** Descripción competitiva 1-2 frases */
  description: string;
  /** Pokémon featured que lo usan habitualmente (PokéAPI ids) */
  notableUsers: number[];
  /** Tip estratégico (optional) */
  notes?: string;
  /** Tier de uso competitivo */
  tier?: 'S' | 'A' | 'B';
}

const ITEM_NOTES: Record<string, ItemNote> = {
  // === HELD ITEMS TOP TIER ===
  'choice-scarf': {
    slug: 'choice-scarf',
    description:
      '+50% Speed. Bloqueado al primer move usado. El item de revenge-killing por excelencia — convierte un Pokémon "medio rápido" en outspeed de casi todo el meta.',
    notableUsers: [248, 445, 887, 658, 1006],
    notes: 'Ideal para pivots ofensivos con buen Atk pero Speed mediana (Tyranitar, Heatran). Cuidado con Knock Off.',
    tier: 'S',
  },
  'choice-band': {
    slug: 'choice-band',
    description:
      '+50% Atk físico. Bloqueado al primer move. Hace daño obsceno con sweepers físicos pero pierdes flexibilidad.',
    notableUsers: [149, 658, 727, 968],
    notes: 'Mejor en hit-and-run con U-turn como move flex. Incineroar Choice Band U-turn es VGC staple.',
    tier: 'A',
  },
  'choice-specs': {
    slug: 'choice-specs',
    description:
      '+50% SpA. Bloqueado al primer move. Versión especial de Choice Band. Dragapult / Iron Bundle con Specs son one-shot machines.',
    notableUsers: [887, 991, 1006, 145],
    tier: 'A',
  },
  'life-orb': {
    slug: 'life-orb',
    description:
      '+30% damage en todos los moves. Costo: 10% HP self por hit. El item ofensivo flexible — no te lockea pero te recuerda que la vida es corta.',
    notableUsers: [658, 445, 887, 6],
    notes: 'Magic Guard / Sheer Force ignoran el recoil — Reuniclus, Nidoking Life Orb son OP.',
    tier: 'S',
  },
  'leftovers': {
    slug: 'leftovers',
    description:
      'Cura 6.25% HP al final de cada turno. El sustain pasivo más usado de la historia. Esencial en walls y setup sweepers.',
    notableUsers: [248, 472, 113, 145],
    notes: 'Stack con Protect / Substitute para sustain casi infinito. NO funciona con Magic Guard (sin sentido).',
    tier: 'S',
  },
  'heavy-duty-boots': {
    slug: 'heavy-duty-boots',
    description:
      'Ignora ALL hazards (Stealth Rock, Spikes, Toxic Spikes, Sticky Web). Game-changer en formatos con hazards.',
    notableUsers: [6, 149, 145, 169],
    notes: 'Salva a 4× weak a Rock (Charizard, Volcarona). Hace viables Pokémon que antes morían al switch.',
    tier: 'S',
  },
  'focus-sash': {
    slug: 'focus-sash',
    description:
      'Sobrevives con 1 HP a un hit que te mataría desde full. Se consume tras el uso. Activador de Endeavor / Counter / Suicide Lead.',
    notableUsers: [658, 547, 786],
    notes: 'No funciona si entras con HP reducido. Stealth Rock lo neutraliza (te baja antes del hit).',
    tier: 'A',
  },
  'assault-vest': {
    slug: 'assault-vest',
    description:
      '+50% SpD. Bloqueado a moves ofensivos (no status). Convierte bulky attackers en walls especiales.',
    notableUsers: [727, 968, 248, 376],
    notes: 'Iron Hands AV en VGC es uno de los Pokémon más sólidos del meta.',
    tier: 'A',
  },
  'booster-energy': {
    slug: 'booster-energy',
    description:
      'Activa Protosynthesis / Quark Drive sin necesitar sol/Electric Terrain. Single-use, da boost de la stat más alta.',
    notableUsers: [984, 1006, 1003, 1021],
    notes: 'EXCLUSIVO para Paradox Pokémon. La stat boostada se calcula al activar — manipula EV spreads.',
    tier: 'S',
  },
  'rocky-helmet': {
    slug: 'rocky-helmet',
    description:
      'Atacante recibe 16.7% damage al hacer contacto físico. Stack con Iron Barbs / Rough Skin = 33% chip por hit.',
    notableUsers: [472, 503, 437],
    notes: 'Counter natural a U-turn spam y físicos sin Long Reach. Garchomp con Helmet duele.',
    tier: 'B',
  },
  'sitrus-berry': {
    slug: 'sitrus-berry',
    description:
      'Cura 25% HP al bajar de 50% HP. Single-use. El berry estándar de VGC — sustain emergency.',
    notableUsers: [727, 968, 460],
    notes: 'Combina con Belly Drum Azumarill (te queda 75% HP tras setup). Knock Off lo neutraliza.',
    tier: 'A',
  },
  'lum-berry': {
    slug: 'lum-berry',
    description:
      'Cura cualquier status (burn, sleep, paralysis, etc.) al instante. Single-use. Setup sweepers la aman.',
    notableUsers: [149, 983, 887],
    notes: 'Te salva del primer Will-O-Wisp / Toxic / Spore. Después estás expuesto.',
    tier: 'A',
  },
  'mental-herb': {
    slug: 'mental-herb',
    description:
      'Cura Taunt / Encore / Disable / Torment al activarse. Single-use. VGC support staple.',
    notableUsers: [488, 113, 169],
    notes: 'Cresselia Mental Herb + Lunar Dance es VGC clásico. Asegura el setup de TR.',
    tier: 'B',
  },
  'air-balloon': {
    slug: 'air-balloon',
    description:
      'Inmune a Ground moves hasta recibir cualquier hit. Brillante en setup sweepers vs Ground meta.',
    notableUsers: [1000, 376, 376],
    notes: 'Gholdengo Air Balloon stallea Earthquakes. Se rompe con cualquier hit, incluso priority.',
    tier: 'B',
  },
  'eviolite': {
    slug: 'eviolite',
    description:
      '+50% Def y SpD. SOLO funciona en Pokémon que aún pueden evolucionar. Convierte NFEs en tanks.',
    notableUsers: [233, 477, 866],
    notes: 'Porygon2, Dusclops, Chansey son los abusers clásicos. Eviolite Chansey es el wall especial más bulky del juego.',
    tier: 'A',
  },
  'expert-belt': {
    slug: 'expert-belt',
    description:
      '+20% damage en moves super-efectivos. Versátil para mixed attackers que abusan coverage.',
    notableUsers: [658, 376, 386],
    notes: 'Premia predicción correcta. Si el rival no es weak a tu coverage, no hace nada.',
    tier: 'B',
  },
  'safety-goggles': {
    slug: 'safety-goggles',
    description:
      'Inmune a powder/spore moves (Sleep Powder, Spore, Stun Spore) + weather chip (Sand/Hail).',
    notableUsers: [149, 145, 727],
    notes: 'Counter natural a Amoonguss Spore en VGC. Indispensable contra teams con Breloom.',
    tier: 'B',
  },
  'covert-cloak': {
    slug: 'covert-cloak',
    description:
      'Ignora efectos secundarios de moves rivales (no burns, no flinch, no drops). Gen 9 newcomer, está cambiando el meta.',
    notableUsers: [727, 488, 968],
    notes: 'Counter a Fake Out flinch, Scald burn, Iron Head flinch. Increíble valor defensivo.',
    tier: 'A',
  },
  'loaded-dice': {
    slug: 'loaded-dice',
    description:
      'Multi-hit moves siempre hacen 4-5 hits (en lugar de 2-5). Triple Axel / Population Bomb / Bullet Seed se vuelven absurdos.',
    notableUsers: [225, 357, 471],
    notes: 'Cinccino Loaded Dice + Skill Link = guaranteed 5 hits. Population Bomb Maushold OHKO casi todo.',
    tier: 'A',
  },
  'clear-amulet': {
    slug: 'clear-amulet',
    description:
      'El usuario no puede recibir reducciones de stats (incluye Intimidate). Counter directo a Incineroar.',
    notableUsers: [983, 658],
    notes: 'Gen 9 newcomer. Kingambit Clear Amulet ignora Intimidate spam — sube su viability un nivel.',
    tier: 'B',
  },

  // === BERRIES TIPADAS (típicas en VGC) ===
  'occa-berry': {
    slug: 'occa-berry',
    description:
      'Reduce a la mitad un Fire hit super-efectivo. Single-use. VGC tech contra Heatran/Cinderace.',
    notableUsers: [3, 460, 488],
    tier: 'B',
  },
  'chople-berry': {
    slug: 'chople-berry',
    description:
      'Reduce a la mitad un Fighting hit super-efectivo. Salva a Pokémon Dark/Rock/Steel/Ice de Close Combat.',
    notableUsers: [248, 983],
    tier: 'B',
  },
  'yache-berry': {
    slug: 'yache-berry',
    description:
      'Reduce a la mitad un Ice hit super-efectivo. Salva a Garchomp / Landorus / Dragonite del 4× weakness.',
    notableUsers: [445, 149, 1021],
    notes: 'Yache Garchomp ha sido VGC standard décadas. Single-use, pero te da ese turno crítico de Dragon Dance.',
    tier: 'B',
  },
};

export function getItemNote(slug: string): ItemNote | undefined {
  return ITEM_NOTES[slug];
}

export function getAllItemNoteSlugs(): string[] {
  return Object.keys(ITEM_NOTES);
}

export const ALL_ITEM_NOTES = Object.values(ITEM_NOTES);
