import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comunidad',
  description:
    'Equipos compartidos por la comunidad PokéHub. Explora, copia e importa equipos publicados por otros entrenadores.',
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
