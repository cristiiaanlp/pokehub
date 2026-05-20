import type { Metadata } from 'next';
import { WhosThatPokemon } from '@/components/daily/WhosThatPokemon';

export const metadata: Metadata = {
  title: '¿Quién es ese Pokémon? · Daily challenge · PokéHub',
  description:
    'Adivina el Pokémon por su silueta. Daily challenge — un Pokémon nuevo cada día. Racha personal + leaderboard.',
};

export default function WhosThatPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Daily Challenge
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          ¿Quién es ese Pokémon?
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-xl">
          Silueta negra. Adivina el Pokémon en el menor número de intentos
          posible. Un Pokémon nuevo cada 24h. Compite contigo mismo y mantén
          tu racha.
        </p>
      </header>
      <WhosThatPokemon />
    </div>
  );
}
