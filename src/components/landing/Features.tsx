'use client';

import { motion } from 'framer-motion';
import {
  GridIcon,
  UsersIcon,
  TrendingUpIcon,
  ShieldIcon,
  BrainIcon,
  SparklesIcon,
} from '@/components/ui/Icon';

const FEATURES = [
  {
    title: 'Pokédex moderna',
    desc: 'Stats animadas, evoluciones, formas, sprites shiny, cries, descripciones y movimientos. Todo lo que necesitas saber, sin lecturas eternas.',
    Icon: GridIcon,
    color: 'from-blue-500/30 to-cyan-400/10',
  },
  {
    title: 'Team Builder visual',
    desc: 'Construye equipos de 6 con drag & drop, ajusta movimientos, naturalezas y EVs. Importa/exporta formato Showdown.',
    Icon: UsersIcon,
    color: 'from-purple-500/30 to-pink-400/10',
  },
  {
    title: 'Análisis inteligente',
    desc: 'Detecta debilidades, falta de cobertura y huecos defensivos. Te decimos qué arreglar antes de la siguiente batalla.',
    Icon: ShieldIcon,
    color: 'from-emerald-500/30 to-teal-400/10',
  },
  {
    title: 'Meta Hub',
    desc: 'Sigue arquetipos, tendencias, win rates y equipos populares. Decide qué construir con datos, no rumores.',
    Icon: TrendingUpIcon,
    color: 'from-yellow-500/30 to-orange-400/10',
  },
  {
    title: 'Modo Casual',
    desc: 'Planner para historia, tracking de shinies, colecciones y favoritos. Porque jugar Pokémon también es disfrutar.',
    Icon: SparklesIcon,
    color: 'from-rose-500/30 to-red-400/10',
  },
  {
    title: 'IA Pokémon (próximamente)',
    desc: 'Mejora mi equipo, hazme un rain team, counter para Garchomp. Soporte conversacional preparado para la siguiente ola.',
    Icon: BrainIcon,
    color: 'from-fuchsia-500/30 to-violet-400/10',
  },
];

export function Features() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-3">
            Todo en un solo sitio
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            La app Pokémon que <span className="gradient-text">Nintendo</span>{' '}
            debería haber hecho
          </h2>
          <p className="text-ink-soft mt-4 text-lg leading-relaxed">
            Olvida abrir cinco pestañas. PokéHub combina todo lo que un
            entrenador moderno necesita en una experiencia premium, rápida y
            visual.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative card-base card-hover p-6 overflow-hidden"
            >
              <div
                className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${f.color} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl glass-strong inline-flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.Icon className="w-5 h-5 text-brand-glow" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-ink-dim leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
