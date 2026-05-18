// Resolves names from Smogon usage stats / Showdown into PokéAPI species IDs.
// Strategy: override map for known tricky names → fallback to base species via regex.

const OVERRIDES: Record<string, number> = {
  // Paradox / Gen 9 unique
  'great tusk': 984,
  'scream tail': 985,
  'brute bonnet': 986,
  'flutter mane': 987,
  'slither wing': 988,
  'sandy shocks': 989,
  'iron treads': 990,
  'iron bundle': 991,
  'iron hands': 992,
  'iron jugulis': 993,
  'iron moth': 994,
  'iron thorns': 995,
  'iron valiant': 1006,
  'iron leaves': 1010,
  'iron boulder': 1022,
  'iron crown': 1023,
  'roaring moon': 1005,
  'walking wake': 1009,
  'gouging fire': 1020,
  'raging bolt': 1021,
  // Treasures of Ruin
  'wo-chien': 1001,
  'chien-pao': 1002,
  'ting-lu': 1003,
  'chi-yu': 1004,
  // Other Gen 9 staples
  'gholdengo': 1000,
  'kingambit': 983,
  'dondozo': 977,
  'tatsugiri': 978,
  'annihilape': 979,
  'palafin': 964,
  'baxcalibur': 998,
  'glimmora': 970,
  // Forms collapsed to base species
  'ogerpon-wellspring': 1017,
  'ogerpon-hearthflame': 1017,
  'ogerpon-cornerstone': 1017,
  'ogerpon-teal': 1017,
  'ogerpon': 1017,
  'urshifu-rapid-strike': 892,
  'urshifu': 892,
  'calyrex-shadow': 898,
  'calyrex-ice': 898,
  'calyrex': 898,
  'tauros-paldea-blaze': 128,
  'tauros-paldea-aqua': 128,
  'tauros-paldea-combat': 128,
  'tauros-paldea': 128,
  'basculegion': 902,
  'basculegion-f': 902,
  'sinistcha': 1013,
  // Galar / Hisui / Alola forms — use species ID
  'slowking-galar': 199,
  'slowbro-galar': 80,
  'corsola-galar': 222,
  'rapidash-galar': 78,
  'weezing-galar': 110,
  'lycanroc-dusk': 745,
  'lycanroc-midnight': 745,
  'lycanroc-midday': 745,
  'rotom-wash': 479,
  'rotom-heat': 479,
  'rotom-mow': 479,
  'rotom-fan': 479,
  'rotom-frost': 479,
  // Hisui
  'arcanine-hisui': 59,
  'zoroark-hisui': 571,
  'samurott-hisui': 503,
  'typhlosion-hisui': 157,
  'sneasler': 903,
  'overqwil': 904,
  // Iconic competitive
  'incineroar': 727,
  'sneasel-hisui': 215,
  'zamazenta': 889,
  'zamazenta-crowned': 889,
  'zacian': 888,
  'zacian-crowned': 888,
  'mewtwo': 150,
  'kleavor': 900,
  // Mega-popular Champions Pokemon
  'paldean tauros': 128,
  'paldean tauros (blaze breed)': 128,
  'paldean tauros (aqua breed)': 128,
  'wash rotom': 479,
  'heat rotom': 479,
  'mow rotom': 479,
  'mr. rime': 866,
  'mr rime': 866,
  'mr. mime': 122,
  // Common dual-word names
  'iron defiant': 995,
  'froslass': 478,
  'lopunny': 428,
  'blastoise': 9,
  'charizard': 6,
  'venusaur': 3,
  'pidgeot': 18,
  'beedrill': 15,
  'alakazam': 65,
  'gengar': 94,
  'kangaskhan': 115,
  'aerodactyl': 142,
  'gyarados': 130,
  'mewtwo-mega-x': 150,
  'mewtwo-mega-y': 150,
  // Champions / VGC popular Pokémon
  'whimsicott': 547,
  'farigiraf': 981,
  'aegislash': 681,
  'aegislash-blade': 681,
  'aegislash-shield': 681,
  'hydreigon': 635,
  'delphox': 655,
  'tsareena': 763,
  'clefable': 36,
  'dragonite': 149,
  'floette': 670,
  'floette-eternal': 670,
  'talonflame': 663,
  'primarina': 730,
  'maushold': 925,
  'maushold-four': 925,
  'pelipper': 279,
  'milotic': 350,
  'klefki': 707,
  'tyranitar': 248,
  'tyranitar-mega': 248,
  'archaludon': 1018,
  'gardevoir': 282,
  'gardevoir-mega': 282,
  'typhlosion': 157,
  'gallade': 475,
  'gallade-mega': 475,
  'scizor': 212,
  'scizor-mega': 212,
  'salamence': 373,
  'salamence-mega': 373,
  'lucario': 448,
  'lucario-mega': 448,
  'metagross': 376,
  'metagross-mega': 376,
  'absol': 359,
  'absol-mega': 359,
  'altaria': 334,
  'altaria-mega': 334,
  'sableye': 302,
  'sableye-mega': 302,
  'banette': 354,
  'banette-mega': 354,
  'mawile': 303,
  'mawile-mega': 303,
  'medicham': 308,
  'medicham-mega': 308,
  'manectric': 310,
  'manectric-mega': 310,
  'pinsir': 127,
  'pinsir-mega': 127,
  'heracross': 214,
  'heracross-mega': 214,
  'sharpedo': 319,
  'sharpedo-mega': 319,
  'camerupt': 323,
  'camerupt-mega': 323,
  'ampharos': 181,
  'ampharos-mega': 181,
  'audino': 531,
  'audino-mega': 531,
  'glalie': 362,
  'glalie-mega': 362,
  'steelix': 208,
  'steelix-mega': 208,
  'beedrill-mega': 15,
  'pidgeot-mega': 18,
  'venusaur-mega': 3,
  'charizard-mega-x': 6,
  'charizard-mega-y': 6,
  'blastoise-mega': 9,
  'lopunny-mega': 428,
  'kangaskhan-mega': 115,
  'aerodactyl-mega': 142,
  'gengar-mega': 94,
  'alakazam-mega': 65,
  'slowbro': 80,
  'slowbro-mega': 80,
  'slowking': 199,
  'snorlax': 143,
  'lapras': 131,
  'ditto': 132,
  'eevee': 133,
  'vaporeon': 134,
  'jolteon': 135,
  'flareon': 136,
  'espeon': 196,
  'umbreon': 197,
  'leafeon': 470,
  'glaceon': 471,
  'sylveon': 700,
  // Gen 9 OU regulars
  'great-tusk': 984,
  'iron-valiant': 1006,
  'raging-bolt': 1021,
  'walking-wake': 1009,
  'gouging-fire': 1020,
  'iron-crown': 1023,
  'iron-boulder': 1022,
  'roaring-moon': 1005,
  'flutter-mane': 987,
  'iron-treads': 990,
  'iron-moth': 994,
  'iron-hands': 992,
  'iron-jugulis': 993,
  'iron-thorns': 995,
  'iron-leaves': 1010,
  'iron-bundle': 991,
  'sandy-shocks': 989,
  'brute-bonnet': 986,
  'scream-tail': 985,
  'slither-wing': 988,
  'dragapult': 887,
  'dreepy': 885,
  'drakloak': 886,
  'corviknight': 823,
  'gliscor': 472,
  'hatterene': 858,
  'kyurem': 646,
  'kyurem-white': 646,
  'kyurem-black': 646,
  'volcarona': 637,
  'amoonguss': 591,
  'ribombee': 743,
  'rillaboom': 812,
  'cinderace': 815,
  'inteleon': 818,
  // Common
  'pikachu': 25,
  'magnezone': 462,
  'rotom': 479,
  'ferrothorn': 598,
  'serperior': 497,
  'samurott': 503,
  'breloom': 286,
  'machamp': 68,
  'starmie': 121,
  'goodra': 706,
  'goodra-hisui': 706,
  'arcanine': 59,
  'electrode-hisui': 101,
  'electrode': 101,
  'zoroark': 571,
  'mimikyu': 778,
  'noivern': 715,
  'salazzle': 758,
  'mudsdale': 750,
  'palossand': 770,
  'toxapex': 748,
  'salamander': 373,
  'tinkaton': 959,
  'rabsca': 954,
  'grafaiai': 945,
  'wugtrio': 961,
  'cetitan': 975,
  'orthworm': 968,
  'farigiraf-totem': 981,
  'pawmot': 923,
  'lokix': 919,
  'revavroom': 966,
  'kilowattrel': 941,
  'mabosstiff': 943,
  'flamigo': 973,
  'enamorus': 905,
  'enamorus-therian': 905,
  'landorus': 645,
  'landorus-therian': 645,
  'thundurus': 642,
  'thundurus-therian': 642,
  'tornadus': 641,
  'tornadus-therian': 641,
  'heatran': 485,
  'magearna': 801,
  'celesteela': 797,
  'kartana': 798,
  'tapu-koko': 785,
  'tapu-lele': 786,
  'tapu-bulu': 787,
  'tapu-fini': 788,
  'shadow-rider-calyrex': 898,
  'ice-rider-calyrex': 898,
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’']/g, '') // strip apostrophes
    .replace(/[.]/g, '') // strip periods
    .replace(/[()]/g, '')
    .replace(/[\s_]+/g, '-')
    .trim();
}

