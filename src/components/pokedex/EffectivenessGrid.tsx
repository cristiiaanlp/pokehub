'use client';

import { TypeBadge } from '@/components/ui/TypeBadge';
import { effectivenessAgainst } from '@/lib/type-effectiveness';
import type { PokemonType } from '@/types/pokemon';

const BUCKETS: { label: string; test: (m: number) => boolean; className: string }[] = [
  { label: '4× débil', test: (m) => m === 4, className: 'bg-accent-red text-white' },
  { label: '2× débil', test: (m) => m === 2, className: 'bg-accent-red/70 text-white' },
  { label: '0,5×', test: (m) => m === 0.5, className: 'bg-accent-green/70 text-white' },
  { label: '0,25×', test: (m) => m === 0.25, className: 'bg-accent-green text-white' },
  { label: 'Inmune', test: (m) => m === 0, className: 'bg-bg-700 text-ink' },
];

export function EffectivenessGrid({ types }: { types: PokemonType[] }) {
  const rows = effectivenessAgainst(types);
  return (
    <div className="space-y-4">
      {BUCKETS.map((b) => {
        const matching = rows.filter((r) => b.test(r.multiplier));
        if (matching.length === 0) return null;
        return (
          <div key={b.label} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <div
              className={`shrink-0 inline-flex items-center justify-center h-7 px-3 rounded-md text-xs font-bold uppercase tracking-wide ${b.className}`}
            >
              {b.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matching.map((r) => (
                <TypeBadge key={r.type} type={r.type} size="sm" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
