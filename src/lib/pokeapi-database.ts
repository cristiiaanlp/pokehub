// Helpers para fetch de moves y abilities desde PokéAPI.
// Cacheado 1 semana — datos estáticos.
//
// Estructura de datos:
//   - MoveSlim: para el listado (~50 bytes × ~1000 moves = 50KB JSON).
//   - MoveDetail: para la página de detalle individual.
//   - Idem para abilities.

import type { PokemonType } from '@/types/pokemon';

const BASE = 'https://pokeapi.co/api/v2';
const ONE_WEEK = 60 * 60 * 24 * 7;

export interface MoveSlim {
  id: number;
  name: string;        // slug interno: 'thunder-punch'
  displayName: string; // 'Thunder Punch'
  type: PokemonType;
  damageClass: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
}

export interface MoveDetail extends MoveSlim {
  priority: number;
  target: string;          // e.g. 'selected-pokemon', 'all-opponents'
  effectChance: number | null;
  effectText: string;      // ES si existe, fallback EN
  shortEffect: string;
  flavorText: string;      // ES si existe
  generation: string;      // 'generation-i'
  learnedBy: Array<{ id: number; name: string }>;  // top 30 Pokémon
}

export interface AbilitySlim {
  id: number;
  name: string;
  displayName: string;
  shortEffect: string;
  generation: string;
}

export interface AbilityDetail extends AbilitySlim {
  effectText: string;
  flavorText: string;
  pokemonWith: Array<{ id: number; name: string; isHidden: boolean }>;
}

// ─── Listing fetches ────────────────────────────────────────────────────

interface NamedRef {
  name: string;
  url: string;
}
interface ListResponse {
  count: number;
  results: NamedRef[];
}

function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? parseInt(m[1]) : 0;
}

