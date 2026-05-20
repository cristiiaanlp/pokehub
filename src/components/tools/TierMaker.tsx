'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { artworkFor } from '@/lib/pokeapi';
import {
  PlusIcon,
  XIcon,
  CheckIcon,
  TrashIcon,
} from '@/components/ui/Icon';
import type { PokemonListItem } from '@/types/pokemon';

type TierId = 'S' | 'A' | 'B' | 'C' | 'D' | 'unranked';

const TIER_DEFS: Array<{ id: TierId; label: string; color: string }> = [
  { id: 'S', label: 'S', color: 'bg-red-500/20 border-red-500/40 text-red-300' },
  { id: 'A', label: 'A', color: 'bg-orange-500/20 border-orange-500/40 text-orange-300' },
  { id: 'B', label: 'B', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { id: 'C', label: 'C', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  { id: 'D', label: 'D', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' },
  { id: 'unranked', label: '?', color: 'bg-white/[0.04] border-white/[0.08] text-ink-faint' },
];

interface State {
  S: number[];
  A: number[];
  B: number[];
  C: number[];
  D: number[];
  unranked: number[];
}

const EMPTY_STATE: State = { S: [], A: [], B: [], C: [], D: [], unranked: [] };

// URL serialization: ?s=1,4&a=6,9&b=...
function stateToParams(state: State): URLSearchParams {
  const params = new URLSearchParams();
  for (const tier of ['S', 'A', 'B', 'C', 'D', 'unranked'] as TierId[]) {
    const ids = state[tier];
    if (ids.length > 0) {
      params.set(tier.toLowerCase(), ids.join(','));
    }
  }
  return params;
}

function parseState(params: URLSearchParams): State {
  const state: State = { S: [], A: [], B: [], C: [], D: [], unranked: [] };
  const KEY_MAP: Record<string, keyof State> = {
    s: 'S',
    a: 'A',
    b: 'B',
    c: 'C',
    d: 'D',
    unranked: 'unranked',
  };
  for (const param of Object.keys(KEY_MAP)) {
    const raw = params.get(param);
    if (!raw) continue;
    const ids = raw
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0 && n <= 1025);
    state[KEY_MAP[param]] = ids;
  }
  return state;
}

export function TierMaker() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [state, setState] = useState<State>(() => parseState(params));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync state ←→ URL
  useEffect(() => {
    const newParams = stateToParams(state).toString();
    const target = newParams ? `${pathname}?${newParams}` : pathname;
    router.replace(target, { scroll: false });
  }, [state]);  // eslint-disable-line react-hooks/exhaustive-deps

  const allIds = useMemo(
    () =>
      new Set<number>([
        ...state.S, ...state.A, ...state.B, ...state.C, ...state.D, ...state.unranked,
      ]),
    [state]
  );

  const findTier = (id: number): TierId | null => {
    for (const t of ['S', 'A', 'B', 'C', 'D', 'unranked'] as TierId[]) {
      if (state[t].includes(id)) return t;
    }
    return null;
  };

  const moveTo = (id: number, target: TierId) => {
    const current = findTier(id);
    setState((s) => {
      const next: State = {
        S: [...s.S], A: [...s.A], B: [...s.B], C: [...s.C], D: [...s.D],
        unranked: [...s.unranked],
      };
      if (current) {
        next[current] = next[current].filter((x) => x !== id);
      }
      if (!next[target].includes(id)) {
        next[target].push(id);
      }
      return next;
    });
  };

  const removeId = (id: number) => {
    setState((s) => ({
      S: s.S.filter((x) => x !== id),
      A: s.A.filter((x) => x !== id),
      B: s.B.filter((x) => x !== id),
      C: s.C.filter((x) => x !== id),
      D: s.D.filter((x) => x !== id),
      unranked: s.unranked.filter((x) => x !== id),
    }));
  };

  const addPokemon = (p: PokemonListItem) => {
    if (allIds.has(p.id)) return;
    setState((s) => ({ ...s, unranked: [...s.unranked, p.id] }));
  };

  const clearAll = () => {
    if (allIds.size > 0 && !confirm('¿Vaciar toda la tier list?')) return;
    setState(EMPTY_STATE);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  };

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="card-base p-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setPickerOpen(true)}
          className="h-9 px-3 rounded-md bg-brand text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-hover inline-flex items-center gap-1.5"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Añadir Pokémon
        </button>
        <button
          onClick={copyUrl}
          disabled={allIds.size === 0}
          className="h-9 px-3 rounded-md bg-accent-green/15 text-accent-green text-xs font-bold uppercase tracking-widest hover:bg-accent-green/25 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5" />
              URL copiada
            </>
          ) : (
            '🔗 Copiar URL'
          )}
        </button>
        <span className="text-xs text-ink-faint ml-auto">
          {allIds.size} Pokémon · {state.S.length} S · {state.A.length} A ·{' '}
          {state.B.length} B · {state.C.length} C · {state.D.length} D
        </span>
        {allIds.size > 0 && (
          <button
            onClick={clearAll}
            className="h-9 px-3 rounded-md bg-accent-red/15 text-accent-red text-xs font-bold uppercase tracking-widest hover:bg-accent-red/25 inline-flex items-center gap-1.5"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Vaciar
          </button>
        )}
      </div>

      {allIds.size === 0 && (
        <div className="card-base p-8 text-center text-sm text-ink-dim">
          Empieza añadiendo Pokémon. Aparecerán abajo y podrás arrastrarlos a
          cada tier.
        </div>
      )}

      {/* Tiers */}
      {TIER_DEFS.map((tier) => {
        const ids = state[tier.id];
        return (
          <div
            key={tier.id}
            className={`card-base flex border-l-4 ${tier.color.split(' ')[1]}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedId !== null) {
                moveTo(draggedId, tier.id);
                setDraggedId(null);
              }
            }}
          >
            <div
              className={`w-16 sm:w-20 flex items-center justify-center font-display font-bold text-2xl sm:text-3xl ${tier.color}`}
            >
              {tier.label}
            </div>
            <div className="flex-1 p-2 flex flex-wrap gap-1.5 min-h-[80px]">
              {ids.length === 0 ? (
                <div className="text-[10px] text-ink-faint italic self-center px-2">
                  Arrastra Pokémon aquí o usa los botones inferiores en cada
                  sprite.
                </div>
              ) : (
                ids.map((id) => (
                  <PokemonChip
                    key={id}
                    id={id}
                    currentTier={tier.id}
                    onMove={moveTo}
                    onRemove={removeId}
                    onDragStart={() => setDraggedId(id)}
                    onDragEnd={() => setDraggedId(null)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}

      <PokemonSelectModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(p) => {
          addPokemon(p);
          setPickerOpen(false);
        }}
        title="Añadir Pokémon a la tier list"
      />
    </div>
  );
}

function PokemonChip({
  id,
  currentTier,
  onMove,
  onRemove,
  onDragStart,
  onDragEnd,
}: {
  id: number;
  currentTier: TierId;
  onMove: (id: number, tier: TierId) => void;
  onRemove: (id: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative group">
      <button
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] cursor-grab active:cursor-grabbing flex items-center justify-center"
        title={`Click para mover · arrastra a otro tier`}
      >
        <img
          src={artworkFor(id)}
          alt={`#${id}`}
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
          loading="lazy"
        />
      </button>
      {open && (
        <div className="absolute z-10 top-full mt-1 left-0 card-base p-1.5 flex items-center gap-1 shadow-card-hover">
          {(['S', 'A', 'B', 'C', 'D'] as TierId[])
            .filter((t) => t !== currentTier)
            .map((t) => (
              <button
                key={t}
                onClick={() => {
                  onMove(id, t);
                  setOpen(false);
                }}
                className="w-6 h-6 rounded text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12]"
              >
                {t}
              </button>
            ))}
          <button
            onClick={() => {
              onRemove(id);
              setOpen(false);
            }}
            className="w-6 h-6 rounded inline-flex items-center justify-center bg-accent-red/15 text-accent-red hover:bg-accent-red/25"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
