import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TypeMaster · Minijuego de tipos',
  description:
    'Domina la tabla de tipos jugando: quiz con timer, sistema RPG con XP y rangos, daily challenge y leaderboard.',
};

export default function TypeMasterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
