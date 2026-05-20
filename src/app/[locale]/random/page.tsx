import { redirect } from 'next/navigation';
import { TOTAL_POKEMON } from '@/lib/pokeapi';

// /random redirige a un Pokémon aleatorio de la pokédex.
// `dynamic = 'force-dynamic'` + `revalidate = 0` para que cada visita
// genere un ID nuevo en el servidor.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RandomPokemonPage() {
  const id = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  redirect(`/pokedex/${id}`);
}
