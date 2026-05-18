'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TypeBadge, TYPE_HEX } from '@/components/ui/TypeBadge';
import { ALL_TYPES, TYPE_CHART } from '@/lib/type-effectiveness';
import { TYPE_EXAMPLES, TYPE_BLURB } from '@/lib/typemaster/type-examples';
import { useTypeMasterStore } from '@/stores/typemasterStore';
import { artworkFor } from '@/lib/pokeapi';
import type { PokemonType } from '@/types/pokemon';

interface Props {
  type: PokemonType;
  index?: number;
}

export function LearnTypeCard({ type, index = 0 }: Props) {
  const visit = useTypeMasterStore((s) => s.visitType);
  const visited = useTypeMasterStore((s) => s.visitedTypes);
  const isVisited = visited.includes(type);
  const accent = TYPE_HEX(type);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisited) return;
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          timer = setTimeout(() => visit(type), 800);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [type, visit, isVisited]);

  const strongAgainst: PokemonType[] = [];
  const weakAgainst: PokemonType[] = [];
  const resists: PokemonType[] = [];
  const weakTo: PokemonType[] = [];
  const immuneTo: PokemonType[] = [];
  const noEffectOn: PokemonType[] = [];

  for (const def of ALL_TYPES) {
    const m = TYPE_CHART[type][def] ?? 1;
    if (m === 2) strongAgainst.push(def);
    else if (m === 0.5) weakAgainst.push(def);
    else if (m === 0) noEffectOn.push(def);
  }
  for (const atk of ALL_TYPES) {
    const m = TYPE_CHART[atk][type] ?? 1;
    if (m === 2) weakTo.push(atk);
    else if (m === 0.5) resists.push(atk);
    else if (m === 0) immuneTo.push(atk);
  }

  const examples = TYPE_EXAMPLES[type] ?? [];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="relative card-base overflow-hidden"
    >
      <div
        className="absolute inset-x-0 top-0 h-32 opacity-30 blur-3xl pointer-events-none"
        style={{ background: accent }}
      />
      <div className="relative p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold uppercase text-white shadow-card"
              style={{ background: accent }}
            >
              {type.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold capitalize">
                {type}
              </h3>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint">
                Tipo Pokémon
              </div>
            </div>
          </div>
          {isVisited && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-accent-green/15 text-accent-green uppercase tracking-wider">
              Visto
            </span>
          )}
        </div>

        <p className="text-sm text-ink-soft leading-relaxed">
          {TYPE_BLURB[type]}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Row title="Fuerte contra" types={strongAgainst} tone="green" />
          <Row title="Débil contra" types={weakAgainst} tone="red" />
          {noEffectOn.length > 0 && (
            <Row title="Sin efecto sobre" types={noEffectOn} tone="dim" />
          )}
          <Row title="Resiste" types={resists} tone="green" />
          <Row title="Vulnerable a" types={weakTo} tone="red" />
          {immuneTo.length > 0 && (
            <Row title="Inmune a" types={immuneTo} tone="dim" />
          )}
        </div>

        {examples.length > 0 && (
          <div className="pt-4 border-t border-white/[0.05]">
            <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-3">
              Pokémon icónicos
            </div>
            <div className="flex gap-3">
              {examples.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className="w-16 h-16 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <img
                      src={artworkFor(p.id)}
                      alt={p.name}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-[10px] font-semibold text-ink-dim text-center">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Row({
  title,
  types,
  tone,
}: {
  title: string;
  types: PokemonType[];
  tone: 'green' | 'red' | 'dim';
}) {
  return (
    <div>
      <div
        className={`text-[10px] uppercase tracking-widest font-semibold mb-1.5 ${
          tone === 'green'
            ? 'text-accent-green'
            : tone === 'red'
            ? 'text-accent-red'
            : 'text-ink-faint'
        }`}
      >
        {title}
      </div>
      {types.length === 0 ? (
        <div className="text-xs text-ink-faint">—</div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {types.map((t) => (
            <TypeBadge key={t} type={t} size="xs" />
          ))}
        </div>
      )}
    </div>
  );
}