// Try kebab name, then base species (everything before last hyphen)
export function resolveSmogonName(name: string): number | null {
  const key = normalize(name);
  if (OVERRIDES[key] !== undefined) return OVERRIDES[key];

  const lowerOriginal = name.toLowerCase().trim();
  if (OVERRIDES[lowerOriginal] !== undefined) return OVERRIDES[lowerOriginal];

  // Strip everything after first hyphen (form suffix) and retry
  const base = key.split('-')[0];
  if (base !== key && OVERRIDES[base] !== undefined) return OVERRIDES[base];

  return null;
}

// Async resolver that also tries PokéAPI directly for missing entries.
// Cached 7d via Next data cache.
export async function resolveSmogonNameAsync(name: string): Promise<number | null> {
  const direct = resolveSmogonName(name);
  if (direct !== null) return direct;

  const slug = normalize(name);
  const tryFetch = async (s: string): Promise<number | null> => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${s}`, {
        next: { revalidate: 60 * 60 * 24 * 7 },
      });
      if (!res.ok) return null;
      const data = await res.json();
      // species id (collapses forms)
      const speciesUrl = data?.species?.url as string | undefined;
      if (speciesUrl) {
        const id = Number(speciesUrl.split('/').filter(Boolean).pop());
        return id || null;
      }
      return data?.id ?? null;
    } catch {
      return null;
    }
  };

  const r1 = await tryFetch(slug);
  if (r1) return r1;
  const base = slug.split('-')[0];
  if (base !== slug) {
    const r2 = await tryFetch(base);
    if (r2) return r2;
  }
  return null;
}
