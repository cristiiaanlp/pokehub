import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favoritos',
  description: 'Tus Pokémon favoritos guardados, siempre a un clic.',
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
