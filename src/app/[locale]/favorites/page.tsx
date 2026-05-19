'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/common/PageHeader';
import { PokemonCard } from '@/components/pokedex/PokemonCard';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { getPokedexIndex, hydrateTypesForIds } from '@/lib/pokeapi';
import type { PokemonListItem } from '@/types/pokemon';
import { HeartIcon, ArrowRight } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export default function FavoritesPage() {
  const ids = useFavoritesStore((s) => s.ids);
  const clear = useFavoritesStore((s) => s.clear);
  const [items, setItems] = useState<PokemonListItem[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    getPokedexIndex().then(async (idx) => {
      await hydrateTypesForIds(ids);
      const refreshed = await getPokedexIndex();
      setItems(ids.map((id) => refreshed.find((p) => p.id === id)!).filter(Boolean));
    });
  }, [ids]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
      <PageHeader
        kicker="Favoritos"
        title={
          <>
            Tus Pokémon <span className="gradient-text">preferidos</span>
          </>
        }
        subtitle="Marca un Pokémon con el corazón en cualquier sitio de la app — aparecerá aquí."
        right={
          ids.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Limpiar todos
            </Button>
          )
        }
      />

      {ids.length === 0 ? (
        <div className="card-base p-10 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl glass-strong inline-flex items-center justify-center mb-4">
            <HeartIcon className="w-7 h-7 text-accent-red" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">
            Aún no tienes favoritos
          </h2>
          <p className="text-ink-dim text-sm mb-6">
            Explora la Pokédex y toca el corazón en cualquier carta para
            guardarlo aquí.
          </p>
          <Link href="/pokedex">
            <Button variant="primary" size="md">
              Ir a la Pokédex
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {items.map((p, i) => (
            <PokemonCard key={p.id} p={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
