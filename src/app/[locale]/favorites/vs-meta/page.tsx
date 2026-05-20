import type { Metadata } from 'next';
import { FavoriteVsMeta } from '@/components/favorites/FavoriteVsMeta';

export const metadata: Metadata = {
  title: 'Tu favorito vs el meta · PokéHub',
  description:
    'Compara tu Pokémon favorito contra los top 10 del meta competitivo Pokémon Champions. ¿Aguanta el meta?',
};

export default function FavoriteVsMetaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Análisis
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Tu favorito vs el meta
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Coge cualquier Pokémon (de tus favoritos o búsqueda) y vemos cómo le
          va contra los top 10 más usados del meta competitivo SV. Matchup
          ofensivo y defensivo en una vista.
        </p>
      </header>
      <FavoriteVsMeta />
    </div>
  );
}
