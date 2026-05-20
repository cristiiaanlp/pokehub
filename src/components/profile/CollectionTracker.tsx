'use client';

import { useMemo, useState } from 'react';
import { artworkFor, spriteFor } from '@/lib/pokeapi';
import {
  type CollectionEntry,
  GEN_RANGES,
  computeStats,
} from '@/lib/collection';
import { SparklesIcon, SearchIcon } from '@/components/ui/Icon';

interface Props {
  initialEntries: CollectionEntry[];
}

export function CollectionTracker({ initialEntries }: Props) {
  // Estado local: Map por pokemon_id para lookup O(1)
  const [entryMap, setEntryMap] = useState<Map<number, CollectionEntry>>(() => {
    const m = new Map<number, CollectionEntry>();
    for (const e of initialEntries) m.set(e.pokemon_id, e);
    return m;
  });
  const [activeGen, setActiveGen] = useState<number>(1);
  const [search, setSearch] = useState('');

  const stats = useMemo(
    () => computeStats(Array.from(entryMap.values())),
    [entryMap]
  );

  const range = GEN_RANGES.find((g) => g.gen === activeGen)!;
  const idsInRange = useMemo(() => {
    const arr: number[] = [];
    for (let i = range.from; i <= range.to; i++) arr.push(i);
    return arr;
  }, [range]);

  const filteredIds = useMemo(() => {
    const q = search.trim();
    if (!q) return idsInRange;
    return idsInRange.filter((id) => String(id).includes(q));
  }, [idsInRange, search]);

  const toggle = async (id: number, shiny: boolean) => {
    const current = entryMap.get(id) ?? {
      pokemon_id: id,
      owned: false,
      shiny: false,
    };
    const next: CollectionEntry = shiny
      ? { ...current, shiny: !current.shiny, owned: current.owned || !current.shiny }
      : { ...current, owned: !current.owned };
    // Si destogglea owned, también shiny se va
    if (!shiny && !next.owned) next.shiny = false;

    // Optimistic
    const newMap = new Map(entryMap);
    if (!next.owned && !next.shiny) newMap.delete(id);
    else newMap.set(id, next);
    setEntryMap(newMap);

    // Persist
    try {
      await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          pokemon_id: id,
          owned: next.owned,
          shiny: next.shiny,
        }),
      });
    } catch {
      // Revert si falla
      setEntryMap(entryMap);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats global */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          label="Tenidos"
          value={stats.totalOwned}
          total={stats.totalPokemon}
          tone="text-accent-green"
        />
        <StatCard
          label="Shinies"
          value={stats.totalShiny}
          total={stats.totalPokemon}
          tone="text-accent-yellow"
        />
        <StatCard
          label="% Living Pokédex"
          value={Number(stats.ownedPct.toFixed(1))}
          unit="%"
          tone="text-brand-glow"
        />
        <StatCard
          label="% Shiny dex"
          value={Number(stats.shinyPct.toFixed(2))}
          unit="%"
          tone="text-purple-300"
        />
      </div>

      {/* Stats por gen */}
      <div className="card-base p-4">
        <h3 className="font-display font-bold text-sm mb-3">Progreso por generación</h3>
        <div className="space-y-2">
          {stats.byGen.map((g) => (
            <div key={g.gen}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold">{g.label}</span>
                <span className="font-mono text-ink-faint tabular-nums">
                  {g.owned} / {g.total}{' '}
                  {g.shiny > 0 && (
                    <span className="text-accent-yellow ml-2">✨ {g.shiny}</span>
                  )}
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-brand-glow"
                  style={{ width: `${g.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selector de gen + búsqueda */}
      <div className="card-base p-3 flex items-center gap-2 flex-wrap">
        {GEN_RANGES.map((g) => (
          <button
            key={g.gen}
            onClick={() => setActiveGen(g.gen)}
            className={`h-8 px-3 rounded-md text-xs font-bold ${
              activeGen === g.gen
                ? 'bg-ink text-bg-950'
                : 'glass hover:bg-white/[0.08] text-ink-soft'
            }`}
          >
            Gen {g.gen}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto flex-1 min-w-[140px] max-w-[200px]">
          <SearchIcon className="w-4 h-4 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar #ID"
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-ink-faint"
          />
        </div>
      </div>

      {/* Grid de Pokémon */}
      <div className="card-base p-3">
        <div className="text-xs text-ink-dim mb-2">
          {range.label} · click = tenido · shift+click = shiny
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-12 gap-1.5">
          {filteredIds.map((id) => {
            const entry = entryMap.get(id);
            const owned = entry?.owned ?? false;
            const shiny = entry?.shiny ?? false;
            return (
              <button
                key={id}
                onClick={(e) => toggle(id, e.shiftKey)}
                className={`relative aspect-square rounded-md flex items-center justify-center transition-all ${
                  shiny
                    ? 'bg-accent-yellow/15 ring-2 ring-accent-yellow'
                    : owned
                    ? 'bg-accent-green/15 ring-1 ring-accent-green/40'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] opacity-60 hover:opacity-100'
                }`}
                title={`#${String(id).padStart(4, '0')}${
                  shiny ? ' · ✨ shiny' : owned ? ' · tenido' : ' · no tenido'
                }`}
              >
                <img
                  src={spriteFor(id)}
                  alt={`#${id}`}
                  className={`w-full h-full object-contain transition-all ${
                    owned ? '' : 'grayscale brightness-50'
                  } [image-rendering:pixelated]`}
                  loading="lazy"
                />
                {shiny && (
                  <SparklesIcon className="absolute top-0 right-0 w-3 h-3 text-accent-yellow" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-ink-faint text-center">
        Los datos se guardan automáticamente en la nube. Vuelve cuando quieras
        para seguir marcando.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  unit,
  tone,
}: {
  label: string;
  value: number;
  total?: number;
  unit?: string;
  tone: string;
}) {
  return (
    <div className="card-base p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
        {label}
      </div>
      <div className={`font-display text-2xl font-bold mt-1 tabular-nums ${tone}`}>
        {value}
        {unit && <span className="text-base">{unit}</span>}
        {total && (
          <span className="text-sm text-ink-faint font-normal"> / {total}</span>
        )}
      </div>
    </div>
  );
}
