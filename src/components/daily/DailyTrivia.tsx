'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import {
  CheckIcon,
  XIcon,
  FireIcon,
  TrophyIcon,
  ArrowRight,
  BookOpenIcon,
} from '@/components/ui/Icon';
import { dailyTriviaQuestions, type TriviaQuestion } from '@/lib/trivia-pool';

const STATE_KEY = 'pokehub-trivia-daily-state';
const HISTORY_KEY = 'pokehub-trivia-daily-history';
const QUESTIONS_PER_DAY = 5;

interface DailyState {
  date: string;
  answers: number[]; // chosen index per question, -1 si no contestada
  finished: boolean;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function loadState(): DailyState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyState;
    if (parsed.date !== todayISO()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: DailyState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function loadHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveHistory(dates: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(dates));
  } catch {
    /* ignore */
  }
}

// Racha consecutiva contando hacia atrás desde hoy
function computeStreak(history: string[]): number {
  const set = new Set(history);
  let streak = 0;
  const d = new Date();
  while (true) {
    const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    if (!set.has(iso)) break;
    streak++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return streak;
}

export function DailyTrivia() {
  const date = useMemo(() => todayISO(), []);
  const questions = useMemo(() => dailyTriviaQuestions(date, QUESTIONS_PER_DAY), [date]);

  const [state, setState] = useState<DailyState>(() => ({
    date,
    answers: Array(QUESTIONS_PER_DAY).fill(-1),
    finished: false,
  }));
  const [history, setHistory] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealLast, setRevealLast] = useState<number | null>(null);

  // Hidratar tras mount (evita mismatch SSR)
  useEffect(() => {
    const saved = loadState();
    const hist = loadHistory();
    if (saved) {
      setState(saved);
      // Si ya está terminado, mostramos pantalla final; si no, avanza al primer no-contestado
      const nextIdx = saved.answers.findIndex((a) => a === -1);
      setCurrentIdx(nextIdx === -1 ? QUESTIONS_PER_DAY - 1 : nextIdx);
    }
    setHistory(hist);
    setHydrated(true);
  }, []);

  const answer = (questionIdx: number, optionIdx: number) => {
    if (state.answers[questionIdx] !== -1) return; // ya contestada
    const newAnswers = [...state.answers];
    newAnswers[questionIdx] = optionIdx;
    setRevealLast(questionIdx);
    const finished = newAnswers.every((a) => a !== -1);
    const next: DailyState = { ...state, answers: newAnswers, finished };
    setState(next);
    saveState(next);

    if (finished) {
      // Guardar en racha
      if (!history.includes(date)) {
        const newHist = [...history, date];
        setHistory(newHist);
        saveHistory(newHist);
      }
    }
  };

  const advance = () => {
    if (currentIdx < QUESTIONS_PER_DAY - 1) {
      setCurrentIdx(currentIdx + 1);
      setRevealLast(null);
    }
  };

  const score = state.answers.reduce(
    (acc, a, i) => acc + (a !== -1 && a === questions[i].correctIndex ? 1 : 0),
    0
  );

  const streak = computeStreak(history);
  const currentQ = questions[currentIdx];
  const currentAnswer = state.answers[currentIdx];

  if (!hydrated) {
    return (
      <div className="card-base p-10 text-center text-ink-dim">Cargando…</div>
    );
  }

  // Pantalla final
  if (state.finished) {
    const perfect = score === QUESTIONS_PER_DAY;
    return (
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="card-base p-6 text-center relative overflow-hidden"
        >
          <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
            perfect ? 'bg-accent-yellow/30' : 'bg-brand/20'
          }`} />
          <div className="relative">
            <div className="text-5xl mb-3">{perfect ? '🏆' : score >= 3 ? '🎯' : '📚'}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
              Resultado de hoy
            </div>
            <div className="font-display text-5xl font-bold tabular-nums">
              {score}<span className="text-ink-faint text-3xl">/{QUESTIONS_PER_DAY}</span>
            </div>
            <p className="text-sm text-ink-dim mt-2">
              {perfect
                ? '¡Perfecto! Conoces el meta como nadie.'
                : score >= 3
                ? '¡Bien jugado! Vuelve mañana para mantener la racha.'
                : 'Sigue estudiando — el meta cambia constantemente.'}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <FireIcon className="w-4 h-4 text-accent-yellow" />
              <span className="text-xs font-bold">Racha: {streak} días</span>
            </div>
          </div>
        </motion.div>

        {/* Revisión de respuestas */}
        <div className="space-y-2">
          <h3 className="font-display font-bold text-sm">Revisión</h3>
          {questions.map((q, i) => {
            const userIdx = state.answers[i];
            const correct = userIdx === q.correctIndex;
            return (
              <div key={i} className={`card-base p-3 border-l-4 ${
                correct ? 'border-accent-green' : 'border-accent-red'
              }`}>
                <div className="flex items-start gap-2">
                  {correct ? (
                    <CheckIcon className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                  ) : (
                    <XIcon className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{q.q}</div>
                    <div className="text-xs text-ink-dim mt-1">
                      <span className={correct ? 'text-accent-green' : 'text-accent-red'}>
                        Tu respuesta:
                      </span>{' '}
                      {q.options[userIdx]}
                    </div>
                    {!correct && (
                      <div className="text-xs text-accent-green mt-0.5">
                        Correcta: {q.options[q.correctIndex]}
                      </div>
                    )}
                    <p className="text-xs text-ink-soft mt-1.5 italic">{q.explain}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card-base p-4 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-ink-faint">
            Vuelve mañana — 5 preguntas nuevas cada día.
          </span>
          <Link
            href="/daily"
            className="text-xs font-bold text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
          >
            Otros retos diarios <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Pantalla activa de pregunta
  return (
    <div className="space-y-5">
      {/* Header / progreso */}
      <div className="card-base p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">
            Pregunta
          </div>
          <div className="font-display text-2xl font-bold tabular-nums">
            {currentIdx + 1}
            <span className="text-ink-faint text-base">/{QUESTIONS_PER_DAY}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
            <FireIcon className="w-3.5 h-3.5 text-accent-yellow" />
            Racha {streak}
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
            <TrophyIcon className="w-3.5 h-3.5 text-brand-glow" />
            {score}/{QUESTIONS_PER_DAY}
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand to-brand-glow"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / QUESTIONS_PER_DAY) * 100}%` }}
        />
      </div>

      {/* Pregunta + opciones */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="card-base p-6 space-y-4 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
          <div className="relative space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-brand-glow font-bold">
              {currentQ.category}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug">
              {currentQ.q}
            </h2>

            <div className="grid sm:grid-cols-2 gap-2 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const answered = currentAnswer !== -1;
                const isCorrect = optIdx === currentQ.correctIndex;
                const isChosen = optIdx === currentAnswer;
                let cls =
                  'glass text-ink-soft hover:bg-white/[0.08] hover:text-ink';
                if (answered) {
                  if (isCorrect) cls = 'bg-accent-green/15 text-accent-green ring-2 ring-accent-green/40';
                  else if (isChosen) cls = 'bg-accent-red/15 text-accent-red ring-2 ring-accent-red/40';
                  else cls = 'glass text-ink-faint opacity-60';
                }
                return (
                  <button
                    key={optIdx}
                    disabled={answered}
                    onClick={() => answer(currentIdx, optIdx)}
                    className={`text-left h-auto min-h-[3rem] px-4 py-3 rounded-xl text-sm font-semibold transition-all ${cls}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs opacity-60">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                      {answered && isCorrect && (
                        <CheckIcon className="w-4 h-4 shrink-0" />
                      )}
                      {answered && isChosen && !isCorrect && (
                        <XIcon className="w-4 h-4 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explicación tras responder */}
            {currentAnswer !== -1 && revealLast === currentIdx && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]"
              >
                <div className="flex gap-2 items-start">
                  <BookOpenIcon className="w-4 h-4 text-brand-glow shrink-0 mt-0.5" />
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {currentQ.explain}
                  </p>
                </div>
              </motion.div>
            )}

            {currentAnswer !== -1 && (
              <button
                onClick={advance}
                disabled={currentIdx === QUESTIONS_PER_DAY - 1}
                className="w-full h-11 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-hover shadow-glow disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
              >
                {currentIdx === QUESTIONS_PER_DAY - 1 ? (
                  'Ver resultado'
                ) : (
                  <>
                    Siguiente <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
