'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { SearchIcon } from '@/components/ui/Icon';
import type { AbilitySlim } from '@/lib/pokeapi-database';

const PAGE_SIZE = 50;

export function AbilitiesDatabase({ abilities }: { abilities: AbilitySlim[] }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return abilities;
    return abilities.filter((a) => {
      const hay = `${a.name} ${a.displayName} ${a.shortEffect}`.toLowerCase();
      return hay.includes(query);
    });
  }, [abilities, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageAbilities = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-4">
      <div className="card-base p-3 flex items-center gap-2">
        <SearchIcon className="w-4 h-4 text-ink-faint" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre o efecto… (ej: Intimidate, sandstorm, sleep)"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
        />
        {q && (
          <button onClick={() => setQ('')} className="text-xs text-ink-faint hover:text-ink">
            Limpiar
          </button>
        )}
        <span className="text-xs text-ink-faint tabular-nums shrink-0">
          {filtered.length} / {abilities.length}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {pageAbilities.length === 0 ? (
          <div className="card-base p-8 text-center text-sm text-ink-dim sm:col-span-2">
            Ninguna habilidad coincide con "{q}".
          </div>
        ) : (
          pageAbilities.map((a) => (
            <Link
              key={a.id}
              href={`/database/abilities/${a.name}`}
              className="card-base card-hover p-3"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display font-bold text-sm">
                  {a.displayName}
                </span>
                <span className="text-[10px] text-ink-faint font-mono">
                  #{a.id}
                </span>
              </div>
              <p className="text-xs text-ink-dim line-clamp-2 leading-relaxed">
                {a.shortEffect || 'Sin descripción.'}
              </p>
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
