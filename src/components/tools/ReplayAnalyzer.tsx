'use client';

import { useMemo, useState } from 'react';
import type { ReplayAnalysis } from '@/lib/replay-parser';
import { analyzeForCoaching, type CoachingTip } from '@/lib/replay-coaching';
import {
  TrophyIcon,
  SwordIcon,
  BoltIcon,
  BrainIcon,
  BookOpenIcon,
} from '@/components/ui/Icon';

export function ReplayAnalyzer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReplayAnalysis | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const coachingTips = useMemo(
    () => (analysis ? analyzeForCoaching(analysis) : []),
    [analysis]
  );

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setErr(null);
    setAnalysis(null);
    try {
      const res = await fetch(
        `/api/replay?url=${encodeURIComponent(url.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? res.statusText);
        return;
      }
      setAnalysis(data.analysis as ReplayAnalysis);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card-base p-4">
        <label className="text-xs text-ink-dim">
          URL del replay (replay.pokemonshowdown.com/...)
        </label>
        <div className="mt-1 flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyze()}
            placeholder="https://replay.pokemonshowdown.com/gen9ou-2123456789"
            className="flex-1 h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-mono"
          />
          <button
            onClick={analyze}
            disabled={loading || !url.trim()}
            className="h-10 px-5 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? 'Analizando…' : 'Analizar'}
          </button>
        </div>
        {err && (
          <div className="mt-2 text-xs text-accent-red">⚠ {err}</div>
        )}
      </div>

      {analysis && (
        <>
          {/* Summary */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">
                  {analysis.format ?? 'Formato'} · {analysis.turnCount} turnos
                </div>
                <h2 className="font-display text-xl font-bold mt-0.5">
                  {analysis.players[0].name} vs {analysis.players[1].name}
                </h2>
              </div>
              {analysis.winner && (
                <div className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30">
                  <TrophyIcon className="w-4 h-4" />
                  <span className="font-bold text-sm">
                    Victoria: {analysis.winner}
                  </span>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <SummaryCard
                label="KOs Player 1"
                value={analysis.kosByPlayer.p1}
                Icon={SwordIcon}
                tone="text-accent-red"
              />
              <SummaryCard
                label="KOs Player 2"
                value={analysis.kosByPlayer.p2}
                Icon={SwordIcon}
                tone="text-brand-glow"
              />
              <SummaryCard
                label="Primer KO"
                value={
                  analysis.faintedFirst
                    ? `T${analysis.faintedFirst.turn} · ${analysis.faintedFirst.pokemon}`
                    : '—'
                }
                Icon={BoltIcon}
                tone="text-accent-yellow"
              />
            </div>
          </div>

          {/* Coaching automático */}
          {coachingTips.length > 0 && (
            <div className="card-base p-5 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <h3 className="font-display font-bold text-lg inline-flex items-center gap-2">
                    <BrainIcon className="w-5 h-5 text-purple-300" />
                    Coaching automático
                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Beta
                    </span>
                  </h3>
                  <span className="text-[10px] text-ink-faint">
                    {coachingTips.length} {coachingTips.length === 1 ? 'tip' : 'tips'} detectados
                  </span>
                </div>
                <p className="text-[11px] text-ink-dim mb-4">
                  Análisis heurístico (no IA) — detecta patrones obvios en el
                  replay. Toma estos tips como punto de partida, no como veredicto.
                </p>
                <div className="space-y-2">
                  {coachingTips.map((tip, i) => (
                    <CoachingTipCard key={i} tip={tip} players={analysis.players} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Equipos */}
          <div className="grid lg:grid-cols-2 gap-3">
            {analysis.players.map((p, i) => (
              <div key={i} className="card-base p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-display font-bold">{p.name}</div>
                    {p.rating && (
                      <div className="text-[10px] text-ink-faint">
                        Rating: {p.rating}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.06]">
                    {p.slot}
                  </span>
                </div>
                <div className="space-y-2">
                  {p.team.map((m) => (
                    <div
                      key={m.species}
                      className={`p-2 rounded-lg border ${
                        m.fainted
                          ? 'bg-accent-red/[0.04] border-accent-red/20 opacity-60'
                          : 'bg-white/[0.02] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold text-sm ${m.fainted ? 'line-through' : ''}`}>
                          {m.species}
                        </span>
                        {m.teraType && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300">
                            Tera {m.teraType}
                          </span>
                        )}
                        {m.fainted && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-accent-red">
                            ✗ KO
                          </span>
                        )}
                      </div>
                      {Object.keys(m.movesUsed).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-ink-faint">
                          {Object.entries(m.movesUsed)
                            .sort((a, b) => b[1] - a[1])
                            .map(([mv, c]) => (
                              <span
                                key={mv}
                                className="px-1.5 py-0.5 rounded bg-white/[0.04]"
                              >
                                {mv} ×{c}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Momentos clave */}
          <div className="card-base p-4">
            <h3 className="font-display font-bold text-sm mb-3">
              Momentos clave
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {analysis.events
                .filter((e) => ['faint', 'tera', 'crit', 'win'].includes(e.kind))
                .map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-white/[0.03]"
                  >
                    <span className="font-mono text-ink-faint w-10 shrink-0">
                      T{e.turn}
                    </span>
                    <span
                      className={`font-bold uppercase tracking-widest text-[9px] px-1.5 py-0.5 rounded ${
                        e.kind === 'faint'
                          ? 'bg-accent-red/15 text-accent-red'
                          : e.kind === 'tera'
                          ? 'bg-purple-500/15 text-purple-300'
                          : e.kind === 'crit'
                          ? 'bg-accent-yellow/15 text-accent-yellow'
                          : 'bg-accent-green/15 text-accent-green'
                      }`}
                    >
                      {e.kind}
                    </span>
                    {e.actor && <span className="font-semibold">{e.actor}</span>}
                    {e.detail && (
                      <span className="text-ink-dim">· {e.detail}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: string | number;
  Icon: any;
  tone: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
          {label}
        </div>
        <Icon className={`w-4 h-4 ${tone}`} />
      </div>
      <div className={`font-display text-lg font-bold mt-0.5 ${tone}`}>
        {value}
      </div>
    </div>
  );
}

function CoachingTipCard({
  tip,
  players,
}: {
  tip: CoachingTip;
  players: readonly [ReplayAnalysis['players'][0], ReplayAnalysis['players'][1]];
}) {
  const sevCls =
    tip.severity === 'critical'
      ? 'border-l-accent-red bg-accent-red/[0.04]'
      : tip.severity === 'warning'
      ? 'border-l-accent-yellow bg-accent-yellow/[0.04]'
      : 'border-l-brand-glow bg-brand/[0.04]';
  const sevLabel =
    tip.severity === 'critical' ? '⚠ Crítico' : tip.severity === 'warning' ? '⚡ Atención' : 'ℹ Info';

  const playerLabel =
    tip.player === 'general'
      ? 'General'
      : tip.player === 'both'
      ? 'Ambos'
      : tip.player === 'p1'
      ? players[0].name
      : players[1].name;

  return (
    <div className={`border-l-4 ${sevCls} rounded-r-lg p-3 space-y-1`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.06]">
            {tip.category}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">
            {sevLabel}
          </span>
          {tip.turn !== undefined && (
            <span className="text-[10px] font-mono text-ink-faint">
              T{tip.turn}
            </span>
          )}
        </div>
        <span className="text-[10px] text-ink-faint truncate max-w-[40%]">
          → {playerLabel}
        </span>
      </div>
      <div className="font-display font-bold text-sm">{tip.title}</div>
      <p className="text-xs text-ink-soft leading-relaxed inline-flex items-start gap-1">
        <BookOpenIcon className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-0.5" />
        {tip.detail}
      </p>
    </div>
  );
}
