'use client';

import { motion } from 'framer-motion';
import { TypeBadge, TYPE_HEX } from '@/components/ui/TypeBadge';
import { PlusIcon, TrashIcon } from '@/components/ui/Icon';
import { useTeamStore } from '@/stores/teamStore';
import { useUIStore } from '@/stores/uiStore';
import type { TeamMember } from '@/types/pokemon';
import { formatPokemonName } from '@/lib/utils';
import { artworkFor } from '@/lib/pokeapi';

export function TeamSlot({
  member,
  index,
}: {
  member: TeamMember | null;
  index: number;
}) {
  const openPicker = useUIStore((s) => s.openPicker);
  const setSlot = useTeamStore((s) => s.setSlot);

  if (!member) {
    return (
      <button
        onClick={() => openPicker(index)}
        className="card-base p-5 h-44 sm:h-52 flex flex-col items-center justify-center gap-2 text-ink-faint hover:text-ink hover:bg-white/[0.06] border-dashed border-white/[0.08] hover:border-brand/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl glass-strong inline-flex items-center justify-center">
          <PlusIcon className="w-5 h-5" />
        </div>
        <div className="text-xs font-semibold uppercase tracking-widest">
          Añadir Pokémon
        </div>
        <div className="text-[10px] text-ink-faint">Slot {index + 1}</div>
      </button>
    );
  }

  const primary = member.types[0];
  const accent = primary ? TYPE_HEX(primary) : '#3B82F6';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative card-base p-4 h-44 sm:h-52 overflow-hidden group"
    >
      <div
        className="absolute -top-12 -right-10 w-44 h-44 rounded-full opacity-25 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] text-ink-faint font-mono">
            Slot {index + 1}
          </div>
          <div className="font-display text-base font-bold truncate">
            {formatPokemonName(member.name)}
          </div>
          <div className="flex gap-1 mt-1">
            {member.types.map((t) => (
              <TypeBadge key={t} type={t} size="xs" />
            ))}
          </div>
        </div>
        <button
          onClick={() => setSlot(index, null)}
          aria-label="Quitar"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 inline-flex items-center justify-center rounded-md bg-accent-red/10 hover:bg-accent-red/30 text-accent-red"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="relative h-24 sm:h-28 flex items-end justify-center mt-1">
        <img
          src={artworkFor(member.pokemonId)}
          alt={member.name}
          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = member.sprite;
          }}
        />
      </div>
    </motion.div>
  );
}
