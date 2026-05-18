'use client';

import { ALL_TYPES } from '@/lib/type-effectiveness';
import { TypeBadge } from '@/components/ui/TypeBadge';
import type { PokemonType } from '@/types/pokemon';
import { cn } from '@/lib/utils';

interface Props {
  value: PokemonType | null;
  onChange: (v: PokemonType | null) => void;
}

export function TypeFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'h-7 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
          value === null
            ? 'bg-ink text-bg-950'
            : 'glass text-ink-soft hover:text-ink'
        )}
      >
        Todos
      </button>
      {ALL_TYPES.map((t) => (
        <button
          key={t}
          onClick={() => onChange(value === t ? null : t)}
          className={cn(
            'transition-all',
            value && value !== t && 'opacity-40 saturate-50 hover:opacity-100 hover:saturate-100',
            value === t && 'ring-2 ring-ink scale-105'
          )}
        >
          <TypeBadge type={t} size="xs" />
        </button>
      ))}
    </div>
  );
}