function prettify(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Devuelve TODOS los moves con metadata mínima para filtrar client-side.
 * Hace ~920 fetches en paralelo (con cache) la primera vez. ISR 1 semana.
 */
export async function fetchAllMovesSlim(): Promise<MoveSlim[]> {
  // 1. Listado completo (solo nombres + URLs)
  const listRes = await fetch(`${BASE}/move?limit=1000`, {
    next: { revalidate: ONE_WEEK },
  });
  if (!listRes.ok) return [];
  const list = (await listRes.json()) as ListResponse;

  // 2. Fetches paralelos por batches de 50 para no saturar
  const results: MoveSlim[] = [];
  const batchSize = 50;
  for (let i = 0; i < list.results.length; i += batchSize) {
    const batch = list.results.slice(i, i + batchSize);
    const details = await Promise.all(
      batch.map(async (ref) => {
        try {
          const r = await fetch(ref.url, { next: { revalidate: ONE_WEEK } });
          if (!r.ok) return null;
          const d = (await r.json()) as any;
          const move: MoveSlim = {
            id: d.id,
            name: d.name,
            displayName: prettify(d.name),
            type: d.type?.name ?? 'normal',
            damageClass: d.damage_class?.name ?? 'status',
            power: d.power,
            accuracy: d.accuracy,
            pp: d.pp ?? 0,
          };
          return move;
        } catch {
          return null;
        }
      })
    );
    for (const d of details) if (d) results.push(d);
  }
  return results.sort((a, b) => a.id - b.id);
}

export async function fetchMoveDetail(
  nameOrId: string | number
): Promise<MoveDetail | null> {
  try {
    const res = await fetch(`${BASE}/move/${nameOrId}`, {
      next: { revalidate: ONE_WEEK },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as any;

    // Localización ES con fallback EN
    const effectES = d.effect_entries?.find((e: any) => e.language?.name === 'en');
    const flavorES =
      d.flavor_text_entries?.find((e: any) => e.language?.name === 'es') ??
      d.flavor_text_entries?.find((e: any) => e.language?.name === 'en');

    const learnedBy = (d.learned_by_pokemon ?? [])
      .slice(0, 30)
      .map((p: NamedRef) => ({ id: idFromUrl(p.url), name: p.name }));

    return {
      id: d.id,
      name: d.name,
      displayName: prettify(d.name),
      type: d.type?.name ?? 'normal',
      damageClass: d.damage_class?.name ?? 'status',
      power: d.power,
      accuracy: d.accuracy,
      pp: d.pp ?? 0,
      priority: d.priority ?? 0,
      target: d.target?.name ?? 'selected-pokemon',
      effectChance: d.effect_chance,
      effectText: effectES?.effect ?? '',
      shortEffect: effectES?.short_effect ?? '',
      flavorText: flavorES?.flavor_text?.replace(/[\n\f]/g, ' ') ?? '',
      generation: d.generation?.name ?? 'generation-i',
      learnedBy,
    };
  } catch {
    return null;
  }
}

// ─── Items ──────────────────────────────────────────────────────────────

export interface ItemSlim {
  id: number;
  name: string;
  displayName: string;
  shortEffect: string;
  category: string;
  sprite: string | null;
  cost: number | null;
}

export interface ItemDetail extends ItemSlim {
  effectText: string;
  flavorText: string;
  attributes: string[];
  heldBy: Array<{ id: number; name: string }>;
}

export async function fetchAllItemsSlim(): Promise<ItemSlim[]> {
  const listRes = await fetch(`${BASE}/item?limit=2000`, {
    next: { revalidate: ONE_WEEK },
  });
  if (!listRes.ok) return [];
  const list = (await listRes.json()) as ListResponse;

  const results: ItemSlim[] = [];
  const batchSize = 50;
  for (let i = 0; i < list.results.length; i += batchSize) {
    const batch = list.results.slice(i, i + batchSize);
    const details = await Promise.all(
      batch.map(async (ref) => {
        try {
          const r = await fetch(ref.url, { next: { revalidate: ONE_WEEK } });
          if (!r.ok) return null;
          const d = (await r.json()) as any;
          const short = d.effect_entries?.find(
            (e: any) => e.language?.name === 'en'
          ) ?? null;
          return {
            id: d.id,
            name: d.name,
            displayName: prettify(d.name),
            shortEffect: short?.short_effect ?? '',
            category: d.category?.name ?? 'other',
            sprite: d.sprites?.default ?? null,
            cost: typeof d.cost === 'number' && d.cost > 0 ? d.cost : null,
          } as ItemSlim;
        } catch {
          return null;
        }
      })
    );
    for (const d of details) if (d) results.push(d);
  }
  return results.sort((a, b) => a.id - b.id);
}

export async function fetchItemDetail(
  nameOrId: string | number
): Promise<ItemDetail | null> {
  try {
    const res = await fetch(`${BASE}/item/${nameOrId}`, {
      next: { revalidate: ONE_WEEK },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as any;

    const effectEN = d.effect_entries?.find((e: any) => e.language?.name === 'en');
    const flavorES =
      d.flavor_text_entries?.find((e: any) => e.language?.name === 'es') ??
      d.flavor_text_entries?.find((e: any) => e.language?.name === 'en');

    const heldBy = (d.held_by_pokemon ?? [])
      .slice(0, 30)
      .map((p: any) => ({
        id: idFromUrl(p.pokemon?.url ?? ''),
        name: p.pokemon?.name ?? '',
      }))
      .filter((p: any) => p.id > 0 && p.id <= 1025);

    return {
      id: d.id,
      name: d.name,
      displayName: prettify(d.name),
      shortEffect: effectEN?.short_effect ?? '',
      effectText: effectEN?.effect ?? '',
      flavorText: flavorES?.text?.replace(/[\n\f]/g, ' ') ?? '',
      category: d.category?.name ?? 'other',
      sprite: d.sprites?.default ?? null,
      cost: typeof d.cost === 'number' && d.cost > 0 ? d.cost : null,
      attributes: (d.attributes ?? []).map((a: any) => a.name),
      heldBy,
    };
  } catch {
    return null;
  }
}

// ─── Abilities ──────────────────────────────────────────────────────────

export async function fetchAllAbilitiesSlim(): Promise<AbilitySlim[]> {
  const listRes = await fetch(`${BASE}/ability?limit=400`, {
    next: { revalidate: ONE_WEEK },
  });
  if (!listRes.ok) return [];
  const list = (await listRes.json()) as ListResponse;

  const results: AbilitySlim[] = [];
  const batchSize = 50;
  for (let i = 0; i < list.results.length; i += batchSize) {
    const batch = list.results.slice(i, i + batchSize);
    const details = await Promise.all(
      batch.map(async (ref) => {
        try {
          const r = await fetch(ref.url, { next: { revalidate: ONE_WEEK } });
          if (!r.ok) return null;
          const d = (await r.json()) as any;
          const short =
            d.effect_entries?.find((e: any) => e.language?.name === 'en') ?? null;
          const ability: AbilitySlim = {
            id: d.id,
            name: d.name,
            displayName: prettify(d.name),
            shortEffect: short?.short_effect ?? '',
            generation: d.generation?.name ?? 'generation-i',
          };
          return ability;
        } catch {
          return null;
        }
      })
    );
    for (const d of details) if (d) results.push(d);
  }
  return results.sort((a, b) => a.id - b.id);
}

export async function fetchAbilityDetail(
  nameOrId: string | number
): Promise<AbilityDetail | null> {
  try {
    const res = await fetch(`${BASE}/ability/${nameOrId}`, {
      next: { revalidate: ONE_WEEK },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as any;

    const effectES = d.effect_entries?.find((e: any) => e.language?.name === 'en');
    const flavorES =
      d.flavor_text_entries?.find((e: any) => e.language?.name === 'es') ??
      d.flavor_text_entries?.find((e: any) => e.language?.name === 'en');

    const pokemonWith = (d.pokemon ?? [])
      .slice(0, 50)
      .map((p: any) => ({
        id: idFromUrl(p.pokemon?.url ?? ''),
        name: p.pokemon?.name ?? '',
        isHidden: p.is_hidden,
      }))
      .filter((p: any) => p.id > 0 && p.id <= 1025);

    return {
      id: d.id,
      name: d.name,
      displayName: prettify(d.name),
      shortEffect: effectES?.short_effect ?? '',
      effectText: effectES?.effect ?? '',
      flavorText: flavorES?.flavor_text?.replace(/[\n\f]/g, ' ') ?? '',
      generation: d.generation?.name ?? 'generation-i',
      pokemonWith,
    };
  } catch {
    return null;
  }
}
