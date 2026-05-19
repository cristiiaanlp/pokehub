'use client';

// Note: per-page metadata for client components is handled by the parent layout.
// See: src/app/casual/layout.tsx
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/common/PageHeader';
import {
  SparklesIcon,
  HeartIcon,
  GridIcon,
  BoltIcon,
  TargetIcon,
  PokeballIcon,
} from '@/components/ui/Icon';

const TOOLS = [
  {
    title: 'Planner de equipo',
    desc: 'Diseña el equipo perfecto para tu partida — sin meta, sin presión, con análisis de tipos en vivo.',
    Icon: PokeballIcon,
    color: 'from-blue-500/30 to-cyan-400/10',
    href: '/team-builder',
  },
  {
    title: 'Shiny tracker',
    desc: 'Registra encuentros, calcula odds en tiempo real y guarda cada shiny capturado como trofeo.',
    Icon: SparklesIcon,
    color: 'from-yellow-500/30 to-orange-400/10',
    href: '/casual/shiny',
  },
  {
    title: 'Colecciones',
    desc: 'Organiza tu dex personal a base de favoritos. Compártela cuando conectes Supabase.',
    Icon: GridIcon,
    color: 'from-purple-500/30 to-pink-400/10',
    href: '/favorites',
  },
  {
    title: 'Randomizer',
    desc: 'Genera retos: Pokémon random, equipo monotipo, starter al azar o un challenge nuzlocke completo.',
    Icon: BoltIcon,
    color: 'from-emerald-500/30 to-teal-400/10',
    href: '/casual/randomizer',
  },
  {
    title: 'Nuzlocke helper',
    desc: 'Crea runs, registra encuentros por ruta, marca muertes y graba tu progreso paso a paso.',
    Icon: TargetIcon,
    color: 'from-rose-500/30 to-red-400/10',
    href: '/casual/nuzlocke',
  },
  {
    title: 'Favoritos',
    desc: 'Tus Pokémon preferidos, siempre a un clic desde cualquier punto de la app.',
    Icon: HeartIcon,
    color: 'from-fuchsia-500/30 to-violet-400/10',
    href: '/favorites',
  },
];

export default function CasualPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
      <PageHeader
        kicker="Modo Casual"
        title={
          <>
            Pokémon para <span className="gradient-text">disfrutar</span>
          </>
        }
        subtitle="Porque no todo el mundo juega competitivo. Herramientas pensadas para entrenadores que viven la aventura."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link
              href={t.href}
              className="group relative block card-base card-hover p-6 overflow-hidden h-full"
            >
              <div
                className={`absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br ${t.color} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl glass-strong inline-flex items-center justify-center group-hover:scale-110 transition-transform">
                    <t.Icon className="w-5 h-5 text-brand-glow" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold">{t.title}</h3>
                <p className="text-sm text-ink-dim leading-relaxed mt-1.5">
                  {t.desc}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
