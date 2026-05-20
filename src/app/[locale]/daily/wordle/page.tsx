import type { Metadata } from 'next';
import { PokeWordle } from '@/components/daily/PokeWordle';

export const metadata: Metadata = {
  title: 'PokéWordle · Daily challenge · PokéHub',
  description:
    'Adivina el nombre de un Pokémon en 6 intentos. Cada letra revela si está en la palabra. Daily challenge — nuevo Pokémon cada día.',
};

export default function PokeWordlePage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Daily Challenge
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          PokéWordle
        </h1>
        <p className="text-sm text-ink-dim mt-2">
          Adivina el Pokémon en 6 intentos. Verde = letra correcta, Amarillo =
          en la palabra pero otra posición. Nuevo cada día.
        </p>
      </header>
      <PokeWordle />
    </div>
  );
}
