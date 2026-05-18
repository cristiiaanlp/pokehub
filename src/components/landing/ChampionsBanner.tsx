'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, GamepadIcon, SparklesIcon } from '@/components/ui/Icon';
import { artworkFor } from '@/lib/pokeapi';

// Pokémon icónicos del meta actual de Champions Reg M-A
const ICONS = [
  { id: 727, name: 'Incineroar' },
  { id: 903, name: 'Sneasler' },
  { id: 445, name: 'Garchomp' },
  { id: 478, name: 'Froslass' },
];

export function ChampionsBanner() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-accent-red/30 p-6 sm:p-8 lg:p-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-red/20 via-orange-500/10 to-accent-yellow/15" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-accent-red/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid lg:grid-cols-[1fr,auto] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-accent-red/20 text-accent-red text-xs font-bold tracking-widest uppercase mb-3">
              <GamepadIcon className="w-3.5 h-3.5" />
              Nuevo · Pokémon Champions
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Soporte completo para <br className="hidden sm:block" />
              <span className="gradient-text">Pokémon Champions</span>
            </h2>
            <p className="text-ink-soft mt-3 max-w-xl">
              Salió el 8 abril 2026. Tenemos meta Reg M-A en vivo: usage
              stats, core pairs, equipos top de torneos y calendario VGC. Todo
              importable a Showdown.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href="/meta/champions"
                className="h-12 px-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-red to-orange-500 text-white font-bold text-sm shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Ver Champions hub
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/meta/teams"
                className="h-12 px-5 inline-flex items-center gap-2 rounded-xl glass-strong hover:bg-white/[0.10] text-sm font-semibold"
              >
                <SparklesIcon className="w-4 h-4 text-accent-yellow" />
                Equipos top
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {ICONS.map((p, i) => (
              <motion.img
                key={p.id}
                src={artworkFor(p.id)}
                alt={p.name}
                initial={{ opacity: 0, y: 20, rotate: i % 2 ? 6 : -6 }}
                whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 4 : -4 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
                className="w-28 h-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] -mr-3"
                style={{ zIndex: 4 - i }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
