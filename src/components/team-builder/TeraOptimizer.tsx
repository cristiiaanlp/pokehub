'use client';

import { useMemo, useState } from 'react';
import { useTeamStore } from '@/stores/teamStore';
import {
  optimizeTera,
  type TeraSuggestion,
} from '@/lib/team-analysis/tera-optimizer';
import { artworkFor } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { SparklesIcon, TargetIcon } from '@/components/ui/Icon';
import type { TeamMember } from '@/types/pokemon';

export function TeraOptimizer() {
  const team = useTeamStore((s) => s.current);
  const members = team.filter(Boolean) as TeamMember[];
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const suggestions: TeraSuggestion[] = useMemo(
    () =>
      optimizeTera(
        members.map((m) => ({
          pokemonId: m.pokemonId,
          name: m.name,
          types: m.types,
        })),
        3
      ),
    [members]
  );

  if (members.length < 2) {
    return null; // No vale la pena optimizar tera con <2 miembros
  }

  return (
    <div className="card-base p-5 space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-400" />
          Tera Type Optimizer
        </h3>
        <p className="text-xs text-ink-dim mt-1">
          Sugerencia automática del Tera type óptimo por miembro. Prioriza
          tapar debilidades comunes del equipo y ganar resistencias clave. Tu
          tera reemplaza tu typing defensivo en partida.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((s) => {
          const isExpanded = expandedId === s.pokemonId;
          const top = s.candidates[0];
          return (
            <div
              key={s.pokemonId}
              className="card-base p-3 sm:p-4 border-white/[0.06]"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <img
                  src={artworkFor(s.pokemonId)}
                  alt={s.name}
                  className="w-12 h-12 object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-sm truncate">
                    {s.name}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {s.currentTypes.map((t) => (
                      <TypeBadge key={t} type={t} size="xs" />
                    ))}
                  </div>
                </div>
              </div>

              {top ? (
                <>
                  <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1.5">
                    Mejor Tera
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <TypeBadge type={top.type} size="md" />
                    <span className="text-xs text-purple-300 font-mono">
                      score {top.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1">
                    {top.newImmunes.length > 0 && (
                      <div>
                        <span className="text-brand-glow font-bold">
                          +Inmune:
                        </span>{' '}
                        <span className="text-ink-soft">
                          {top.newImmunes.join(', ')}
                        </span>
                      </div>
                    )}
                    {top.newResists.length > 0 && (
                      <div>
                        <span className="text-accent-green font-bold">
                          +Resiste:
                        </span>{' '}
                        <span className="text-ink-soft">
                          {top.newResists.slice(0, 5).join(', ')}
                          {top.newResists.length > 5
                            ? ` (+${top.newResists.length - 5})`
                            : ''}
                        </span>
                      </div>
                    )}
                    {top.newWeaknesses.length > 0 && (
                      <div>
                        <span className="text-accent-red font-bold">
                          −Débil:
                        </span>{' '}
                        <span className="text-ink-soft">
                          {top.newWeaknesses.join(', ')}
                        </span>
                      </div>
                    )}
                    {top.teamCoverGain > 0 && (
                      <div className="pt-1 inline-flex items-center gap-1 text-purple-300">
                        <TargetIcon className="w-3 h-3" />
                        Cubre debilidades del equipo (+{top.teamCoverGain})
                      </div>
                    )}
                  </div>

                  {s.candidates.length > 1 && (
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : s.pokemonId)
                      }
                      className="mt-2.5 text-[10px] text-ink-faint hover:text-ink underline w-full text-left"
                    >
                      {isExpanded
                        ? 'Ocultar alternativas'
                        : `Ver alternativas (${s.candidates.length - 1})`}
                    </button>
                  )}

                  {isExpanded && s.candidates.length > 1 && (
                    <div className="mt-2 space-y-2 pt-2 border-t border-white/[0.06]">
                      {s.candidates.slice(1).map((alt) => (
                        <div key={alt.type} className="text-[10px]">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <TypeBadge type={alt.type} size="xs" />
                            <span className="text-ink-faint font-mono">
                              score {alt.score.toFixed(1)}
                            </span>
                          </div>
                          {alt.newImmunes.length + alt.newResists.length > 0 && (
                            <div className="text-ink-dim">
                              +{[...alt.newImmunes, ...alt.newResists].slice(0, 3).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[11px] text-ink-faint italic">
                  Ningún Tera mejora la defensiva — su typing actual ya es
                  óptimo para este equipo.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-ink-faint">
        El optimizer evalúa los 18 tipos como Tera candidato y rankea por
        ganancia neta de resistencias + cobertura de debilidades del equipo.
        Es una sugerencia defensiva — para decisiones competitivas considera
        también el rol ofensivo (STAB bonus tras Tera).
      </p>
    </div>
  );
}
