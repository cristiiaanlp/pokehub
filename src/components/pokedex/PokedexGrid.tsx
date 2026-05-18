'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { SearchIcon, FilterIcon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { PokemonCard } from './PokemonCard';
import { TypeFilter } from './TypeFilter';
import {
  getPokedexIndex,
  hydrateTypesForIds,
} from '@/lib/pokeapi';
import type { PokemonListItem, PokemonType } from '@/types/pokemon';

const PAGE_SIZE = 60;

export function PokedexGrid() {
  const [all, setAll] = useState<PokemonListItem[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    getPokedexIndex().then((idx) => {
      if (cancelled) return;
      setAll([...idx]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hydrate types as visible window grows
  useEffect(() => {
    if (all.length === 0) return;
    const needed = all
      .slice(0, Math.min(visible + 10, all.length))
      .filter((p) => p.types.length === 0)
      .map((p) => p.id);
    if (needed.length === 0) return;
    hydrateTypesForIds(needed).then(() => {
      // trigger re-render with latest types from in-memory index
      getPokedexIndex().then((idx) => setAll([...idx]));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, all.length]);

  // Filter
  const filtered = useMemo(() => {
    let out = all;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (/^\d+$/.test(q)) {
        out = out.filter((p) => String(p.id).includes(q));
      } else {
        out = out.filter((p) => p.name.includes(q));
      }
    }
    if (typeFilter) {
      out = out.filter((p) => p.types.includes(typeFilter));
    }
    return out;
  }, [all, query, typeFilter]);

  const shown = filtered.slice(0, visible);

  // Hydrate types of filtered visible specifically (in case user is filtering past hydrated set)
  useEffect(() => {
    const ids = shown.filter((p) => p.types.length === 0).map((p) => p.id);
    if (ids.length > 0) {
      hydrateTypesForIds(ids).then(() =>
        getPokedexIndex().then((idx) => setAll([...idx]))
      );
    }
  }, [shown]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  // Reset visible on filter/query change
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, typeFilter]);

  const loading = all.length === 0;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o número..."
            leftIcon={<SearchIcon className="w-4 h-4" />}
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="h-11 px-4 inline-flex items-center gap-2 rounded-xl glass hover:bg-white/[0.06] text-sm font-medium text-ink-soft hover:text-ink"
          >
            <FilterIcon className="w-4 h-4" />
            Filtros
            {typeFilter && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-brand" />
            )}
          </button>
        </div>
        {showFilters && (
          <div className="card-base p-4 animate-fade-in">
            <div className="text-xs uppercase tracking-widest text-ink-faint font-semibold mb-2">
              Tipo
            </div>
            <TypeFilter value={typeFilter} onChange={setTypeFilter} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-sm text-ink-dim">
          {loading
            ? 'Cargando Pokédex…'
            : `${filtered.length.toLocaleString()} Pokémon`}
        </div>
        {(query || typeFilter) && (
          <button
            onClick={() => {
              setQuery('');
              setTypeFilter(null);
            }}
            className="text-xs text-brand-glow hover:text-brand-hover font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {shown.map((p, i) => (
              <PokemonCard key={p.id} p={p} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-ink-dim">
              <div className="text-4xl mb-3">🔍</div>
              No se han encontrado Pokémon que coincidan.
            </div>
          )}
          {visible < filtered.length && (
            <div ref={loadMoreRef} className="py-10 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
