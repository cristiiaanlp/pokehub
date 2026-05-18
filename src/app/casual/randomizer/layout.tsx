import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Randomizer · Pokémon aleatorios',
  description:
    'Genera Pokémon, equipos de 6, monotipos, starter random o un challenge nuzlocke completo con reglas y twist.',
};

export default function RandomizerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
