'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight, SparklesIcon } from '@/components/ui/Icon';
import { artworkFor } from '@/lib/pokeapi';

const FEATURED = [
  { id: 6, name: 'Charizard', delay: 0, x: 8, y: 8, scale: 1, rotate: -6 },
  { id: 25, name: 'Pikachu', delay: 0.2, x: 70, y: 60, scale: 0.75, rotate: 8 },
  { id: 149, name: 'Dragonite', delay: 0.4, x: 72, y: 10, scale: 0.95, rotate: 5 },
  { id: 448, name: 'Lucario', delay: 0.6, x: 4, y: 58, scale: 0.85, rotate: -3 },
];

export function Hero() {
  const t = useTranslations('Landing');
  return (
    <section className="relative overflow-hidden">
      {/* Background grid + glows */}
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-radial-fade pointer-events-none" />
      <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full bg-accent-yellow/10 blur-3xl pointer-events-none" />
      <div className="absolute top-20 -right-32 w-[400px] h-[400px] rounded-full bg-accent-red/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 h-8 rounded-full glass text-xs font-medium text-ink-soft"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              <SparklesIcon className="w-3.5 h-3.5 text-accent-yellow" />
              {t('heroEyebrow')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              {t('heroTitle')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-ink-soft max-w-xl leading-relaxed"
            >
              {t('heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link href="/pokedex">
                <Button size="lg" variant="gradient">
                  {t('heroExplore')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/team-builder">
                <Button size="lg" variant="secondary">
                  {t('heroBuild')}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-6 max-w-lg"
            >
              {[
                { value: '1025+', label: 'Pokémon' },
                { value: '18', label: 'Tipos' },
                { value: '∞', label: 'Equipos' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl lg:text-3xl font-display font-bold text-ink">
                    {s.value}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-ink-faint mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual mockup */}
          <div className="relative h-[420px] lg:h-[560px]">
            <div className="absolute inset-4 rounded-[2.5rem] glass-strong border border-white/[0.08] shadow-card-hover overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-accent-yellow/10" />

              {FEATURED.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: p.scale,
                    rotate: p.rotate,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + p.delay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                  }}
                  className="absolute will-change-transform"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    }}
                  >
                    <img
                      src={artworkFor(p.id)}
                      alt={p.name}
                      className="w-44 h-44 sm:w-56 sm:h-56 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                      loading="eager"
                    />
                  </motion.div>
                </motion.div>
              ))}

              {/* HUD overlay */}
              <div className="absolute bottom-4 left-4 right-4 glass-strong rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-glow shrink-0 flex items-center justify-center font-bold text-bg-950">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-ink-faint uppercase tracking-widest">
                    Análisis en vivo
                  </div>
                  <div className="text-sm font-semibold text-ink truncate">
                    Equipo balanceado · 2 debilidades detectadas
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 h-7 px-2.5 rounded-md bg-accent-green/15 text-accent-green text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                  LIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
