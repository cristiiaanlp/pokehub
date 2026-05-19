'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { artworkFor } from '@/lib/pokeapi';
import {
  generateMetaQuiz,
  type MetaQuizQuestion,
} from '@/lib/typemaster/meta-quiz';
import type { MetaThreat } from '@/lib/team-analysis/threats';
import {
  ChartIcon,
  ArrowRight,
  CheckIcon,
  XIcon,
  TrophyIcon,
  FireIcon,
} from '@/components/ui/Icon';

const STORAGE_KEY = 'pokehub-meta-daily';

function todayISO() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

interface SavedState {
  date: string;
  score: number;
  total: number;
}

export default function MetaDailyPage() {
  const router = useRouter();
  const [threats, setThreats] = useState<MetaThreat[] | null>(null);
  const [questions, setQuestions] = useState<MetaQuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [phase, setPhase] = useState<'loading' | 'play' | 'finished' | 'already'>(
    'loading'
  );
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    // Check if already done today
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed: SavedState = JSON.parse(raw);
          if (parsed.date === todayISO()) {
            setPhase('already');
            return;
          }
        } catch {
          /* ignore */
        }
      }
    }

    // Fetch meta data
    fetch('/api/meta/threats?format=championspreview')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setThreats(data.entries as MetaThreat[]);
        const qs = generateMetaQuiz(data.entries as MetaThreat[], 6);
        setQuestions(qs);
        setPicks(new Array(qs.length).fill(null));
        setPhase(qs.length > 0 ? 'play' : 'finished');
      })
      .catch(() => setPhase('finished'));
  }, []);

  const current = questions[idx];
  const score = useMemo(
    () =>
      picks.reduce<number>((acc, p, i) => {
        if (p === null) return acc;
        return acc + (questions[i]?.options[p]?.correct ? 1 : 0);
      }, 0),
    [picks, questions]
  );

  const pick = (optionIdx: number) => {
    if (reveal || !current) return;
    const newPicks = [...picks];
    newPicks[idx] = optionIdx;
    setPicks(newPicks);
    setReveal(true);
    setTimeout(() => {
      setReveal(false);
      if (idx + 1 >= questions.length) {
        finish(newPicks);
      } else {
        setIdx(idx + 1);
      }
    }, 1500);
  };

  const finish = (finalPicks: (number | null)[]) => {
    const final = finalPicks.reduce<number>((acc, p, i) => {
      if (p === null) return acc;
      return acc + (questions[i]?.options[p]?.correct ? 1 : 0);
    }, 0);
    const state: SavedState = {
      date: todayISO(),
      score: final,
      total: questions.length,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setPhase('finished');
  };

  if (phase === 'loading') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-ink-dim">
        <div className="w-10 h-10 mx-auto border-2 border-brand/30 border-t-brand rounded-full animate-spin mb-3" />
        Cargando meta…
      </div>
    );
  }

  if (phase === 'already') {
    const raw = localStorage.getItem(STORAGE_KEY);
    let prev: SavedState | null = null;
    try {
      prev = raw ? JSON.parse(raw) : null;
    } catch {}
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <Splash
          title="Ya jugaste el meta-quiz de hoy 🎯"
          description={`Vuelve mañana para otro set de preguntas sobre el meta actual.${
            prev ? ` Tu resultado: ${prev.score}/${prev.total}` : ''
          }`}
        />
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <FinishedScreen
          score={score}
          total={questions.length}
          questions={questions}
          picks={picks}
          onBack={() => router.push('/typemaster')}
        />
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-12 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/typemaster"
          className="h-10 w-10 rounded-xl glass hover:bg-white/[0.08] inline-flex items-center justify-center text-ink-dim hover:text-ink"
          aria-label="Salir"
        >
          <XIcon className="w-4 h-4" />
        </Link>
        <div className="text-xs uppercase tracking-widest text-accent-yellow font-bold flex items-center gap-1.5">
          <ChartIcon className="w-3.5 h-3.5" />
          Meta Daily · Champions
        </div>
        <div className="flex items-center gap-2 px-3 h-10 rounded-xl glass text-xs font-semibold">
          <span className="font-display font-bold text-ink">{idx + 1}</span>
          <span className="text-ink-faint">/ {questions.length}</span>
        </div>
      </div>

      {/* Progress segments */}
      <div className="grid grid-cols-6 gap-1">
        {questions.map((_, i) => {
          const p = picks[i];
          const cls =
            p === null
              ? 'bg-white/[0.05]'
              : questions[i].options[p]?.correct
              ? 'bg-accent-green'
              : 'bg-accent-red';
          return <div key={i} className={`h-1 rounded-full ${cls}`} />;
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="card-base p-6 sm:p-8 space-y-5 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-accent-yellow/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3">
              {current.pivotSpeciesId && (
                <img
                  src={artworkFor(current.pivotSpeciesId)}
                  alt=""
                  className="w-16 h-16 object-contain shrink-0"
                />
              )}
              <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight">
                {current.prompt}
              </h2>
            </div>
            {current.hint && (
              <div className="text-xs text-ink-faint mt-2">{current.hint}</div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 relative">
            {current.options.map((opt, i) => {
              const picked = picks[idx] === i;
              let state: 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim' = 'idle';
              if (reveal) {
                if (picked && opt.correct) state = 'correct';
                else if (picked && !opt.correct) state = 'wrong';
                else if (opt.correct) state = 'reveal';
                else state = 'dim';
              }
              const cls =
                state === 'idle'
                  ? 'border-white/[0.08] glass hover:border-white/[0.20] hover:bg-white/[0.06]'
                  : state === 'correct'
                  ? 'border-accent-green bg-accent-green/15 shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)]'
                  : state === 'wrong'
                  ? 'border-accent-red bg-accent-red/15'
                  : state === 'reveal'
                  ? 'border-accent-green/60 bg-accent-green/10'
                  : 'border-white/[0.05] glass opacity-30';
              return (
                <motion.button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={reveal}
                  whileTap={{ scale: state === 'idle' ? 0.97 : 1 }}
                  animate={state === 'wrong' ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  className={`relative min-h-[60px] rounded-xl border-2 p-3 sm:p-4 transition-colors text-center disabled:cursor-not-allowed flex items-center justify-center gap-2 ${cls}`}
                >
                  <span className="absolute top-1.5 left-2 text-[9px] font-mono font-bold text-ink-faint">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.speciesId && (
                    <img
                      src={artworkFor(opt.speciesId)}
                      alt=""
                      className="w-10 h-10 object-contain shrink-0"
                    />
                  )}
                  <span className="font-display font-bold text-sm sm:text-base">
                    {opt.label}
                  </span>
                  {state === 'correct' && (
                    <CheckIcon className="absolute top-2 right-2 w-4 h-4 text-accent-green" />
                  )}
                  {state === 'wrong' && (
                    <XIcon className="absolute top-2 right-2 w-4 h-4 text-accent-red" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FinishedScreen({
  score,
  total,
  questions,
  picks,
  onBack,
}: {
  score: number;
  total: number;
  questions: MetaQuizQuestion[];
  picks: (number | null)[];
  onBack: () => void;
}) {
  const pct = total > 0 ? (score / total) * 100 : 0;
  const tone =
    pct >= 80
      ? 'text-accent-green'
      : pct >= 50
      ? 'text-accent-yellow'
      : 'text-accent-red';
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/15 via-orange-500/10 to-brand/10" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-accent-yellow/15 blur-3xl" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.25em] text-accent-yellow font-semibold mb-2 inline-flex items-center gap-2">
            <ChartIcon className="w-3.5 h-3.5" />
            Meta Daily · resultado
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight">
            <span className={tone}>{score}</span>
            <span className="text-ink-faint">/{total}</span>
          </h1>
          <div className="text-ink-soft mt-1">{pct.toFixed(0)}% de aciertos</div>
          <Button
            variant="primary"
            size="md"
            onClick={onBack}
            className="mt-6"
          >
            <TrophyIcon className="w-4 h-4" />
            Volver al hub
          </Button>
          <div className="text-[10px] text-ink-faint mt-3">
            Mañana otro reto. Las preguntas usan datos vivos de Pikalytics.
          </div>
        </div>
      </motion.div>

      {/* Recap */}
      {questions.length > 0 && (
        <div className="card-base p-5 space-y-2">
          <h3 className="font-display text-base font-bold flex items-center gap-2 mb-2">
            <FireIcon className="w-4 h-4 text-accent-red" />
            Repaso
          </h3>
          {questions.map((q, i) => {
            const p = picks[i];
            const correctIdx = q.options.findIndex((o) => o.correct);
            const correct = p !== null && q.options[p]?.correct;
            return (
              <div key={i} className="rounded-xl glass p-3 text-sm">
                <div className="font-semibold">{q.prompt}</div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                  <span className="text-ink-faint">Correcto:</span>
                  <span className="text-accent-green font-bold">
                    {q.options[correctIdx]?.label}
                  </span>
                  {!correct && p !== null && (
                    <>
                      <span className="text-ink-faint">·</span>
                      <span className="text-ink-faint">Tu pick:</span>
                      <span className="text-accent-red font-bold">
                        {q.options[p]?.label}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <Link
          href="/typemaster"
          className="text-sm text-ink-faint hover:text-ink inline-flex items-center gap-1"
        >
          ← Volver a TypeMaster
        </Link>
      </div>
    </div>
  );
}

function Splash({ title, description }: { title: string; description: string }) {
  return (
    <div className="card-base p-10 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-accent-yellow/15 text-accent-yellow inline-flex items-center justify-center mb-4">
        <ChartIcon className="w-7 h-7" />
      </div>
      <h2 className="font-display text-2xl font-bold mb-2">{title}</h2>
      <p className="text-ink-dim text-sm mb-6">{description}</p>
      <Link href="/typemaster" className="inline-block">
        <Button variant="primary" size="md">
          Volver al hub
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
