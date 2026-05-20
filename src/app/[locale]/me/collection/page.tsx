import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { CollectionTracker } from '@/components/profile/CollectionTracker';
import type { CollectionEntry } from '@/lib/collection';

export const metadata: Metadata = {
  title: 'Mi Colección · Living Pokédex · PokéHub',
  description:
    'Tracker de Living Pokédex: marca qué Pokémon tienes y cuáles tienes shiny. Stats por generación y % completion.',
};

export const dynamic = 'force-dynamic';

export default async function MyCollectionPage() {
  const sb = getSupabaseServer();
  if (!sb) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-sm text-ink-dim">
        Supabase no configurado.
      </div>
    );
  }
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) redirect('/login?next=/me/collection');

  const { data } = await sb
    .from('pokemon_collection')
    .select('pokemon_id, owned, shiny, notes')
    .eq('user_id', userData.user.id);

  const entries = (data ?? []) as CollectionEntry[];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Living Pokédex
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Mi Colección
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Marca qué Pokémon has tenido. <strong className="text-ink">Click</strong> alterna
          tenido, <strong className="text-ink">click manteniendo Shift</strong> alterna shiny.
          Stats por generación se actualizan al instante.
        </p>
      </header>
      <CollectionTracker initialEntries={entries} />
    </div>
  );
}
