'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTeamStore } from '@/stores/teamStore';
import { TypeBadge } from '@/components/ui/TypeBadge';
import {
  analyzeTeam,
  ROLE_LABELS,
  type TeamReport,
  type TeamInsight,
} from '@/lib/coach/quick-analysis';
import {
  BrainIcon,
  ShieldIcon,
  SwordIcon,
  TargetIcon,
  BoltIcon,
  ArrowRight,
  CheckIcon,
} from '@/components/ui/Icon';

export function QuickCoach() {
  const team = useTeamStore((s) => s.current);
  const saved = useTeamStore((s) => s.saved);
  const loadTeam = useTeamStore((s) => s.loadTeam);

  const [chosenSavedId, setChosenSavedId] = useState<string | null>(null);

  // Generamos el report del current team siempre (no es costoso, es deterministic)
  const report: TeamReport = useMemo(
    () => analyzeTeam(team.filter(Boolean) as any),
    [team]
  );

  const validCount = team.filter(Boolean).length;

  const loadSaved = (savedId: string) => {
    if (!savedId) return;
    setChosenSavedId(savedId);
    loadTeam(savedId);
  };

  if (validCount === 0) {
    return <EmptyState saved={saved} onLoad={loadSaved} />;
  }

  const scoreTone =
    report.overallScore >= 80
      ? 'text-accent-green'
      : report.overallScore >= 60
      ? 'text-accent-yellow'
      : 'text-accent-red';

  const scoreBadge =
    report.overallScore >= 80
      ? 'Equipo sólido'
      : report.overallScore >= 60
      ? 'Mejorable'
      : 'Necesita trabajo';

  return (
    <div className="space-y-6">
      {/* Saved team picker */}
      {saved.length > 0 && (
        <div className="card-base p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="text-xs text-ink-faint">
              Analizando: equipo actual ({validCount}/6 Pokémon)
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-ink-faint">Cargar guardado:</span>
              <select
                value={chosenSavedId ?? ''}
                onChange={(e) => loadSaved(e.target.value)}
                className="h-7 px-2 rounded bg-bg-900 border border-white/[0.08] text-xs"
              >
                <option value="">— Elegir —</option>
                {saved.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-6 sm:p-8 relative overflow-hidden text-center"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink-faint font-bold mb-2 inline-flex items-center gap-1.5">
            <BrainIcon className="w-3 h-3 text-brand-glow" />
            Análisis automático
          </div>
          <div className={`font-display text-7xl sm:text-8xl font-bold tabular-nums ${scoreTone}`}>
            {report.overallScore}
            <span className="text-3xl text-ink-faint">/100</span>
          </div>
          <div className={`text-sm font-bold mt-2 ${scoreTone}`}>{scoreBadge}</div>
          <p className="text-xs text-ink-dim mt-3 max-w-md mx-auto leading-relaxed">
            Análisis rule-based (sin IA) — detecta roles, weaknesses compartidas
            y cobertura. Para análisis más profundo con IA, ve a la pestaña Pro.
          </p>
        </div>
      </motion.div>

      {/* Insights priorizados */}
      {report.insights.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
            <TargetIcon className="w-5 h-5 text-brand-glow" /> Diagnóstico
          </h2>
          <div className="space-y-2">
            {report.insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </section>
      )}

      {/* Grid de stats */}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Roles cubiertos */}
        <section className="card-base p-4">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <ShieldIcon className="w-4 h-4 text-accent-green" />
            Roles del equipo
          </h3>
          {report.rolesPresent.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {report.rolesPresent.map((r) => (
                <span
                  key={r}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-accent-green/15 text-accent-green"
                >
                  <CheckIcon className="w-2.5 h-2.5 inline-block mr-1 mb-0.5" />
                  {ROLE_LABELS[r]}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-dim mb-3">Ningún rol específico detectado.</p>
          )}
          {report.rolesMissing.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1.5">
                Faltan:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {report.rolesMissing.map((r) => (
                  <span
                    key={r}
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-accent-red/15 text-accent-red"
                  >
                    {ROLE_LABELS[r]}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Weaknesses compartidas */}
        <section className="card-base p-4">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <SwordIcon className="w-4 h-4 text-accent-red" />
            Debilidades compartidas
          </h3>
          {report.sharedWeaknesses.length > 0 ? (
            <ul className="space-y-2">
              {report.sharedWeaknesses.slice(0, 6).map((w) => (
                <li key={w.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={w.type} size="xs" />
                    <span className="text-xs text-ink-soft">
                      {w.members.join(', ')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold tabular-nums ${
                      w.count >= 3 ? 'text-accent-red' : 'text-accent-yellow'
                    }`}
                  >
                    {w.count} miembros
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-accent-green">
              ✓ Sin weaknesses compartidas por 2+ miembros. Excelente.
            </p>
          )}
        </section>

        {/* Cobertura ofensiva */}
        <section className="card-base p-4">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <BoltIcon className="w-4 h-4 text-accent-yellow" />
            Cobertura ofensiva (STAB)
          </h3>
          <p className="text-[11px] text-ink-faint mb-2">
            {report.coveredOffensiveTypes.length}/18 tipos golpeados super-efectivamente
          </p>
          <div className="flex flex-wrap gap-1">
            {report.coveredOffensiveTypes.map((t) => (
              <TypeBadge key={t} type={t} size="xs" />
            ))}
          </div>
        </section>

        {/* Speed */}
        <section className="card-base p-4">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <BoltIcon className="w-4 h-4 text-brand-glow" />
            Velocidad
          </h3>
          <div className="space-y-1.5">
            {report.members
              .map((m) => ({ name: m.member.name, spe: m.member.stats.speed }))
              .sort((a, b) => b.spe - a.spe)
              .map((m) => (
                <div key={m.name} className="flex items-center justify-between text-xs">
                  <span className="capitalize text-ink-soft truncate">{m.name}</span>
                  <span className="font-mono font-bold text-ink">{m.spe}</span>
                </div>
              ))}
          </div>
          <div className="mt-3 pt-2 border-t border-white/[0.06] text-[11px] text-ink-faint">
            Promedio base Speed:{' '}
            <span className="font-bold text-ink">
              {Math.round(
                report.members.reduce((a, m) => a + m.member.stats.speed, 0) /
                  Math.max(1, report.members.length)
              )}
            </span>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="card-base p-4 text-center">
        <p className="text-sm text-ink-dim">
          ¿Aplicaste cambios? Vuelve al{' '}
          <Link href="/team-builder" className="text-brand-glow hover:text-brand-hover font-bold">
            Team Builder
          </Link>{' '}
          y vuelve aquí para re-analizar.
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: TeamInsight }) {
  const sevCls =
    insight.severity === 'critical'
      ? 'border-l-accent-red bg-accent-red/[0.04]'
      : insight.severity === 'warning'
      ? 'border-l-accent-yellow bg-accent-yellow/[0.04]'
      : 'border-l-accent-green bg-accent-green/[0.04]';
  const icon =
    insight.severity === 'critical' ? '⚠' : insight.severity === 'warning' ? '⚡' : '✓';
  const iconCls =
    insight.severity === 'critical'
      ? 'text-accent-red'
      : insight.severity === 'warning'
      ? 'text-accent-yellow'
      : 'text-accent-green';

  return (
    <div className={`border-l-4 ${sevCls} rounded-r-lg p-3.5 space-y-1`}>
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <div className="font-display font-bold text-sm flex items-center gap-2">
          <span className={iconCls}>{icon}</span>
          {insight.title}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.06] text-ink-faint">
          {insight.category}
        </span>
      </div>
      <p className="text-xs text-ink-soft leading-relaxed pl-6">
        {insight.detail}
      </p>
    </div>
  );
}

function EmptyState({
  saved,
  onLoad,
}: {
  saved: ReturnType<typeof useTeamStore.getState>['saved'];
  onLoad: (id: string) => void;
}) {
  return (
    <div className="card-base p-8 sm:p-12 text-center relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/15 text-brand-glow mb-4">
          <BrainIcon className="w-8 h-8" />
        </div>
        <h2 className="font-display text-xl font-bold">No tienes ningún equipo</h2>
        <p className="text-sm text-ink-dim mt-2 max-w-md mx-auto">
          Construye tu equipo en el Team Builder o carga uno guardado para
          recibir un análisis instantáneo.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          <Link
            href="/team-builder"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand text-white text-sm font-bold shadow-glow hover:bg-brand-hover"
          >
            Ir al Team Builder
            <ArrowRight className="w-4 h-4" />
          </Link>
          {saved.length > 0 && (
            <select
              onChange={(e) => e.target.value && onLoad(e.target.value)}
              defaultValue=""
              className="h-10 px-3 rounded-xl glass text-sm font-semibold"
            >
              <option value="" disabled>
                Cargar guardado…
              </option>
              {saved.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
