'use client';

import { motion } from 'framer-motion';
import { useTeamStore } from '@/stores/teamStore';
import { ALL_TYPES, effectivenessAgainst } from '@/lib/type-effectiveness';
import { TypeBadge, TYPE_HEX } from '@/components/ui/TypeBadge';
import { artworkFor } from '@/lib/pokeapi';
import { formatPokemonName } from '@/lib/utils';
import type { TeamMember } from '@/types/pokemon';
import { ChartIcon } from '@/components/ui/Icon';

/**
 * Defensive heatmap: 6 rows (team members) × 18 cols (incoming attack types).
 * Each cell shows the damage multiplier in color: green = resist, red = weak,
 * dark = immune. Hover/tap surfaces the exact multiplier.
 */
export function TeamHeatmap() {
  const team = useTeamStore((s) => s.current);
  const members = team.filter(Boolean) as TeamMember[];

  if (members.length === 0) {
    return null;
  }

  // For each member compute defensive profile
  const rows = members.map((m) => ({
    member: m,
    cells: effectivenessAgainst(m.types),
  }));

  // Column sums: how many members are weak/resist to each attack type
  const colSums = ALL_TYPES.map((atk) => {
    let weak = 0;
    let resist = 0;
    let immune = 0;
    for (const r of rows) {
      const mult = r.cells.find((c) => c.type === atk)?.multiplier ?? 1;
      if (mult === 0) immune++;
      else if (mult >= 2) weak++;
      else if (mult < 1) resist++;
    }
    return { atk, weak, resist, immune };
  });

  // Worst columns (most weakness across team)
  const worst = colSums
    .filter((c) => c.weak > c.resist + c.immune && c.weak >= 2)
    .sort((a, b) => b.weak - a.weak);

  return (
    <div className="card-base p-5 space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-brand-glow" />
          Heatmap defensivo del equipo
        </h3>
        <p className="text-xs text-ink-dim mt-1">
          Cada fila es un miembro de tu equipo. Cada columna es un tipo
          atacante. El color indica qué pasa cuando el tipo X golpea al
          Pokémon Y.
        </p>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="inline-block min-w-full">
          <div
            className="grid gap-0.5"
            style={{
              gridTemplateColumns: `auto repeat(${ALL_TYPES.length}, minmax(28px, 1fr))`,
            }}
          >
            {/* Header row */}
            <div />
            {ALL_TYPES.map((t) => (
              <div
                key={t}
                className="flex items-center justify-center pb-1"
                title={t}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold uppercase"
                  style={{
                    background: TYPE_HEX(t),
                    color: ['electric', 'ground', 'ice', 'steel', 'flying'].includes(
                      t
                    )
                      ? '#0B0F17'
                      : '#fff',
                  }}
                >
                  {t.slice(0, 2)}
                </div>
              </div>
            ))}

            {/* Member rows */}
            {rows.map((r, ri) => (
              <FragmentRow key={r.member.pokemonId} row={r} rowIndex={ri} />
            ))}

            {/* Footer: column totals */}
            <div className="text-right text-[9px] uppercase tracking-widest text-ink-faint font-bold pr-2 pt-2 self-center">
              total ↓
            </div>
            {colSums.map((c) => (
              <div
                key={c.atk}
                className="flex flex-col items-center justify-center pt-2"
                title={`Débiles: ${c.weak} · Resisten: ${c.resist} · Inmunes: ${c.immune}`}
              >
                <div
                  className={`text-[10px] font-mono font-bold ${
                    c.weak >= 3
                      ? 'text-accent-red'
                      : c.weak >= 2
                      ? 'text-accent-yellow'
                      : 'text-ink-dim'
                  }`}
                >
                  {c.weak}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-dim pt-2 border-t border-white/[0.05]">
        <span>Leyenda:</span>
        <Cell color={getCellColor(4)} label="4× (cuádruple)" />
        <Cell color={getCellColor(2)} label="2× débil" />
        <Cell color={getCellColor(1)} label="1× neutro" />
        <Cell color={getCellColor(0.5)} label="0,5× resiste" />
        <Cell color={getCellColor(0.25)} label="0,25× resiste" />
        <Cell color={getCellColor(0)} label="inmune" />
      </div>

      {/* Worst columns insight */}
      {worst.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-accent-red/10 border border-accent-red/20 p-3"
        >
          <div className="text-[10px] uppercase tracking-widest text-accent-red font-bold mb-1.5">
            ⚠ Vulnerabilidad colectiva
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
            <span>Tu equipo es débil a</span>
            {worst.slice(0, 4).map((c) => (
              <span key={c.atk} className="inline-flex items-center gap-1">
                <TypeBadge type={c.atk} size="xs" />
                <span className="font-mono text-accent-red font-bold">
                  ({c.weak}/{rows.length})
                </span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FragmentRow({
  row,
  rowIndex,
}: {
  row: { member: TeamMember; cells: { type: string; multiplier: number }[] };
  rowIndex: number;
}) {
  return (
    <>
      <div className="flex items-center gap-2 pr-2 py-0.5">
        <img
          src={artworkFor(row.member.pokemonId)}
          alt={row.member.name}
          className="w-7 h-7 object-contain shrink-0"
          loading="lazy"
        />
        <span className="text-[11px] font-semibold text-ink-soft truncate hidden sm:inline-block max-w-[100px]">
          {formatPokemonName(row.member.name)}
        </span>
      </div>
      {ALL_TYPES.map((atk) => {
        const cell = row.cells.find((c) => c.type === atk);
        const m = cell?.multiplier ?? 1;
        return (
          <motion.div
            key={atk}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(rowIndex * 0.03, 0.3) }}
            className="aspect-square min-h-[28px] rounded flex items-center justify-center text-[9px] font-mono font-bold cursor-help"
            style={{
              background: getCellColor(m),
              color: m >= 2 || m === 0 ? '#fff' : '#0B0F17',
            }}
            title={`${row.member.name} vs ${atk}: ${m}×`}
          >
            {m === 0 ? '0' : m === 1 ? '' : m % 1 === 0 ? m : m.toString().replace('0.', '.')}
          </motion.div>
        );
      })}
    </>
  );
}

function getCellColor(m: number): string {
  if (m === 0) return '#1F2937'; // immune — dark
  if (m === 0.25) return '#065F46'; // strong resist
  if (m === 0.5) return '#10B981'; // resist
  if (m === 1) return '#374151'; // neutral
  if (m === 2) return '#EF4444'; // weak
  if (m === 4) return '#991B1B'; // 4× weak (deep red)
  return '#374151';
}

function Cell({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded"
        style={{ background: color }}
      />
      <span>{label}</span>
    </span>
  );
}
