'use client';

import { motion } from 'framer-motion';
import { artworkFor } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { StatBar } from '@/components/ui/StatBar';
import type { PokemonType } from '@/types/pokemon';

interface Showcase {
  id: number;
  name: string;
  types: PokemonType[];
  stats: { hp: number; attack: number; defense: number; speed: number };
}

const POKES: Showcase[] = [
  {
    id: 445,
    name: 'Garchomp',
    types: ['dragon', 'ground'],
    stats: { hp: 108, attack: 130, defense: 95, speed: 102 },
  },
  {
    id: 376,
    name: 'Metagross',
    types: ['steel', 'psychic'],
    stats: { hp: 80, attack: 135, defense: 130, speed: 70 },
  },
  {
    id: 658,
    name: 'Greninja',
    types: ['water', 'dark'],
    stats: { hp: 72, attack: 95, defense: 67, speed: 122 },
  },
];

export function StatsShowcase() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-accent-yellow font-semibold mb-3">
            Stats reales · datos en vivo
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Todo Pokémon, listo para analizar
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {POKES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-base card-hover p-6 relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition-colors" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs font-mono text-ink-faint">
                      #{String(p.id).padStart(4, '0')}
                    </div>
                    <h3 className="font-display text-xl font-bold mt-0.5">
                      {p.name}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} size="xs" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-center my-2">
                  <img
                    src={artworkFor(p.id)}
                    alt={p.name}
                    className="w-36 h-36 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                  />
                </div>
                <div className="space-y-1.5 mt-3">
                  <StatBar label="HP" value={p.stats.hp} />
                  <StatBar label="Ataque" value={p.stats.attack} />
                  <StatBar label="Defensa" value={p.stats.defense} />
                  <StatBar label="Velocidad" value={p.stats.speed} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
