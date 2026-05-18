'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { SearchIcon, XIcon } from '@/components/ui/Icon';
import {
  getPokedexIndex,
  hydrateTypesForIds,
  artworkFor,
} from '@/lib/pokeapi';
import { formatPokemonName, padId } from '@/lib/utils';
import type { PokemonListItem } from '@/types/pokemon';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (p: PokemonListItem) => void;
  title?: string;
}

export function PokemonSelectModal({ open, onClose, onPick, title }: Props) {
  const [all, setAll] = useState<PokemonListItem[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    getPokedexIndex().then((idx) => setAll([...idx]));
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 90);
    if (/^\d+$/.test(q)) {
      return all.filter((p) => String(p.id).includes(q)).slice(0, 90);
    }
    return all.filter((p) => p.name.includes(q)).slice(0, 90);
  }, [all, query]);

  useEffect(() => {
    const ids = filtered.filter((p) => p.types.length === 0).map((p) => p.id);
    if (ids.length) {
      hydrateTypesForIds(ids).then(() =>
        getPokedexIndex().then((idx) => setAll([...idx]))
      );
    }
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-3 top-10 bottom-10 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[640px] sm:max-w-[92vw] sm:top-16 sm:bottom-16 z-50 rounded-3xl bg-bg-900 border border-white/[0.08] shadow-card-hover flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="flex-1 min-w-0">
                {title && (
                  <div className="text-xs uppercase tracking-widest text-ink-faint font-bold mb-1">
                    {title}
                  </div>
                )}
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar Pokémon..."
                  leftIcon={<SearchIcon className="w-4 h-4" />}
                />
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-ink-dim hover:text-ink"
              >
                <XIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {all.length === 0 ? (
                <div className="text-center py-10 text-ink-dim text-sm">
                  Cargando Pokédex…
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onPick(p);
                        onClose();
                      }}
                      className="group text-left p-3 rounded-xl glass card-hover"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={artworkFor(p.id)}
                          alt={p.name}
                          className="w-12 h-12 object-contain shrink-0 group-hover:scale-110 transition-transform"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = p.sprite;
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-mono text-ink-faint">
                            #{padId(p.id)}
                          </div>
                          <div className="text-sm font-semibold truncate">
                            {formatPokemonName(p.name)}
                          </div>
                          <div className="flex gap-1 mt-1">
                            {p.types.map((t) => (
                              <TypeBadge key={t} type={t} size="xs" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
