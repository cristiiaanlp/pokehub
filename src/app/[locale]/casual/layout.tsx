import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modo Casual',
  description:
    'Herramientas para entrenadores casuales: shiny tracker, randomizer, nuzlocke helper y planner de equipos de historia.',
};

export default function CasualLayout({ children }: { children: React.ReactNode }) {
  return children;
}
