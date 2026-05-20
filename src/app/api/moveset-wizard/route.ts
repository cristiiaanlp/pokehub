// GET /api/moveset-wizard?id=445&role=physical-sweeper
// Server-side wrapper que carga el Pokémon completo + sus moves y delega
// la lógica al lib/moveset-wizard.

import { NextResponse } from 'next/server';
import { getPokemon } from '@/lib/pokeapi';
import { suggestMoveset, ROLES, type RoleKey } from '@/lib/moveset-wizard';

export const runtime = 'nodejs';
export const revalidate = 604800; // 1 semana — el learnset es estático

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const role = url.searchParams.get('role') as RoleKey | null;

  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  if (!role || !ROLES.find((r) => r.id === role)) {
    return NextResponse.json({ error: 'invalid_role' }, { status: 400 });
  }

  try {
    const pokemon = await getPokemon(id);
    // PokemonDetail.moves es { name, level?, method? }[]. Usamos los slugs.
    const movesetSlugs = pokemon.moves.map((m) => m.name);
    const suggestion = await suggestMoveset(
      {
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types,
        movesetSlugs,
      },
      role
    );
    if (!suggestion) {
      return NextResponse.json({ error: 'no_suggestion' }, { status: 404 });
    }
    return NextResponse.json({ suggestion });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
