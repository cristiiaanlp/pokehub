'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { SearchIcon, XIcon, FilterIcon } from '@/components/ui/Icon';
import { ALL_TYPES } from '@/lib/type-effectiveness';
import type { PokemonType } from '@/types/pokemon';
import type { MoveSlim } from '@/lib/pokeapi-database';

const CATEGORIES: Array<{ id: 'all' | 'physical' | 'special' | 'status'; label: string }> = [
  { id: 'all', label: 'Todo' },
  { id: 'physical', label: 'Físico' },
  { id: 'special', label: 'Especial' },
  { id: 'status', label: 'Estado' },
];

const PAGE_SIZE = 60;

export function MovesDatabase({ moves }: { moves: MoveSlim[] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState<PokemonType | 'all'>('all');
  const [category, setCategory] = useState<'all' | 'physical' | 'special' | 'status'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return moves.filter((m) => {
      if (type !== 'all' && m.type !== type) return false;
      if (category !== 'all' && m.damageClass !== category) return false;
      if (query) {
        const hay = `${m.name} ${m.displayName}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [moves, q, type, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageMoves = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearFilters = () => {
    setQ('');
    setType('all');
    setCategory('all');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="card-base p-4 space-y-3">
        <div className="flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre… (ej: Earthquake, Thunder, Surf)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
          />
          {(q || type !== 'all' || category !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-xs text-ink-faint hover:text-ink"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <FilterIcon className="w-4 h-4 text-ink-faint shrink-0" />
          <span className="text-ink-faint font-mono">Tipo:</span>
          <button
            onClick={() => {
              setType('all');
              setPage(1);
            }}
            className={`h-7 px-2.5 rounded-md font-bold ${
              type === 'all'
                ? 'bg-ink text-bg-950'
                : 'glass text-ink-soft hover:text-ink'
            }`}
          >
            Todos
          </button>
          {ALL_TYPES.map((tt) => (
            <button
              key={tt}
              onClick={() => {
                setType(tt);
                setPage(1);
              }}
              className={`transition-opacity ${
                type !== 'all' && type !== tt ? 'opacity-40' : ''
              }`}
            >
              <TypeBadge type={tt} size="xs" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-ink-faint font-mono">Categoría:</span>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                setPage(1);
              }}
              className={`h-7 px-3 rounded-md font-bold ${
                category === c.id
                  ? 'bg-ink text-bg-950'
                  : 'glass text-ink-soft hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="ml-auto text-ink-faint tabular-nums">
            {filtered.length} / {moves.length}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="card-base overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="text-[10px] uppercase tracking-widest text-ink-faint border-b border-white/[0.06]">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Cat</th>
              <th className="text-right p-3">BP</th>
              <th className="text-right p-3">Acc</th>
              <th className="text-right p-3">PP</th>
            </tr>
          </thead>
          <tbody>
            {pageMoves.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-ink-dim">
                  Ningún movimiento coincide con los filtros.
                </td>
              </tr>
            ) : (
              pageMoves.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="p-3">
                    <Link
                      href={`/database/moves/${m.name}`}
                      className="font-semibold hover:text-brand-glow"
                    >
                      {m.displayName}
                    </Link>
                  </td>
                  <td className="p-3">
                    <TypeBadge type={m.type} size="xs" />
                  </td>
                  <td className="p-3">
                    <CategoryPill cat={m.damageClass} />
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {m.power ?? '—'}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {m.accuracy != null ? `${m.accuracy}%` : '—'}
                  </td>
                  <td className="p-3 text-right font-mono tabular-nums">
                    {m.pp || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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

function CategoryPill({ cat }: { cat: 'physical' | 'special' | 'status' }) {
  const map = {
    physical: { label: 'Fís', cls: 'bg-accent-red/15 text-accent-red' },
    special: { label: 'Esp', cls: 'bg-brand/15 text-brand-glow' },
    status: { label: 'Est', cls: 'bg-ink-faint/15 text-ink-faint' },
  };
  const { label, cls } = map[cat];
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${cls}`}
    >
      {label}
    </span>
  );
}
