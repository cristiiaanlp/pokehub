'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTypeMasterStore } from '@/stores/typemasterStore';
import { ALL_TYPES } from '@/lib/type-effectiveness';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { XPBar } from '@/components/typemaster/XPBar';
import { StatStrip } from '@/components/typemaster/StatStrip';
import { BadgeGrid } from '@/components/typemaster/BadgeGrid';
import {
  ChartIcon,
  ClockIcon,
  TargetIcon,
  ArrowRight,
  TrophyIcon,
  FlameIcon,
  BoltIcon,
} from '@/components/ui/Icon';
import { DIFFICULTY_CONFIG, type Difficulty } from '@/lib/typemaster/xp-system';
import { Button } from '@/components/ui/Button';

export default function StatsPage() {
  const history = useTypeMasterStore((s) => s.history);
  const right = useTypeMasterStore((s) => s.typeRight);
  const wrong = useTypeMasterStore((s) => s.typeWrong);
  const bests = useTypeMasterStore((s) => s.bestsByDifficulty);
  const lastDifficulty = useTypeMasterStore((s) => s.lastDifficulty);
  const reset = useTypeMasterStore((s) => s.resetAll);

  const typeAccuracy = ALL_TYPES.map((t) => {
    const r = right[t] ?? 0;
    const w = wrong[t] ?? 0;
    const total = r + w;
    return {
      type: t,
      total,
      accuracy: total === 0 ? null : (r / total) * 100,
      wrong: w,
    };
  });

  const mostMissed = typeAccuracy
    .filter((x) => x.total >= 3)
    .sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100))
    .slice(0, 6);

  const avgMs =
    history.length === 0
      ? 0
      : Math.round(
          history.reduce((acc, h) => acc + h.avgResponseMs, 0) / history.length
        );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
            TypeMaster · Stats personales
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Tu progreso
          </h1>
        </div>
        <Link href={`/typemaster/play?difficulty=${lastDifficulty}`}>
          <Button variant="primary" size="md">
            Jugar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <XPBar />
      <StatStrip />

      <section>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
          <TrophyIcon className="w-4 h-4 text-accent-yellow" />
          Mejores marcas por modo
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {(['beginner', 'advanced', 'pro'] as Difficulty[]).map((d) => {
            const cfg = DIFFICULTY_CONFIG[d];
            const b = bests[d];
            return (
              <div key={d} className="card-base p-4 relative overflow-hidden">
                <div
                  className="absolute -top-12 -right-10 w-32 h-32 rounded-full blur-2xl opacity-25 pointer-events-none"
                  style={{ background: cfg.color }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </div>
                    {b && (
                      <span className="text-[10px] text-ink-faint font-mono">
                        {b.bestScore}/10
                      </span>
                    )}
                  </div>
                  {!b ? (
                    <div className="text-sm text-ink-dim py-2">
                      Aún no jugado.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Row
                        Icon={TrophyIcon}
                        label="Mejor score"
                        value={`${b.bestScore}/10`}
                      />
                      <Row
                        Icon={BoltIcon}
                        label="XP máximo"
                        value={`${b.bestXP}`}
                      />
                      <Row
                        Icon={FlameIcon}
                        label="Mejor combo"
                        value={`×${b.bestCombo}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold mb-1 flex items-center gap-2">
            <TargetIcon className="w-4 h-4 text-accent-red" />
            Tipos que más fallas
          </h3>
          <p className="text-xs text-ink-faint mb-4">
            Los tipos donde tu precisión es más baja (mínimo 3 apariciones).
          </p>
          {mostMissed.length === 0 ? (
            <div className="text-sm text-ink-dim py-8 text-center">
              Juega más para ver tus puntos débiles.
            </div>
          ) : (
            <div className="space-y-2">
              {mostMissed.map((m) => (
                <div key={m.type} className="flex items-center gap-3">
                  <div className="w-20 shrink-0">
                    <TypeBadge type={m.type} size="xs" />
                  </div>
                  <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.accuracy ?? 0}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-accent-red to-orange-400"
                    />
                  </div>
                  <div className="text-xs font-mono text-ink-dim w-16 text-right">
                    {(m.accuracy ?? 0).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold mb-1 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-brand-glow" />
            Histórico reciente
          </h3>
          <p className="text-xs text-ink-faint mb-4">
            Últimas {history.length} partidas. Velocidad media: {(avgMs / 1000).toFixed(1)}s.
          </p>
          {history.length === 0 ? (
            <div className="text-sm text-ink-dim py-8 text-center">
              Aún no has jugado ninguna partida.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {history.slice(0, 12).map((r) => {
                const cfg = DIFFICULTY_CONFIG[r.difficulty];
                const acc = (r.correct / r.total) * 100;
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl glass text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: cfg.color }}
                    />
                    <span className="font-semibold text-ink shrink-0">
                      {cfg.label}
                    </span>
                    <span className="text-ink-faint shrink-0">
                      {r.correct}/{r.total}
                    </span>
                    <span
                      className={`shrink-0 ${
                        acc >= 80
                          ? 'text-accent-green'
                          : acc >= 50
                          ? 'text-accent-yellow'
                          : 'text-accent-red'
                      }`}
                    >
                      {acc.toFixed(0)}%
                    </span>
                    <span className="text-ink-faint ml-auto">
                      +{r.xpGained} XP
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
          <ChartIcon className="w-4 h-4 text-accent-green" />
          Badges
        </h2>
        <BadgeGrid />
      </section>

      <div className="text-center pt-4">
        <button
          onClick={() => {
            if (confirm('¿Resetear todo el progreso de TypeMaster?')) reset();
          }}
          className="text-xs text-ink-faint hover:text-accent-red"
        >
          Resetear progreso
        </button>
      </div>
    </div>
  );
}

function Row({
  Icon,
  label,
  value,
}: {
  Icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-3.5 h-3.5 text-ink-faint" />
      <span className="text-ink-dim text-xs">{label}</span>
      <span className="ml-auto font-display font-bold tabular-nums">
        {value}
      </span>
    </div>
  );
}
