import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shiny Tracker',
  description:
    'Registra tus shiny hunts, calcula odds en vivo según el método (Masuda, Outbreak, Pokéradar...) y guarda cada captura.',
};

export default function ShinyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
