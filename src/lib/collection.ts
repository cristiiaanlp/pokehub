// Helpers para Collection Tracker.

export interface CollectionEntry {
  pokemon_id: number;
  owned: boolean;
  shiny: boolean;
  notes?: string | null;
}

// Rangos por generación (Gen 1-9). Para mostrar progreso por gen.
export const GEN_RANGES: Array<{ gen: number; from: number; to: number; label: string }> = [
  { gen: 1, from: 1, to: 151, label: 'Gen 1 · Kanto' },
  { gen: 2, from: 152, to: 251, label: 'Gen 2 · Johto' },
  { gen: 3, from: 252, to: 386, label: 'Gen 3 · Hoenn' },
  { gen: 4, from: 387, to: 493, label: 'Gen 4 · Sinnoh' },
  { gen: 5, from: 494, to: 649, label: 'Gen 5 · Unova' },
  { gen: 6, from: 650, to: 721, label: 'Gen 6 · Kalos' },
  { gen: 7, from: 722, to: 809, label: 'Gen 7 · Alola' },
  { gen: 8, from: 810, to: 905, label: 'Gen 8 · Galar' },
  { gen: 9, from: 906, to: 1025, label: 'Gen 9 · Paldea' },
];

export interface CollectionStats {
  totalOwned: number;
  totalShiny: number;
  totalPokemon: number;
  ownedPct: number;
  shinyPct: number;
  byGen: Array<{
    gen: number;
    label: string;
    owned: number;
    shiny: number;
    total: number;
    pct: number;
  }>;
}

export function computeStats(entries: CollectionEntry[]): CollectionStats {
  const owned = entries.filter((e) => e.owned);
  const shiny = entries.filter((e) => e.shiny);
  const total = 1025;

  const byGen = GEN_RANGES.map((g) => {
    const inRange = (id: number) => id >= g.from && id <= g.to;
    const o = owned.filter((e) => inRange(e.pokemon_id)).length;
    const s = shiny.filter((e) => inRange(e.pokemon_id)).length;
    const t = g.to - g.from + 1;
    return {
      gen: g.gen,
      label: g.label,
      owned: o,
      shiny: s,
      total: t,
      pct: (o / t) * 100,
    };
  });

  return {
    totalOwned: owned.length,
    totalShiny: shiny.length,
    totalPokemon: total,
    ownedPct: (owned.length / total) * 100,
    shinyPct: (shiny.length / total) * 100,
    byGen,
  };
}
