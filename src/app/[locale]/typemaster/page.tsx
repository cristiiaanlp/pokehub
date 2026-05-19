'use client';

import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/common/PageHeader';
import { ModeCard } from '@/components/typemaster/ModeCard';
import { XPBar } from '@/components/typemaster/XPBar';
import { StatStrip } from '@/components/typemaster/StatStrip';
import { BadgeGrid } from '@/components/typemaster/BadgeGrid';
import { DailyChallengeCard } from '@/components/typemaster/DailyChallengeCard';
import { useTypeMasterStore } from '@/stores/typemasterStore';
import {
  BookOpenIcon,
  ChartIcon,
  TrophyIcon,
  GamepadIcon,
  ArrowRight,
  VolumeIcon,
} from '@/components/ui/Icon';

export default function TypeMasterHub() {
  const last = useTypeMasterStore((s) => s.lastDifficulty);
  const sound = useTypeMasterStore((s) => s.sound);
  const haptics = useTypeMasterStore((s) => s.haptics);
  const toggleSound = useTypeMasterStore((s) => s.toggleSound);
  const toggleHaptics = useTypeMasterStore((s) => s.toggleHaptics);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-10">
      <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-[400px] h-[400px] rounded-full bg-accent-yellow/15 blur-3xl pointer-events-none" />
        <div className="relative grid lg:grid-cols-[1fr,auto] gap-6 items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-brand/15 text-brand-glow text-xs font-bold tracking-widest uppercase mb-3"
            >
              <GamepadIcon className="w-3.5 h-3.5" />
              TypeMaster · Minijuego
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight"
            >
              Domina la <span className="gradient-text">tabla de tipos</span>
              <br className="hidden sm:block" /> jugando 60 segundos al día
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-ink-soft mt-3 text-lg max-w-2xl"
            >
              Responde rápido, encadena combos, sube de nivel y compite. Aprende
              jugando — no leyendo tablas aburridas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              <Link
                href={`/typemaster/play?difficulty=${last}`}
                className="h-12 px-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-white font-bold text-sm shadow-glow-strong hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Continuar jugando
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/typemaster/learn"
                className="h-12 px-5 inline-flex items-center gap-2 rounded-xl glass-strong text-ink font-semibold text-sm hover:bg-white/[0.10]"
              >
                <BookOpenIcon className="w-4 h-4" />
                Modo aprender
              </Link>
            </motion.div>

            {/* Compact preferences */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                onClick={toggleSound}
                className={`h-9 px-3 inline-flex items-center gap-2 rounded-lg text-xs font-semibold transition-colors ${
                  sound
                    ? 'bg-brand/15 text-brand-glow'
                    : 'glass text-ink-faint hover:text-ink'
                }`}
              >
                <VolumeIcon className="w-3.5 h-3.5" />
                Sonido {sound ? 'on' : 'off'}
              </button>
              <button
                onClick={toggleHaptics}
                className={`h-9 px-3 inline-flex items-center gap-2 rounded-lg text-xs font-semibold transition-colors ${
                  haptics
                    ? 'bg-brand/15 text-brand-glow'
                    : 'glass text-ink-faint hover:text-ink'
                }`}
              >
                📳 Vibración {haptics ? 'on' : 'off'}
              </button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-[320px]"
          >
            <XPBar />
          </motion.div>
        </div>
      </div>

      <div className="lg:hidden">
        <XPBar />
      </div>

      <StatStrip />

      <DailyChallengeCard />

      <section>
        <PageHeader
          kicker="Elige tu modo"
          title={
            <>
              Tres niveles, una sola{' '}
              <span className="gradient-text">misión</span>
            </>
          }
          subtitle="Empieza tranquilo y escala hasta el Pro Mode. Cada modo da más XP."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ModeCard difficulty="beginner" index={0} />
          <ModeCard difficulty="advanced" index={1} />
          <ModeCard difficulty="pro" index={2} />
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        <Link
          href="/typemaster/learn"
          className="card-base card-hover p-5 flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-brand/15 text-brand-glow inline-flex items-center justify-center">
            <BookOpenIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Modo Aprender</div>
            <div className="text-xs text-ink-dim">
              Cartas visuales por tipo
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-faint ml-auto" />
        </Link>
        <Link
          href="/typemaster/stats"
          className="card-base card-hover p-5 flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-green/15 text-accent-green inline-flex items-center justify-center">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Mis stats</div>
            <div className="text-xs text-ink-dim">
              Precisión, tipos fallados
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-faint ml-auto" />
        </Link>
        <Link
          href="/typemaster/leaderboard"
          className="card-base card-hover p-5 flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-yellow/15 text-accent-yellow inline-flex items-center justify-center">
            <TrophyIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Leaderboard</div>
            <div className="text-xs text-ink-dim">Compite globalmente</div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-faint ml-auto" />
        </Link>
      </section>

      <Link
        href="/typemaster/meta-daily"
        className="block relative overflow-hidden rounded-2xl border border-accent-yellow/30 hover:border-accent-yellow/50 transition-colors p-5 sm:p-6 group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/15 via-orange-500/10 to-brand/10" />
        <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-accent-yellow/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-yellow/20 text-accent-yellow inline-flex items-center justify-center shrink-0">
            <ChartIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-accent-yellow font-bold mb-1">
              📊 NUEVO · Meta Daily Quiz
            </div>
            <div className="font-display text-lg font-bold">
              ¿Sabes quién manda en Champions hoy?
            </div>
            <div className="text-xs text-ink-dim mt-0.5">
              6 preguntas sobre el meta actual usando datos vivos de Pikalytics.
              Una vez al día.
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      </Link>

      <section>
        <h2 className="font-display text-2xl font-bold mb-4">Badges</h2>
        <BadgeGrid />
      </section>
    </div>
  );
}
