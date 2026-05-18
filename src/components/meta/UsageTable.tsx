'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { artworkFor } from '@/lib/pokeapi';

export interface UsageRow {
  rank: number;
  name: string;
  usagePct: number;
  speciesId: number | null;
}

interface Props {
  rows: UsageRow[];
  showSecondary?: 'rawPct' | 'winRate';
  rightLabel?: string;
  rightValues?: Record<number, number>; // by rank -> value
}

export function UsageTable({ rows, rightLabel, rightValues }: Props) {
  return (
    <div className="card-base p-3 sm:p-4">
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <motion.div
            key={`${r.rank}-${r.name}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4) }}
            className={`group flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-colors ${
              i < 3 ? 'glass-strong' : 'glass'
            }`}
          >
            <div className="w-7 text-center font-mono font-bold text-ink-faint shrink-0 text-xs">
              {String(r.rank).padStart(2, '0')}
            </div>
            {r.speciesId ? (
              <Link
                href={`/pokedex/${r.speciesId}`}
                className="shrink-0 group/icon"
              >
                <img
                  src={artworkFor(r.speciesId)}
                  alt={r.name}
                  className="w-12 h-12 object-contain group-hover/icon:scale-110 transition-transform"
                  loading="lazy"
                />
              </Link>
            ) : (
              <div className="w-12 h-12 rounded-md bg-white/[0.04] shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {r.speciesId ? (
                <Link
                  href={`/pokedex/${r.speciesId}`}
                  className="font-semibold text-ink hover:text-brand-glow truncate block"
                >
                  {r.name}
                </Link>
              ) : (
                <div className="font-semibold truncate">{r.name}</div>
              )}
              <div className="hidden sm:block h-1.5 mt-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(r.usagePct * 2, 100)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                  className="h-full bg-gradient-to-r from-brand to-brand-glow"
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-bold text-ink tabular-nums">
                {r.usagePct.toFixed(1)}%
              </div>
              {rightLabel && rightValues && rightValues[r.rank] !== undefined && (
                <div className="text-[10px] text-ink-faint uppercase tracking-wider">
                  {rightLabel}{' '}
                  <span className="text-accent-green font-mono">
                    {rightValues[r.rank].toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
