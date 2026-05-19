'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import {
  ClockIcon,
  XIcon,
  FlameIcon,
  BoltIcon,
  VolumeIcon,
  ArrowRight,
} from '@/components/ui/Icon';
import { QuestionPrompt } from './QuestionPrompt';
import { AnswerButton } from './AnswerButton';
import { TimerBar } from './TimerBar';
import { ComboBadge } from './ComboBadge';
import { ResultScreen } from './ResultScreen';
import { Particles } from './Particles';
import { LevelUpOverlay } from './LevelUpOverlay';
import { generateQuestion, type QuizQuestion } from '@/lib/typemaster/question-gen';
import {
  DIFFICULTY_CONFIG,
  calculateXP,
  type Difficulty,
} from '@/lib/typemaster/xp-system';
import { useTypeMasterStore } from '@/stores/typemasterStore';
import { Sound } from '@/lib/typemaster/sound';
import { Haptics } from '@/lib/typemaster/haptics';
import type { PokemonType } from '@/types/pokemon';
import { TYPE_HEX } from '@/components/ui/TypeBadge';

const REGULAR_TOTAL = 10;
const DAILY_TOTAL = 15;
const DAILY_XP_MULT = 1.5;

interface QState {
  question: QuizQuestion;
  selected: number | null;
  correct: boolean | null;
  expired: boolean;
  startedAt: number;
  endedAt: number | null;
  earnedXP: number;
}

interface FinalSummaryPayload {
  summary: {
    difficulty: Difficulty;
    totalQuestions: number;
    correct: number;
    bestCombo: number;
    xpGained: number;
    avgResponseMs: number;
    daily?: boolean;
  };
  result: {
    newBadges: string[];
    leveledUp: boolean;
    newLevel: number;
  };
  wrong: { question: QuizQuestion; pickedIndex: number; expired: boolean }[];
}

interface Props {
  difficulty: Difficulty;
  daily?: boolean;
}

