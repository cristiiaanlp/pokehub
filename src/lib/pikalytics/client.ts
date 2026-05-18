// Pikalytics fetcher with Next.js ISR cache and graceful fallback.

import { parsePikalyticsMarkdown, type PikalyticsPokemonData } from './parser';

const REVALIDATE_24H = 60 * 60 * 24;

const BASE = 'https://www.pikalytics.com/ai/pokedex';

export type PikalyticsFormat =
  | 'championspreview' // Pokémon Champions Preview Reg
  | 'gen9championsvgc2026regma' // Champions Reg M-A (regulated)
  | 'gen9ou'
  | 'gen9vgc2025regi'
  | 'gen9doublesou';

export const PIKA_FORMAT_LABELS: Record<PikalyticsFormat, string> = {
  championspreview: 'Pokémon Champions Preview',
  gen9championsvgc2026regma: 'Pokémon Champions Reg M-A',
  gen9ou: 'SV OU',
  gen9vgc2025regi: 'SV VGC 2025',
  gen9doublesou: 'SV Doubles OU',
};

// Convert a display name to Pikalytics URL slug.
// "Mr. Rime" → "Mr.-Rime", "Wash Rotom" → "Rotom-Wash" (Pikalytics uses base-form),
// "Tauros-Paldea-Blaze" → as-is, etc.
function pikalyticsSlug(name: string): string {
  let s = name.trim();
  // Convert "Wash Rotom" / "Heat Rotom" / "Mow Rotom" / etc. → "Rotom-Wash"
  const rotomForms = ['Wash', 'Heat', 'Frost', 'Fan', 'Mow'];
  for (const f of rotomForms) {
    if (new RegExp(`^${f}\\s+Rotom$`, 'i').test(s)) {
      s = `Rotom-${f}`;
      break;
    }
  }
  // Convert spaces to dashes; preserve existing dashes
  s = s.replace(/\s+/g, '-');
  return s;
}

export async function fetchPokemonData(
  format: PikalyticsFormat,
  pokemonName: string,
  opts?: { revalidate?: number; signal?: AbortSignal }
): Promise<PikalyticsPokemonData | null> {
  const slug = pikalyticsSlug(pokemonName);
  const url = `${BASE}/${format}/${slug}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: opts?.revalidate ?? REVALIDATE_24H },
      signal: opts?.signal,
      headers: {
        'user-agent':
          'PokeHub/1.0 (https://pokehub.app) competitive-data-aggregator',
      },
    });
    if (!res.ok) return null;
    const text = await res.text();
    return parsePikalyticsMarkdown(text, pokemonName);
  } catch {
    return null;
  }
}

// Fetch a batch with bounded concurrency
export async function fetchMany(
  format: PikalyticsFormat,
  pokemonNames: string[],
  concurrency = 4
): Promise<Array<PikalyticsPokemonData | null>> {
  const out: Array<PikalyticsPokemonData | null> = new Array(
    pokemonNames.length
  ).fill(null);
  let i = 0;
  async function worker() {
    while (i < pokemonNames.length) {
      const idx = i++;
      out[idx] = await fetchPokemonData(format, pokemonNames[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, pokemonNames.length) }, worker)
  );
  return out;
}
