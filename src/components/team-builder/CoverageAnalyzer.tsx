'use client';

import { useMemo } from 'react';
import { useTeamStore } from '@/stores/teamStore';
import { analyzeCoverage } from '@/lib/team-analysis/coverage';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { artworkFor } from '@/lib/pokeapi';
import { TargetIcon } from '@/components/ui/Icon';
import type { TeamMember } from '@/types/pokemon';

export function CoverageAnalyzer() {
  const team = useTeamStore((s) => s.current);
  const members = team.filter(Boolean) as TeamMember[];

  const holes = useMemo(
    () =>
      analyzeCoverage(
        members.map((m) => ({
          pokemonId: m.pokemonId,
          name: m.name,
          types: m.types,
        }))
      ),
    [members]
  );

  if (members.length < 2) return null;

  // Separamos por severidad
  const critical = holes.filter((h) => h.bestMultiplier === 0); // inmunes
  const bad = holes.filter((h) => h.bestMultiplier === 0.25 || h.bestMultiplier === 0.5);
  const neutral = holes.filter((h) => h.bestMultiplier === 1);

  return (
    <div className="card-base p-5 space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <TargetIcon className="w-5 h-5 text-accent-red" />
          Coverage Analyzer
        </h3>
        <p className="text-xs text-ink-dim mt-1">
          Tipos defensivos que tu equipo NO puede hittear super-efectivo con
          STAB. Son los "agujeros ofensivos" — busca cubrirlos con cobertura
          (moves no-STAB) o cambiar un miembro.
        </p>
      </div>

      {holes.length === 0 ? (
        <div className="card-base p-4 bg-accent-green/[0.05] border-accent-green/30 text-center">
          <div className="font-display font-bold text-accent-green">
            Cobertura ofensiva perfecta ✓
          </div>
          <p className="text-xs text-ink-dim mt-1">
            Tu equipo puede pegar super-efectivo a cualquier tipo del meta.
          </p>
        </div>
      ) : (
        <>
          {critical.length > 0 && (
            <CoverageSection
              title="🚨 Inmunidad total (×0)"
              tone="text-accent-red"
              holes={critical}
              note="Estos tipos son INMUNES a todo tu STAB. Necesitas cobertura urgente."
            />
          )}
          {bad.length > 0 && (
            <CoverageSection
              title="⚠️ Resistido (×½ o menos)"
              tone="text-accent-yellow"
              holes={bad}
              note="Tu mejor STAB hace menos del 50% de daño. Considera cobertura."
            />
          )}
          {neutral.length > 0 && (
            <CoverageSection
              title="Neutral (×1)"
              tone="text-ink-dim"
              holes={neutral.slice(0, 10)}
              note="Sin super-efectivo. Para 6v6 importa, en doubles menos."
            />
          )}
        </>
      )}

      <p className="text-[10px] text-ink-faint pt-2 border-t border-white/[0.05]">
        Esta análisis considera SOLO los STABs (ataques del tipo de tu Pokémon).
        Si llevas coverage moves (ej. Ice Beam en un Water), tu cobertura real
        es mejor.
      </p>
    </div>
  );
}

function CoverageSection({
  title,
  tone,
  holes,
  note,
}: {
  title: string;
  tone: string;
  holes: Array<{
    types: any[];
    bestMultiplier: number;
    bestAttacker?: { pokemonId: number; name: string; type: any };
  }>;
  note: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`text-xs font-bold uppercase tracking-widest ${tone}`}>
        {title} ({holes.length})
      </div>
      <p className="text-[11px] text-ink-dim">{note}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {holes.map((h, i) => (
          <div
            key={i}
            className="card-base p-2.5 flex items-center gap-2.5 bg-white/[0.02]"
          >
            <div className="flex items-center gap-1 shrink-0">
              {h.types.map((t) => (
                <TypeBadge key={t} type={t} size="xs" />
              ))}
            </div>
            <div className="flex-1 min-w-0 text-[11px]">
              <span className="text-ink-dim">Mejor: </span>
              <span className="font-mono font-bold tabular-nums">
                {h.bestMultiplier}×
              </span>
              {h.bestAttacker && (
                <>
                  <span className="text-ink-faint"> con </span>
                  <span className="capitalize">{h.bestAttacker.name}</span>
                </>
              )}
            </div>
            {h.bestAttacker && (
              <img
                src={artworkFor(h.bestAttacker.pokemonId)}
                alt=""
                className="w-7 h-7 object-contain shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
