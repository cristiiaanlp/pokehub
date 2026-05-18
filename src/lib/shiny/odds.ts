// Shiny odds calculator for the most common modern hunting methods.
// All rates are returned as 1-in-N denominators.

export interface ShinyMethod {
  id: string;
  label: string;
  baseDenominator: number; // 1/N
  game: 'classic' | 'sm' | 'usum' | 'swsh' | 'bdsp' | 'pla' | 'sv';
  description: string;
  withCharm?: number; // override denominator when charm enabled
}

export const SHINY_METHODS: ShinyMethod[] = [
  {
    id: 'full-odds',
    label: 'Full Odds (Gen 6+)',
    baseDenominator: 4096,
    withCharm: 1365,
    game: 'sv',
    description: 'Encuentros aleatorios sin método especial. 1/4096 base.',
  },
  {
    id: 'masuda',
    label: 'Masuda Method',
    baseDenominator: 683, // 6/4096
    withCharm: 512, // 8/4096
    game: 'sv',
    description:
      'Cría con padres de juegos en distintos idiomas. 6/4096 base, 8/4096 con Shiny Charm.',
  },
  {
    id: 'sv-outbreak-base',
    label: 'SV Outbreak · 0 KO',
    baseDenominator: 2048,
    withCharm: 1024,
    game: 'sv',
    description:
      'Mass Outbreak en Scarlet/Violet sin KOs. 1/2048 base, 1/1024 con Shiny Charm.',
  },
  {
    id: 'sv-outbreak-30',
    label: 'SV Outbreak · 30+ KOs',
    baseDenominator: 1365,
    withCharm: 819,
    game: 'sv',
    description: '1/1365 con 30 KOs. 1/819 con Shiny Charm.',
  },
  {
    id: 'sv-outbreak-60',
    label: 'SV Outbreak · 60+ KOs',
    baseDenominator: 1024,
    withCharm: 683,
    game: 'sv',
    description: '1/1024 con 60 KOs. 1/683 con Shiny Charm.',
  },
  {
    id: 'pla-massive',
    label: 'PLA Massive Outbreak',
    baseDenominator: 158,
    game: 'pla',
    description: 'Massive Mass Outbreak en Legends Arceus, research perfecta + Shiny Charm.',
  },
  {
    id: 'pokeradar-40',
    label: 'PokéRadar · Chain 40+',
    baseDenominator: 200,
    game: 'bdsp',
    description: 'Chain de PokéRadar nivel 40+. 1/200 aprox.',
  },
  {
    id: 'sos-chain',
    label: 'SOS Chain (USUM)',
    baseDenominator: 273, // 15/4096 with charm at max
    withCharm: 273,
    game: 'usum',
    description: 'Sun/Moon/Ultra: SOS chain de 31+. ~1/273 con todas las condiciones.',
  },
  {
    id: 'classic-fullodds',
    label: 'Full Odds (Gen 1-5)',
    baseDenominator: 8192,
    game: 'classic',
    description: 'Generaciones 1-5: 1/8192 base.',
  },
];

export function denominatorFor(method: ShinyMethod, shinyCharm: boolean): number {
  if (shinyCharm && method.withCharm !== undefined) return method.withCharm;
  return method.baseDenominator;
}

// Cumulative probability of having found at least one shiny after N encounters.
export function cumulativeProb(encounters: number, denominator: number): number {
  if (encounters <= 0) return 0;
  if (denominator <= 0) return 1;
  const p = 1 / denominator;
  return 1 - Math.pow(1 - p, encounters);
}

// Encounters needed to reach a given cumulative probability (e.g. 50%).
export function encountersForProb(target: number, denominator: number): number {
  if (target <= 0) return 0;
  if (target >= 1) return Infinity;
  const p = 1 / denominator;
  return Math.ceil(Math.log(1 - target) / Math.log(1 - p));
}

export function formatOdds(denominator: number): string {
  if (denominator >= 1000) {
    return `1 de ${denominator.toLocaleString()}`;
  }
  return `1 de ${denominator}`;
}
