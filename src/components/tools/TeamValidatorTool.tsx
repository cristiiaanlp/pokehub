'use client';

import { useMemo, useState } from 'react';
import { useTeamStore } from '@/stores/teamStore';
import { FORMATS } from '@/lib/formats';
import { validateTeam } from '@/lib/team-validator';
import { artworkFor } from '@/lib/pokeapi';
import { CheckIcon, XIcon } from '@/components/ui/Icon';

export function TeamValidatorTool() {
  const saved = useTeamStore((s) => s.saved);
  const [teamId, setTeamId] = useState<string>(saved[0]?.id ?? '');
  const [formatId, setFormatId] = useState<string>('vgc-reg-g');

  const team = useMemo(() => saved.find((t) => t.id === teamId), [saved, teamId]);
  const format = FORMATS.find((f) => f.id === formatId)!;

  const result = useMemo(
    () => (team ? validateTeam(team, formatId) : null),
    [team, formatId]
  );

  return (
    <div className="space-y-5">
      {/* Selección */}
      <div className="card-base p-4 grid sm:grid-cols-2 gap-3">
        <label className="text-xs">
          <span className="text-ink-dim">Equipo guardado</span>
          {saved.length === 0 ? (
            <div className="mt-1 p-3 rounded-lg bg-accent-yellow/10 border border-accent-yellow/30 text-xs text-accent-yellow">
              No tienes equipos guardados. Crea uno primero en{' '}
              <a href="/team-builder" className="underline">
                Team Builder
              </a>
              .
            </div>
          ) : (
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
            >
              {saved.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.members.length} Pokémon)
                </option>
              ))}
            </select>
          )}
        </label>
        <label className="text-xs">
          <span className="text-ink-dim">Formato</span>
          <select
            value={formatId}
            onChange={(e) => setFormatId(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
          >
            {FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-ink-faint mt-1 block">
            {format.description}
          </span>
        </label>
      </div>

      {team && result && (
        <>
          {/* Veredicto */}
          <div
            className={`card-base p-5 border ${
              result.ok
                ? 'border-accent-green/30 bg-accent-green/[0.05]'
                : 'border-accent-red/30 bg-accent-red/[0.05]'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {result.ok ? (
                <span className="w-10 h-10 rounded-full bg-accent-green/20 text-accent-green inline-flex items-center justify-center">
                  <CheckIcon className="w-5 h-5" />
                </span>
              ) : (
                <span className="w-10 h-10 rounded-full bg-accent-red/20 text-accent-red inline-flex items-center justify-center">
                  <XIcon className="w-5 h-5" />
                </span>
              )}
              <div>
                <div className="font-display text-xl font-bold">
                  {result.ok ? 'Equipo legal ✓' : 'Equipo NO legal'}
                </div>
                <div className="text-xs text-ink-dim">
                  {result.errors.length} errores · {result.warnings.length} avisos
                </div>
              </div>
            </div>
            {result.ok && result.warnings.length === 0 && (
              <p className="text-sm text-ink-soft mt-2">
                Listo para jugar en {format.name}. Todos los Pokémon, items,
                habilidades y movesets son válidos.
              </p>
            )}
          </div>

          {/* Errores */}
          {result.errors.length > 0 && (
            <div className="card-base p-4 space-y-2">
              <h3 className="font-display font-bold text-sm flex items-center gap-2 text-accent-red">
                <XIcon className="w-4 h-4" />
                Errores ({result.errors.length})
              </h3>
              <ul className="space-y-1.5">
                {result.errors.map((v, i) => (
                  <li
                    key={i}
                    className="text-sm text-accent-red flex gap-2 p-2 rounded bg-accent-red/[0.04]"
                  >
                    <span className="shrink-0 mt-0.5">⛔</span>
                    <span>{v.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="card-base p-4 space-y-2">
              <h3 className="font-display font-bold text-sm flex items-center gap-2 text-accent-yellow">
                ⚠ Avisos ({result.warnings.length})
              </h3>
              <ul className="space-y-1.5">
                {result.warnings.map((v, i) => (
                  <li
                    key={i}
                    className="text-sm text-accent-yellow flex gap-2 p-2 rounded bg-accent-yellow/[0.04]"
                  >
                    <span className="shrink-0 mt-0.5">!</span>
                    <span>{v.message}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-ink-faint pt-2">
                Los avisos no bloquean la legalidad, pero podrían afectar el
                rendimiento en partida.
              </p>
            </div>
          )}

          {/* Snapshot del equipo */}
          <div className="card-base p-4">
            <h3 className="font-display font-bold text-sm mb-3">
              Equipo evaluado: {team.name}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {team.members.map((m, idx) => {
                const memberErrors = result.errors.filter((e) => e.memberIndex === idx);
                const memberWarnings = result.warnings.filter(
                  (e) => e.memberIndex === idx
                );
                const hasIssue = memberErrors.length > 0 || memberWarnings.length > 0;
                return (
                  <div
                    key={`${m.pokemonId}-${idx}`}
                    className={`p-2 rounded-xl text-center ${
                      memberErrors.length > 0
                        ? 'bg-accent-red/[0.08] border border-accent-red/30'
                        : memberWarnings.length > 0
                        ? 'bg-accent-yellow/[0.06] border border-accent-yellow/20'
                        : 'bg-white/[0.02] border border-white/[0.04]'
                    }`}
                  >
                    <img
                      src={artworkFor(m.pokemonId)}
                      alt={m.name}
                      className="w-14 h-14 mx-auto object-contain"
                    />
                    <div className="text-xs font-semibold truncate mt-1">
                      {m.name}
                    </div>
                    {hasIssue && (
                      <div className="text-[9px] text-ink-faint mt-0.5">
                        {memberErrors.length > 0 && (
                          <span className="text-accent-red">
                            {memberErrors.length} err
                          </span>
                        )}
                        {memberErrors.length > 0 && memberWarnings.length > 0 && ' · '}
                        {memberWarnings.length > 0 && (
                          <span className="text-accent-yellow">
                            {memberWarnings.length} ⚠
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
