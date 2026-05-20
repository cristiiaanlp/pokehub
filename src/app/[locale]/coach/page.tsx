import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { AiCoach } from '@/components/coach/AiCoach';
import {
  BrainIcon,
  SparklesIcon,
  ArrowRight,
  ShieldIcon,
  SwordIcon,
  TargetIcon,
} from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'AI Pokémon Coach · PokéHub',
  description:
    'Tu entrenador competitivo personal. Pide counters, sets, equipos completos o análisis de tu team. Powered by Claude.',
};

// Flag de habilitación. Por defecto OFF — el endpoint cuesta dinero real
// (~3 céntimos por respuesta de Claude Sonnet). Activar en Vercel con
// NEXT_PUBLIC_AI_COACH_ENABLED=true cuando haya presupuesto.
function isCoachEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_COACH_ENABLED === 'true';
}

export default function CoachPage() {
  if (!isCoachEnabled()) {
    return <ComingSoon />;
  }
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          AI · Sólo PokéHub
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Pokémon AI Coach
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Tu entrenador competitivo personal. Pídele counters específicos, sets
          optimizados, equipos completos o que analice tu equipo guardado.
          Funciona con Claude Sonnet 4.6 — datos del meta SV actualizados.
        </p>
      </header>
      <AiCoach />
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-20">
      <div className="card-base p-8 sm:p-10 relative overflow-hidden text-center">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent-yellow/15 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand/15 text-brand-glow mb-5">
            <BrainIcon className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-accent-yellow/15 text-accent-yellow text-[10px] font-bold uppercase tracking-[0.25em] mb-4">
            <SparklesIcon className="w-3 h-3" />
            Próximamente
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            AI Pokémon Coach
          </h1>

          <p className="text-ink-dim text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
            Estamos puliendo los últimos detalles del entrenador competitivo
            personal con Claude Sonnet 4.6. Te avisaremos cuando esté listo
            para responder a tus preguntas sobre counters, sets, equipos y
            análisis de tus teams.
          </p>

          <div className="grid sm:grid-cols-3 gap-2 max-w-lg mx-auto mb-6 text-left">
            <Feature
              Icon={ShieldIcon}
              title="Counters"
              desc="¿Cómo paro a X?"
            />
            <Feature
              Icon={SwordIcon}
              title="Sets"
              desc="EVs + item + moves óptimos"
            />
            <Feature
              Icon={TargetIcon}
              title="Análisis"
              desc="Mejoras a tu equipo"
            />
          </div>

          <div className="text-xs text-ink-faint mb-6">
            Mientras tanto, prueba nuestras{' '}
            <strong className="text-ink">7 herramientas competitivas</strong>{' '}
            sin IA — calculadoras, validadores y optimizadores que ya funcionan.
          </div>

          <Link
            href="/tools"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-brand text-white font-bold text-sm shadow-glow hover:bg-brand-hover transition-colors"
          >
            Ver herramientas disponibles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({
  Icon,
  title,
  desc,
}: {
  Icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="card-base p-3 opacity-60">
      <Icon className="w-5 h-5 text-brand-glow mb-1.5" />
      <div className="text-xs font-bold">{title}</div>
      <div className="text-[10px] text-ink-dim">{desc}</div>
    </div>
  );
}
