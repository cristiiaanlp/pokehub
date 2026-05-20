'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { SearchIcon, FilterIcon } from '@/components/ui/Icon';
import type { ItemSlim } from '@/lib/pokeapi-database';

const PAGE_SIZE = 60;

// Categorías más relevantes para competitivo + Pokémart
const POPULAR_CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'held-items', label: 'Held items' },
  { id: 'choice', label: 'Choice (BST)' },
  { id: 'type-enhancement', label: 'Plates / Type boost' },
  { id: 'berries', label: 'Berries' },
  { id: 'medicine', label: 'Medicina' },
  { id: 'evolution', label: 'Evolución' },
  { id: 'mega-stones', label: 'Mega Stones' },
];

export function ItemsDatabase({ items }: { items: ItemSlim[] }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Las categorías de PokéAPI son específicas; mapeamos algunos grupos
  const matchesCategory = (item: ItemSlim, cat: string): boolean => {
    if (cat === 'all') return true;
    if (cat === 'choice') return /choice/i.test(item.name);
    if (cat === 'type-enhancement')
      return /plate|gem|incense|silk-scarf|charcoal|magnet|nevermeltice|sharp-beak|poison-barb|soft-sand|hard-stone|silver-powder|spell-tag|twistedspoon|metal-coat|miracle-seed|mystic-water|black-belt|black-glasses|dragon-fang/i.test(
        item.name
      );
    if (cat === 'mega-stones') return /-ite$/i.test(item.name);
    return item.category === cat;
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      if (!matchesCategory(it, category)) return false;
      if (query) {
        const hay = `${it.name} ${it.displayName} ${it.shortEffect}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [items, q, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-4">
      <div className="card-base p-3 space-y-3">
        <div className="flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre o efecto… (ej: Leftovers, Choice, Berry)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
          />
          {q && (
            <button onClick={() => setQ('')} className="text-xs text-ink-faint hover:text-ink">
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <FilterIcon className="w-4 h-4 text-ink-faint shrink-0" />
          {POPULAR_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                setPage(1);
              }}
              className={`h-7 px-2.5 rounded-md font-bold ${
                category === c.id
                  ? 'bg-ink text-bg-950'
                  : 'glass text-ink-soft hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="ml-auto text-ink-faint tabular-nums">
            {filtered.length} / {items.length}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {pageItems.length === 0 ? (
          <div className="card-base p-8 text-center text-sm text-ink-dim sm:col-span-3">
            Ningún item coincide con los filtros.
          </div>
        ) : (
          pageItems.map((it) => (
            <Link
              key={it.id}
              href={`/database/items/${it.name}`}
              className="card-base card-hover p-3 flex items-start gap-3"
            >
              {it.sprite ? (
                <img
                  src={it.sprite}
                  alt={it.displayName}
                  className="w-10 h-10 object-contain shrink-0 [image-rendering:pixelated]"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-white/[0.04] shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-display font-bold text-sm truncate">
                    {it.displayName}
                  </span>
                  {it.cost !== null && (
                    <span className="text-[9px] font-mono text-ink-faint">
                      ¥{it.cost}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-dim line-clamp-2 leading-relaxed mt-0.5">
                  {it.shortEffect || 'Sin descripción.'}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-9 px-3 rounded-md glass hover:bg-white/[0.08] disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="text-ink-dim tabular-nums px-3">
            Página {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-9 px-3 rounded-md glass hover:bg-white/[0.08] disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
