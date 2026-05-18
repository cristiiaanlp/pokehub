import type {
  PokemonDetail,
  PokemonEvolution,
  PokemonListItem,
  PokemonType,
} from '@/types/pokemon';
import { formatPokemonName } from '@/lib/utils';

const BASE = 'https://pokeapi.co/api/v2';
const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
const SHINY_ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny';

// Total Pokémon up to and including paldea (gen 9). Past 1025 the API has gaps; we cap to play it safe.
export const TOTAL_POKEMON = 1025;

export function spriteFor(id: number) {
  return `${SPRITE_BASE}/${id}.png`;
}
export function artworkFor(id: number) {
  return `${ARTWORK_BASE}/${id}.png`;
}
export function shinyArtworkFor(id: number) {
  return `${SHINY_ARTWORK_BASE}/${id}.png`;
}

const memo: Record<string, unknown> = {};

async function cachedFetch<T>(url: string): Promise<T> {
  if (memo[url]) return memo[url] as T;
  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 }, // 24h
  });
  if (!res.ok) {
    throw new Error(`PokéAPI ${res.status} on ${url}`);
  }
  const data = (await res.json()) as T;
  memo[url] = data;
  return data;
}

// Lightweight list of all Pokémon (id, name, types, sprite) — built locally from the index.
// We hit /pokemon-species?limit=TOTAL once and then synthesize sprite URLs and lazy-load types on demand.
interface PokemonIndexRaw {
  results: { name: string; url: string }[];
}

let _index: PokemonListItem[] | null = null;
let _indexByName: Map<string, PokemonListItem> | null = null;

export async function getPokedexIndex(): Promise<PokemonListItem[]> {
  if (_index) return _index;
  // We hit /pokemon?limit so we can extract ids; types are added in batches.
  const data = await cachedFetch<PokemonIndexRaw>(
    `${BASE}/pokemon?limit=${TOTAL_POKEMON}&offset=0`
  );
  _index = data.results.map((r) => {
    const id = Number(r.url.split('/').filter(Boolean).pop());
    return {
      id,
      name: r.name,
      sprite: spriteFor(id),
      types: [],
    };
  });
  _indexByName = new Map(_index.map((p) => [p.name, p]));
  return _index;
}

// Hydrate types for a slice of the index (typically the visible page) when needed.
export async function hydrateTypesForIds(ids: number[]): Promise<void> {
  if (!_index) await getPokedexIndex();
  const missing = ids.filter((id) => {
    const p = _index!.find((x) => x.id === id);
    return p && p.types.length === 0;
  });
  if (missing.length === 0) return;
  await Promise.all(
    missing.map(async (id) => {
      try {
        const data = await cachedFetch<any>(`${BASE}/pokemon/${id}`);
        const item = _index!.find((x) => x.id === id);
        if (item) {
          item.types = data.types
            .sort((a: any, b: any) => a.slot - b.slot)
            .map((t: any) => t.type.name as PokemonType);
        }
      } catch {
        /* ignore individual failures */
      }
    })
  );
}

export async function searchPokedex(query: string, limit = 50) {
  const idx = await getPokedexIndex();
  const q = query.trim().toLowerCase();
  if (!q) return idx.slice(0, limit);
  // numeric search
  if (/^\d+$/.test(q)) {
    const id = Number(q);
    return idx.filter((p) => String(p.id).includes(String(id))).slice(0, limit);
  }
  return idx
    .filter((p) => p.name.includes(q))
    .slice(0, limit);
}

interface SpeciesRaw {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  genera: { genus: string; language: { name: string } }[];
  generation: { name: string };
  evolution_chain: { url: string };
}

interface EvoChainRaw {
  chain: EvoNodeRaw;
}

interface EvoNodeRaw {
  species: { name: string; url: string };
  evolution_details: {
    min_level: number | null;
    trigger: { name: string } | null;
    item: { name: string } | null;
  }[];
  evolves_to: EvoNodeRaw[];
}

function flattenEvoChain(node: EvoNodeRaw, accum: PokemonEvolution[][] = [], depth = 0): PokemonEvolution[][] {
  if (!accum[depth]) accum[depth] = [];
  const id = Number(node.species.url.split('/').filter(Boolean).pop());
  const evoDetails = node.evolution_details[0];
  accum[depth].push({
    id,
    name: node.species.name,
    sprite: spriteFor(id),
    minLevel: evoDetails?.min_level ?? undefined,
    trigger: evoDetails?.trigger?.name ?? undefined,
    item: evoDetails?.item?.name ?? undefined,
  });
  for (const child of node.evolves_to) {
    flattenEvoChain(child, accum, depth + 1);
  }
  return accum;
}

export async function getPokemon(idOrName: string | number): Promise<PokemonDetail> {
  const raw = await cachedFetch<any>(`${BASE}/pokemon/${idOrName}`);
  const speciesRaw = await cachedFetch<SpeciesRaw>(raw.species.url);

  let evolutionChain: PokemonEvolution[][] = [];
  try {
    const chainRaw = await cachedFetch<EvoChainRaw>(speciesRaw.evolution_chain.url);
    evolutionChain = flattenEvoChain(chainRaw.chain);
  } catch {
    /* ignore */
  }

  const flavor = speciesRaw.flavor_text_entries.find(
    (e) => e.language.name === 'en'
  )?.flavor_text;
  const genus = speciesRaw.genera.find((g) => g.language.name === 'en')?.genus ?? '';

  const stats = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
  for (const s of raw.stats) {
    const v = s.base_stat as number;
    switch (s.stat.name as string) {
      case 'hp':
        stats.hp = v;
        break;
      case 'attack':
        stats.attack = v;
        break;
      case 'defense':
        stats.defense = v;
        break;
      case 'special-attack':
        stats.specialAttack = v;
        break;
      case 'special-defense':
        stats.specialDefense = v;
        break;
      case 'speed':
        stats.speed = v;
        break;
    }
  }

  const cry =
    raw.cries?.latest ?? raw.cries?.legacy ?? null;

  return {
    id: raw.id,
    name: raw.name,
    types: raw.types
      .sort((a: any, b: any) => a.slot - b.slot)
      .map((t: any) => t.type.name as PokemonType),
    height: raw.height,
    weight: raw.weight,
    sprite: spriteFor(raw.id),
    artwork: artworkFor(raw.id),
    shinyArtwork: shinyArtworkFor(raw.id),
    cry,
    stats,
    abilities: raw.abilities.map((a: any) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
    moves: raw.moves
      .slice(0, 60)
      .map((m: any) => ({ name: m.move.name }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name)),
    baseExperience: raw.base_experience,
    flavorText: (flavor ?? '').replace(/\f|\n/g, ' '),
    genus,
    generation: speciesRaw.generation.name,
    evolutionChain,
  };
}

export function displayName(name: string) {
  return formatPokemonName(name);
}
