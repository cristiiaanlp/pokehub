'use client';

import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  TrophyIcon,
  BoltIcon,
  CheckIcon,
  XIcon,
} from '@/components/ui/Icon';
import { TypeBadge } from '@/components/ui/TypeBadge';
import {
  DIFFICULTY_CONFIG,
  rankFromLevel,
  type Difficulty,
} from '@/lib/typemaster/xp-system';
import { BADGES } from '@/lib/typemaster/achievements';
import type { QuizQuestion } from '@/lib/typemaster/question-gen';
import { formatMultiplier } from '@/lib/typemaster/question-gen';

interface WrongRecap {
  question: QuizQuestion;
  pickedIndex: number;
  expired: boolean;
}

interface Props {
  difficulty: Difficulty;
  daily?: boolean;
  summary: {
    totalQuestions: number;
    correct: number;
    bestCombo: number;
    xpGained: number;
    avgResponseMs: number;
  };
  result: {
    newBadges: string[];
    leveledUp: boolean;
    newLevel: number;
  };
  wrong: WrongRecap[];
}

function optionLabel(opt: QuizQuestion['options'][number]) {
  return opt.kind === 'type'
    ? opt.type
    : formatMultiplier(opt.value);
}

export function ResultScreen({
  difficulty,
  daily,
  summary,
  result,
  wrong,
}: Props) {
  const acc = (summary.correct / summary.totalQuestions) * 100;
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const rank = rankFromLevel(result.newLevel);
  const tone =
    acc >= 90
      ? 'text-accent-green'
      : acc >= 60
      ? 'text-accent-yellow'
      : 'text-accent-red';

  const playAgainHref = daily
    ? '/typemaster'
    : `/typemaster/play?difficulty=${difficulty}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-center"
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-3xl opacity-50"
          style={{ background: cfg.color }}
        />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.25em] text-ink-faint font-semibold mb-2">
            {daily ? '⭐ Daily Challenge' : `${cfg.label} · Sesión terminada`}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight">
            <span className={tone}>{summary.correct}</span>
            <span className="text-ink-faint">/{summary.totalQuestions}</span>
          </h1>
          <div className="text-ink-soft mt-1">
            {acc.toFixed(0)}% de aciertos
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-md mx-auto">
            <div className="card-base p-3">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint">
                XP
              </div>
              <div className="font-display text-xl font-bold mt-1 flex items-center justify-center gap-1">
                <BoltIcon className="w-4 h-4 text-accent-yellow" />+
                {summary.xpGained}
              </div>
            </div>
            <div className="card-base p-3">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint">
                Mejor combo
              </div>
              <div className="font-display text-xl font-bold mt-1">
                ×{summary.bestCombo}
              </div>
            </div>
            <div className="card-base p-3">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint">
                Velocidad
              </div>
              <div className="font-display text-xl font-bold mt-1">
                {(summary.avgResponseMs / 1000).toFixed(1)}s
              </div>
            </div>
          </div>

          {result.leveledUp && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mt-6 inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-white font-bold text-sm shadow-glow"
            >
              <TrophyIcon className="w-4 h-4" />
              ¡Subiste al nivel {result.newLevel}! · {rank.name}
            </motion.div>
          )}
        </div>
      </motion.div>

      {result.newBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-base p-5"
        >
          <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 text-accent-yellow" />
            Badges desbloqueados
          </h3>
          <div className="flex flex-wrap gap-3">
            {result.newBadges.map((id, i) => {
              const b = BADGES[id];
              if (!b) return null;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2 pr-3 pl-2 h-10 rounded-xl bg-accent-yellow/10 border border-accent-yellow/30"
                >
                  <span className="text-xl">{b.emoji}</span>
                  <div>
                    <div className="text-xs font-bold leading-tight">
                      {b.name}
                    </div>
                    <div className="text-[10px] text-ink-dim leading-tight">
                      {b.description}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {wrong.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-base p-5"
        >
          <h3 className="font-display text-base font-bold mb-1 flex items-center gap-2">
            <XIcon className="w-4 h-4 text-accent-red" />
            Repaso ({wrong.length} fallos)
          </h3>
          <p className="text-xs text-ink-faint mb-4">
            Repasa lo que se te escapó — la próxima vuelta lo clavarás.
          </p>
          <div className="space-y-2">
            {wrong.map((w, i) => {
              const q = w.question;
              const correctIdx = q.options.findIndex((o) => o.correct);
              const correct = q.options[correctIdx];
              const picked = w.pickedIndex >= 0 ? q.options[w.pickedIndex] : null;
              return (
                <div
                  key={i}
                  className="rounded-xl glass p-3 sm:p-4 space-y-2"
                >
                  <div className="text-sm font-semibold">{q.prompt}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckIcon className="w-3.5 h-3.5 text-accent-green" />
                      <span className="text-ink-faint">Correcto:</span>
                      {correct?.kind === 'type' ? (
                        <TypeBadge type={correct.type} size="xs" />
                      ) : (
                        <span className="font-bold text-accent-green">
                          {correct ? optionLabel(correct) : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {w.expired ? (
                        <span className="text-accent-red font-bold uppercase tracking-wider">
                          ⏱ Sin tiempo
                        </span>
                      ) : (
                        <>
                          <XIcon className="w-3.5 h-3.5 text-accent-red" />
                          <span className="text-ink-faint">Marcaste:</span>
                          {picked?.kind === 'type' ? (
                            <TypeBadge type={picked.type} size="xs" />
                          ) : (
                            <span className="font-bold text-accent-red">
                              {picked ? optionLabel(picked) : ''}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        <Link href={playAgainHref}>
          <Button variant="gradient" size="lg">
            {daily ? 'Volver al hub' : 'Otra ronda'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <Link href="/typemaster/stats">
          <Button variant="secondary" size="lg">
            Ver mis stats
          </Button>
        </Link>
      </div>

      {acc >= 80 && summary.totalQuestions >= 10 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-base p-5 relative overflow-hidden border-pink-400/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-orange-500/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-3 flex-wrap">
            <div className="text-3xl shrink-0">☕</div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm">
                ¡Buen run! Si la app te mola, puedes invitarme a un café
              </div>
              <div className="text-[11px] text-ink-dim mt-0.5">
                PokéHub es gratis sin anuncios. Las donaciones mantienen el
                hosting + features nuevas.
              </div>
            </div>
            <Link
              href="/support"
              className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-bold shadow-[0_0_15px_-3px_rgba(244,114,182,0.5)] hover:scale-[1.04] active:scale-[0.98] transition-transform"
            >
              Apoyar
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
