'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ALL_TYPES } from '@/lib/type-effectiveness';
import { LearnTypeCard } from '@/components/typemaster/LearnTypeCard';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { BookOpenIcon, ArrowRight, CheckIcon } from '@/components/ui/Icon';
import { useTypeMasterStore } from '@/stores/typemasterStore';
import type { PokemonType } from '@/types/pokemon';
import { cn } from '@/lib/utils';

export default function LearnPage() {
  const visited = useTypeMasterStore((s) => s.visitedTypes);
  const [filter, setFilter] = useState<PokemonType | null>(null);

  const shown = filter ? ALL_TYPES.filter((t) => t === filter) : ALL_TYPES;
  const pct = (visited.length / ALL_TYPES.length) * 100;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
          TypeMaster · Modo Aprender
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Conoce los <span className="gradient-text">18 tipos</span>
        </h1>
        <p className="text-ink-dim mt-3 max-w-2xl">
          Cartas visuales con fuerzas, debilidades, inmunidades y Pokémon
          icónicos por cada tipo. Scrolla — desbloquearás un badge cuando hayas
          visto los 18.
        </p>
      </div>

      <div className="card-base p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2 font-semibold">
            <BookOpenIcon className="w-4 h-4 text-brand-glow" />
            Progreso de estudio
          </div>
          <div className="font-mono text-ink-dim">
            {visited.length}/{ALL_TYPES.length}
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-brand to-brand-glow"
          />
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            'h-7 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
            filter === null ? 'bg-ink text-bg-950' : 'glass text-ink-soft hover:text-ink'
          )}
        >
          Todos
        </button>
        {ALL_TYPES.map((t) => {
          const isVisited = visited.includes(t);
          return (
            <button
              key={t}
              onClick={() => setFilter(filter === t ? null : t)}
              className={cn(
                'relative transition-all',
                filter && filter !== t && 'opacity-40 saturate-50 hover:opacity-100 hover:saturate-100',
                filter === t && 'ring-2 ring-ink scale-105'
              )}
            >
              <TypeBadge type={t} size="xs" />
              {isVisited && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-green ring-2 ring-bg-950 flex items-center justify-center">
                  <CheckIcon className="w-2 h-2 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {shown.map((t, i) => (
          <LearnTypeCard key={t} type={t} index={i} />
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Link
          href="/typemaster/play?difficulty=beginner"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-white font-bold text-sm shadow-glow hover:scale-[1.02] transition-transform"
        >
          Ya sé los tipos, ¡a jugar!
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
