import type { Metadata } from 'next';
import { CoachTabs } from '@/components/coach/CoachTabs';
import { BrainIcon } from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Pokémon Coach · Análisis de equipo · PokéHub',
  description:
    'Analiza tu equipo Pokémon competitivo automáticamente: roles, weaknesses, cobertura ofensiva, velocidad. Coach gratis sin IA + modo Pro con Claude.',
};

// Flag de habilitación del modo AI. Cuesta dinero (~3 céntimos por respuesta
// Claude Sonnet). Activar con NEXT_PUBLIC_AI_COACH_ENABLED=true en Vercel.
function isAiCoachEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_COACH_ENABLED === 'true';
}

export default function CoachPage() {
  const aiEnabled = isAiCoachEnabled();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1 inline-flex items-center gap-1.5">
          <BrainIcon className="w-3 h-3" />
          Pokémon Coach
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Analiza tu equipo
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Score automático de 0-100, detección de roles faltantes, weaknesses
          compartidas y cobertura ofensiva. Gratis, sin login.
          {aiEnabled
            ? ' Modo Pro con Claude disponible para preguntas abiertas.'
            : ''}
        </p>
      </header>
      <CoachTabs aiEnabled={aiEnabled} />
    </div>
  );
}
