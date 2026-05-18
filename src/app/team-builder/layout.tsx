import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Builder',
  description:
    'Construye equipos competitivos de 6 con análisis defensivo en vivo, cobertura ofensiva, coach inteligente y export Showdown.',
};

export default function TeamBuilderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
