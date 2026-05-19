// Scraper de la página índice de Pikalytics para un formato (top usage agregado).
// La página individual del formato (/pokedex/championspreview) renderiza el HTML
// con un patrón muy estable: `PokemonName </span> <!-- (<span ...>XX.XX%`.
//
// Falla silenciosamente devolviendo null si:
//   - Pikalytics está caído / cambia el HTML
//   - Network timeout
// El consumidor cae al snapshot curado.

const REVALIDATE_24H = 60 * 60 * 24;
const PIKA_BASE = 'https://www.pikalytics.com/pokedex';

export interface LiveUsageEntry {
  rank: number;
  name: string;
  usagePct: number;
}

export interface LiveChampionsUsage {
  format: string;
  fetchedAt: string; // ISO
  source: string; // URL
  entries: LiveUsageEntry[];
}

// Pokémon-name + percentage extractor.
// Pattern from observed HTML: `<a ...>NAME </span> <!-- (<span style="color:red;">XX.XX%`
const USAGE_RE =
  /([A-Z][A-Za-z0-9.'-]*(?:\s+[A-Z][A-Za-z0-9.'-]*)?)\s*<\/span>\s*<!--\s*\(<span[^>]*?>\s*([\d.]+)%/g;

export async function fetchLiveChampionsUsage(
  format: string = 'championspreview',
  limit: number = 30
): Promise<LiveChampionsUsage | null> {
  const url = `${PIKA_BASE}/${format}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_24H },
      // Timeout duro: si Pikalytics tarda más de 8s, cortamos.
      // No vale la pena bloquear toda la página por un scrape.
      signal: AbortSignal.timeout(8000),
      headers: {
        'user-agent':
          'PokeHub/1.0 (https://pokehub.app) competitive-data-aggregator',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html || html.length < 5000) return null;

    const entries: LiveUsageEntry[] = [];
    const seen = new Set<string>();
    let m;
    let rank = 1;
    USAGE_RE.lastIndex = 0;
    while ((m = USAGE_RE.exec(html)) !== null && entries.length < limit) {
      const name = m[1].trim();
      const pct = Number(m[2]);
      // Dedupe (page repeats some sections — only the first occurrence is the canonical top)
      if (seen.has(name)) continue;
      // Sanity filter: ignore obvious noise
      if (!name || pct <= 0 || pct > 100) continue;
      seen.add(name);
      entries.push({ rank, name, usagePct: pct });
      rank++;
    }

    if (entries.length < 5) return null; // page structure changed?

    return {
      format,
      fetchedAt: new Date().toISOString(),
      source: url,
      entries,
    };
  } catch {
    return null;
  }
}
