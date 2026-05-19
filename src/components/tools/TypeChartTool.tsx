'use client';

import { useMemo, useState } from 'react';
import { ALL_TYPES, TYPE_CHART } from '@/lib/type-effectiveness';
import { TypeBadge } from '@/components/ui/TypeBadge';
import type { PokemonType } from '@/types/pokemon';

function getMultiplier(atk: PokemonType, def: PokemonType): number {
  return TYPE_CHART[atk]?.[def] ?? 1;
}

function bgFor(mult: number): string {
  if (mult === 0) return 'bg-bg-900 text-ink-faint';
  if (mult === 0.5) return 'bg-accent-red/15 text-accent-red';
  if (mult === 2) return 'bg-accent-green/20 text-accent-green';
  return 'bg-white/[0.02] text-ink-dim';
}

function labelFor(mult: number): string {
  if (mult === 0) return '0';
  if (mult === 0.5) return '½';
  if (mult === 2) return '2';
  if (mult === 0.25) return '¼';
  if (mult === 4) return '4';
  return '1';
}

export function TypeChartTool() {
  const [pinnedRow, setPinnedRow] = useState<PokemonType | null>(null);
  const [pinnedCol, setPinnedCol] = useState<PokemonType | null>(null);

  // Resumen del tipo seleccionado
  const summary = useMemo(() => {
    if (!pinnedRow && !pinnedCol) return null;
    if (pinnedRow) {
      const superEffective: PokemonType[] = [];
      const notVery: PokemonType[] = [];
      const immune: PokemonType[] = [];
      for (const def of ALL_TYPES) {
        const m = getMultiplier(pinnedRow, def);
        if (m === 2) superEffective.push(def);
        else if (m === 0.5) notVery.push(def);
        else if (m === 0) immune.push(def);
      }
      return {
        mode: 'atk' as const,
        type: pinnedRow,
        superEffective,
        notVery,
        immune,
      };
    }
    // Defensive: como me ataca cada tipo
    const weak: PokemonType[] = [];
    const resist: PokemonType[] = [];
    const immune: PokemonType[] = [];
    for (const atk of ALL_TYPES) {
      const m = getMultiplier(atk, pinnedCol!);
      if (m === 2) weak.push(atk);
      else if (m === 0.5) resist.push(atk);
      else if (m === 0) immune.push(atk);
    }
    return {
      mode: 'def' as const,
      type: pinnedCol!,
      weak,
      resist,
      immune,
    };
  }, [pinnedRow, pinnedCol]);

  const clearFilters = () => {
    setPinnedRow(null);
    setPinnedCol(null);
  };

  return (
    <div className="space-y-5">
      {/* Leyenda */}
      <div className="card-base p-3 flex items-center gap-4 flex-wrap text-xs">
        <span className="text-ink-faint font-mono">Leyenda:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-accent-green/20 inline-block" />
          ×2 Supereficaz
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-accent-red/15 inline-block" />
          ×½ Poco eficaz
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-bg-900 inline-block" />
          ×0 Inmune
        </span>
        {(pinnedRow || pinnedCol) && (
          <button
            onClick={clearFilters}
            className="ml-auto text-brand-glow hover:text-brand-hover"
          >
            Limpiar selección
          </button>
        )}
      </div>

      {/* Resumen del tipo seleccionado */}
      {summary && (
        <div className="card-base p-5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={summary.type} size="md" />
            <span className="text-sm text-ink-dim">
              {summary.mode === 'atk'
                ? 'atacando a otros tipos'
                : 'siendo atacado por otros tipos'}
            </span>
          </div>
          {summary.mode === 'atk' ? (
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <SummarySection
                title="Supereficaz contra (×2)"
                tone="text-accent-green"
                types={summary.superEffective}
              />
              <SummarySection
                title="Poco eficaz contra (×½)"
                tone="text-accent-red"
                types={summary.notVery}
              />
              <SummarySection
                title="No afecta (×0)"
                tone="text-ink-faint"
                types={summary.immune}
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <SummarySection
                title="Débil contra (×2)"
                tone="text-accent-red"
                types={summary.weak}
              />
              <SummarySection
                title="Resiste (×½)"
                tone="text-accent-green"
                types={summary.resist}
              />
              <SummarySection
                title="Inmune (×0)"
                tone="text-ink-faint"
                types={summary.immune}
              />
            </div>
          )}
        </div>
      )}

      {/* La tabla */}
      <div className="card-base p-3 overflow-x-auto">
        <table className="border-separate border-spacing-1 text-[10px] font-mono">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-bg-950 p-1 text-right text-ink-faint font-normal">
                ATK ↓ / DEF →
              </th>
              {ALL_TYPES.map((def) => (
                <th
                  key={def}
                  className="p-0 align-bottom"
                  onClick={() =>
                    setPinnedCol((c) => (c === def ? null : def))
                  }
                >
                  <button className="block hover:scale-110 transition-transform">
                    <TypeBadge type={def} size="xs" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_TYPES.map((atk) => (
              <tr key={atk}>
                <th
                  className="sticky left-0 z-10 bg-bg-950 p-0 pr-1 text-right"
                  onClick={() =>
                    setPinnedRow((r) => (r === atk ? null : atk))
                  }
                >
                  <button className="hover:scale-110 transition-transform">
                    <TypeBadge type={atk} size="xs" />
                  </button>
                </th>
                {ALL_TYPES.map((def) => {
                  const m = getMultiplier(atk, def);
                  const isHighlighted =
                    (pinnedRow === atk && !pinnedCol) ||
                    (pinnedCol === def && !pinnedRow) ||
                    (pinnedRow === atk && pinnedCol === def);
                  const isDimmed =
                    (pinnedRow && pinnedRow !== atk) ||
                    (pinnedCol && pinnedCol !== def);
                  return (
                    <td
                      key={`${atk}-${def}`}
                      className={`w-9 h-9 text-center rounded font-bold ${bgFor(
                        m
                      )} ${isHighlighted ? 'ring-2 ring-brand-glow' : ''} ${
                        isDimmed ? 'opacity-25' : ''
                      } transition-opacity`}
                      title={`${atk} → ${def}: ×${m}`}
                    >
                      {labelFor(m)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-faint text-center">
        Datos: Gen 9 (Hada incluido). Click en cualquier tipo para filtrar fila o columna.
      </p>
    </div>
  );
}

function SummarySection({
  title,
  types,
  tone,
}: {
  title: string;
  types: PokemonType[];
  tone: string;
}) {
  return (
    <div>
      <div className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${tone}`}>
        {title} ({types.length})
      </div>
      <div className="flex flex-wrap gap-1">
        {types.length === 0 ? (
          <span className="text-ink-faint text-xs italic">—</span>
        ) : (
          types.map((t) => <TypeBadge key={t} type={t} size="xs" />)
        )}
      </div>
    </div>
  );
}
