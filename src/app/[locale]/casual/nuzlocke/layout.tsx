import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuzlocke Helper',
  description:
    'Crea runs nuzlocke, registra encuentros por ruta, marca muertes, controla medallas y reglas. Sin spreadsheets.',
};

export default function NuzlockeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