export function QuizScreen({ difficulty, daily = false }: Props) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const totalQuestions = daily ? DAILY_TOTAL : REGULAR_TOTAL;

  const recordAnswer = useTypeMasterStore((s) => s.recordAnswer);
  const finishSession = useTypeMasterStore((s) => s.finishSession);
  const setLastDifficulty = useTypeMasterStore((s) => s.setLastDifficulty);
  const soundOn = useTypeMasterStore((s) => s.sound);
  const hapticsOn = useTypeMasterStore((s) => s.haptics);
  const toggleSound = useTypeMasterStore((s) => s.toggleSound);

  useEffect(() => {
    Sound.setEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    setLastDifficulty(difficulty);
  }, [difficulty, setLastDifficulty]);

  const [questions, setQuestions] = useState<QState[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [fastUnder2sCount, setFastUnder2sCount] = useState(0);
  const [noTimerExpire, setNoTimerExpire] = useState(true);
  const [phase, setPhase] = useState<'play' | 'reveal' | 'finished'>('play');
  const [floatXP, setFloatXP] = useState<{ id: number; xp: number } | null>(null);
  const [particleTrigger, setParticleTrigger] = useState<number | null>(null);
  const [particleColor, setParticleColor] = useState<string>('#10B981');
  const [levelUpTarget, setLevelUpTarget] = useState<number | null>(null);
  const [xpPulseKey, setXpPulseKey] = useState(0);

  const finalSummaryRef = useRef<FinalSummaryPayload | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canSkipRef = useRef(false);

  // Init first question
  useEffect(() => {
    if (questions.length === 0) {
      setQuestions([
        {
          question: generateQuestion(difficulty),
          selected: null,
          correct: null,
          expired: false,
          startedAt: Date.now(),
          endedAt: null,
          earnedXP: 0,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const current = questions[currentIdx];

  const clearAdvance = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  // Build the final summary from local values (avoids stale closure)
  const completeSession = useCallback(
    (latest: {
      newQuestions: QState[];
      newBestCombo: number;
      newSessionXP: number;
      newFastUnder2sCount: number;
      newNoTimerExpire: number | boolean;
    }) => {
      const finalXP = daily
        ? Math.round(latest.newSessionXP * DAILY_XP_MULT)
        : latest.newSessionXP;
      const correctCount = latest.newQuestions.filter((q) => q.correct === true).length;
      const avgMs =
        latest.newQuestions.reduce(
          (acc, q) =>
            acc + ((q.endedAt ?? q.startedAt + 10000) - q.startedAt),
          0
        ) / Math.max(latest.newQuestions.length, 1);

      const summary = {
        difficulty,
        totalQuestions: latest.newQuestions.length,
        correct: correctCount,
        bestComboInSession: latest.newBestCombo,
        fastAnswersUnder2s: latest.newFastUnder2sCount,
        noTimerExpire: !!latest.newNoTimerExpire,
        daily,
        xpGained: finalXP,
        bestCombo: latest.newBestCombo,
        avgResponseMs: Math.round(avgMs),
      };
      const result = finishSession(summary);

      const wrong = latest.newQuestions
        .filter((q) => q.correct === false)
        .map((q) => ({
          question: q.question,
          pickedIndex: q.selected ?? -1,
          expired: q.expired,
        }));

      finalSummaryRef.current = { summary, result, wrong };

      if (result.leveledUp) {
        setLevelUpTarget(result.newLevel);
        Sound.levelUp();
        if (hapticsOn) Haptics.levelUp();
      }
      setPhase('finished');
    },
    [daily, difficulty, finishSession, hapticsOn]
  );

  const handleAnswer = useCallback(
    (optionIndex: number, expired = false) => {
      if (!current || phase !== 'play' || current.selected !== null) return;
      clearAdvance();
      canSkipRef.current = false;

      const option = expired ? null : current.question.options[optionIndex];
      const isCorrect = !expired && !!option?.correct;
      const elapsedMs = Date.now() - current.startedAt;
      const secondsLeft = cfg.timerSec
        ? Math.max(0, cfg.timerSec - elapsedMs / 1000)
        : undefined;

      const xp = calculateXP({
        correct: isCorrect,
        difficulty,
        combo,
        secondsLeft,
      }).xp;

      const usedTypes: PokemonType[] = [
        ...(current.question.display.defenderTypes ?? []),
        ...(current.question.display.attackerType
          ? [current.question.display.attackerType]
          : []),
      ];
      recordAnswer(isCorrect, usedTypes);

      const updatedQuestions: QState[] = questions.map((q, i) =>
        i === currentIdx
          ? {
              ...q,
              selected: expired ? -1 : optionIndex,
              correct: isCorrect,
              expired,
              endedAt: Date.now(),
              earnedXP: xp,
            }
          : q
      );

      const newCombo = isCorrect ? combo + 1 : 0;
      const newBestCombo = Math.max(bestCombo, newCombo);
      const newSessionXP = sessionXP + xp;
      const newFast =
        isCorrect &&
        cfg.timerSec &&
        difficulty === 'pro' &&
        elapsedMs < 2000
          ? fastUnder2sCount + 1
          : fastUnder2sCount;
      const newNoTimerExpire = expired ? false : noTimerExpire;

      setQuestions(updatedQuestions);
      setCombo(newCombo);
      setBestCombo(newBestCombo);
      setSessionXP(newSessionXP);
      setFastUnder2sCount(newFast);
      setNoTimerExpire(newNoTimerExpire);

      // FX
      if (isCorrect) {
        if (soundOn) Sound.correct();
        if (hapticsOn) Haptics.correct();
        if (newCombo > 0 && newCombo % 5 === 0) {
          if (soundOn) Sound.combo(newCombo);
          if (hapticsOn) Haptics.combo();
        }
        setFloatXP({ id: Date.now(), xp });
        setParticleColor('#10B981');
        setParticleTrigger(Date.now());
        setXpPulseKey((k) => k + 1);
      } else if (expired) {
        if (soundOn) Sound.expire();
        if (hapticsOn) Haptics.expire();
      } else {
        if (soundOn) Sound.wrong();
        if (hapticsOn) Haptics.wrong();
      }

      setPhase('reveal');

      const delay = isCorrect ? 750 : 1700;
      const isLast = currentIdx + 1 >= totalQuestions;

      // Allow manual skip after 200ms to prevent fat-finger accidents
      setTimeout(() => {
        canSkipRef.current = true;
      }, 200);

      advanceTimerRef.current = setTimeout(() => {
        if (isLast) {
          completeSession({
            newQuestions: updatedQuestions,
            newBestCombo,
            newSessionXP,
            newFastUnder2sCount: newFast,
            newNoTimerExpire,
          });
        } else {
          const nextIdx = currentIdx + 1;
          setQuestions((prev) => [
            ...prev,
            {
              question: generateQuestion(difficulty),
              selected: null,
              correct: null,
              expired: false,
              startedAt: Date.now(),
              endedAt: null,
              earnedXP: 0,
            },
          ]);
          setCurrentIdx(nextIdx);
          setPhase('play');
        }
      }, delay);
    },
    [
      current,
      currentIdx,
      questions,
      combo,
      bestCombo,
      sessionXP,
      fastUnder2sCount,
      noTimerExpire,
      cfg,
      difficulty,
      phase,
      recordAnswer,
      totalQuestions,
      completeSession,
      hapticsOn,
      soundOn,
    ]
  );

  const skipReveal = useCallback(() => {
    if (phase !== 'reveal' || !canSkipRef.current) return;
    clearAdvance();
    const isLast = currentIdx + 1 >= totalQuestions;
    if (isLast) {
      completeSession({
        newQuestions: questions,
        newBestCombo: bestCombo,
        newSessionXP: sessionXP,
        newFastUnder2sCount: fastUnder2sCount,
        newNoTimerExpire: noTimerExpire,
      });
    } else {
      const nextIdx = currentIdx + 1;
      setQuestions((prev) => [
        ...prev,
        {
          question: generateQuestion(difficulty),
          selected: null,
          correct: null,
          expired: false,
          startedAt: Date.now(),
          endedAt: null,
          earnedXP: 0,
        },
      ]);
      setCurrentIdx(nextIdx);
      setPhase('play');
    }
  }, [
    phase,
    currentIdx,
    totalQuestions,
    completeSession,
    questions,
    bestCombo,
    sessionXP,
    fastUnder2sCount,
    noTimerExpire,
    difficulty,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (phase === 'play' && current) {
        const map: Record<string, number> = {
          a: 0,
          A: 0,
          '1': 0,
          b: 1,
          B: 1,
          '2': 1,
          c: 2,
          C: 2,
          '3': 2,
          d: 3,
          D: 3,
          '4': 3,
        };
        if (e.key in map) {
          e.preventDefault();
          handleAnswer(map[e.key]);
        }
      }
      if (phase === 'reveal' && (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight')) {
        e.preventDefault();
        skipReveal();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, current, handleAnswer, skipReveal]);

  // Cleanup timer on unmount
  useEffect(() => () => clearAdvance(), []);

  // Render finished state
  if (phase === 'finished' && finalSummaryRef.current) {
    return (
      <>
        <ResultScreen
          summary={finalSummaryRef.current.summary}
          result={finalSummaryRef.current.result}
          wrong={finalSummaryRef.current.wrong}
          difficulty={difficulty}
          daily={daily}
        />
        <LevelUpOverlay
          level={levelUpTarget}
          onDone={() => setLevelUpTarget(null)}
        />
      </>
    );
  }

  if (!current) return null;

  const showCorrectIdx = current.question.options.findIndex((o) => o.correct);

  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex flex-col">
      <LevelUpOverlay
        level={levelUpTarget}
        onDone={() => setLevelUpTarget(null)}
      />

      {/* Top HUD */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <Link
          href="/typemaster"
          className="h-10 w-10 rounded-xl glass hover:bg-white/[0.08] inline-flex items-center justify-center text-ink-dim hover:text-ink"
          aria-label="Salir"
        >
          <XIcon className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 h-10 rounded-xl glass text-xs font-semibold text-ink-soft">
            <span className="font-display font-bold text-ink">
              {currentIdx + 1}
            </span>
            <span className="text-ink-faint">/ {totalQuestions}</span>
          </div>
          {daily && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-xl bg-accent-yellow/15 text-accent-yellow text-xs font-bold uppercase tracking-widest">
              ⭐ Daily ×{DAILY_XP_MULT}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSound()}
            aria-label={soundOn ? 'Silenciar' : 'Activar sonido'}
            className={`h-10 w-10 rounded-xl glass inline-flex items-center justify-center transition-colors ${
              soundOn ? 'text-brand-glow' : 'text-ink-faint hover:text-ink'
            }`}
            title={soundOn ? 'Sonido on' : 'Sonido off'}
          >
            <VolumeIcon className="w-4 h-4" />
            {!soundOn && (
              <span className="absolute w-5 h-px rotate-45 bg-ink-faint" />
            )}
          </button>
          <motion.div
            key={xpPulseKey}
            initial={{ scale: 1 }}
            animate={xpPulseKey ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 px-3 h-10 rounded-xl glass text-xs font-semibold"
          >
            <BoltIcon className="w-3.5 h-3.5 text-accent-yellow" />
            <span className="font-mono tabular-nums">{sessionXP}</span>
            <span className="text-ink-faint">XP</span>
          </motion.div>
        </div>
      </div>

      {/* Progress segments */}
      <div
        className="grid gap-1 mb-4"
        style={{
          gridTemplateColumns: `repeat(${totalQuestions}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const q = questions[i];
          const cls = !q
            ? 'bg-white/[0.05]'
            : q.correct === true
            ? 'bg-accent-green'
            : q.correct === false
            ? 'bg-accent-red'
            : 'bg-brand';
          return <div key={i} className={`h-1 rounded-full ${cls}`} />;
        })}
      </div>

      {/* Timer */}
      {cfg.timerSec && (
        <div className="mb-6 flex items-center gap-2">
          <ClockIcon className="w-3.5 h-3.5 text-ink-faint" />
          <div className="flex-1">
            <TimerBar
              duration={cfg.timerSec}
              running={phase === 'play'}
              resetKey={current.question.id}
              onExpire={() => handleAnswer(-1, true)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <QuestionPrompt
            key={current.question.id}
            question={current.question}
            questionIndex={currentIdx}
          />
        </AnimatePresence>

        {/* Combo + floating XP */}
        <div className="relative h-12 mt-8 mb-4 flex items-center justify-center">
          <ComboBadge combo={combo} />
          <AnimatePresence>
            {floatXP && (
              <motion.div
                key={floatXP.id}
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: 1, y: -36, scale: 1.1 }}
                exit={{ opacity: 0, y: -60, scale: 1 }}
                transition={{ duration: 0.9 }}
                onAnimationComplete={() => setFloatXP(null)}
                className="absolute right-1/2 translate-x-32 font-display font-bold text-accent-green text-xl pointer-events-none"
              >
                +{floatXP.xp} XP
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
          {/* particle burst over the correct option */}
          {particleTrigger && phase === 'reveal' && (
            <div
              className="pointer-events-none absolute inset-0 z-10"
              aria-hidden
            >
              <div
                className="absolute"
                style={{
                  left: showCorrectIdx % 2 === 0 ? '25%' : '75%',
                  top: showCorrectIdx < 2 ? '25%' : '75%',
                  transform: 'translate(-50%, -50%)',
                  width: 0,
                  height: 0,
                }}
              >
                <Particles
                  trigger={particleTrigger}
                  color={
                    current.correct
                      ? particleColor
                      : (current.question.options[showCorrectIdx]?.kind === 'type'
                        ? TYPE_HEX(
                            (current.question.options[showCorrectIdx] as any).type
                          )
                        : '#3B82F6')
                  }
                />
              </div>
            </div>
          )}

          {current.question.options.map((opt, i) => {
            let state: 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim' = 'idle';
            if (phase === 'reveal') {
              if (current.selected === i && current.correct) state = 'correct';
              else if (current.selected === i && !current.correct) state = 'wrong';
              else if (opt.correct) state = 'reveal';
              else state = 'dim';
            }
            return (
              <AnswerButton
                key={i}
                index={i}
                state={state}
                disabled={phase !== 'play'}
                onClick={() => handleAnswer(i)}
                data={
                  opt.kind === 'type'
                    ? { kind: 'type', type: opt.type }
                    : { kind: 'multiplier', value: opt.value }
                }
              />
            );
          })}
        </div>

        {/* Reveal feedback */}
        <div className="h-12 mt-4 text-center">
          <AnimatePresence>
            {phase === 'reveal' && current.correct === true && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-accent-green font-semibold inline-flex items-center gap-2"
              >
                <FlameIcon className="w-4 h-4" />
                ¡Correcto! +{current.earnedXP} XP
              </motion.div>
            )}
            {phase === 'reveal' && current.correct === false && (
              <motion.div
                key="bad"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-1.5"
              >
                {current.expired && (
                  <div className="text-accent-red text-sm font-bold uppercase tracking-widest">
                    ⏱ Se acabó el tiempo
                  </div>
                )}
                <div className="text-ink-soft text-sm">
                  Respuesta correcta:{' '}
                  <span className="font-bold text-ink uppercase">
                    {(() => {
                      const c = current.question.options[showCorrectIdx];
                      if (!c) return '';
                      return c.kind === 'type'
                        ? c.type
                        : String(c.value).replace('.', ',') + '×';
                    })()}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Manual continue */}
        {phase === 'reveal' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={skipReveal}
            className="mx-auto mt-2 h-10 px-5 inline-flex items-center gap-2 rounded-xl glass-strong hover:bg-white/[0.10] text-sm font-semibold text-ink-soft hover:text-ink"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
            <kbd className="hidden sm:inline-block ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-ink-faint">
              Espacio
            </kbd>
          </motion.button>
        )}

        <div className="hidden sm:flex items-center justify-center gap-2 mt-4 text-[10px] text-ink-faint">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] font-mono">A</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] font-mono">B</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] font-mono">C</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] font-mono">D</kbd>
          <span>para responder ·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] font-mono">Espacio</kbd>
          <span>continuar</span>
        </div>
      </div>
    </div>
  );
}
