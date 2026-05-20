'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { artworkFor } from '@/lib/pokeapi';
import { WORDLE_WORDS } from '@/lib/daily/wordle-words';
import {
  FireIcon,
  TrophyIcon,
  XIcon,
  ArrowRight,
  CheckIcon,
} from '@/components/ui/Icon';

const STORAGE_KEY = 'pokehub-wordle-history';
const STATE_KEY = 'pokehub-wordle-state';
const MAX_GUESSES = 6;

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface WordleState {
  date: string;
  word: string;
  guesses: string[];
  solved: boolean;
  failed: boolean;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function dailyWordleIndex(dateISO: string): number {
  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % WORDLE_WORDS.length;
}

function evalGuess(guess: string, word: string): LetterState[] {
  const result: LetterState[] = Array(word.length).fill('absent');
  const wordLetters = word.split('');
  const guessLetters = guess.split('');

  // Primera pasada: aciertos exactos
  for (let i = 0; i < guess.length; i++) {
    if (guessLetters[i] === wordLetters[i]) {
      result[i] = 'correct';
      wordLetters[i] = '*'; // marca como usada
    }
  }
  // Segunda pasada: present (letra correcta, posición incorrecta)
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = wordLetters.indexOf(guessLetters[i]);
    if (idx !== -1) {
      result[i] = 'present';
      wordLetters[idx] = '*';
    }
  }
  return result;
}

function loadState(): WordleState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WordleState;
    if (parsed.date !== todayISO()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: WordleState) {
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
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveHistory(dates: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates.slice(-365)));
  } catch {
    /* */
  }
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = Array.from(new Set(dates)).sort();
  const last = sorted[sorted.length - 1];
  const today = todayISO();
  const dayDiff =
    (new Date(today).getTime() - new Date(last).getTime()) /
    (1000 * 60 * 60 * 24);
  if (dayDiff > 1) return 0;
  let streak = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    const a = new Date(sorted[i + 1]);
    const b = new Date(sorted[i]);
    if ((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24) === 1) streak++;
    else break;
  }
  return streak;
}

const KEYBOARD_ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['ENTER', ...'ZXCVBNM'.split(''), '⌫'],
];

export function PokeWordle() {
  const today = todayISO();
  const wordIdx = useMemo(() => dailyWordleIndex(today), [today]);
  const target = WORDLE_WORDS[wordIdx];
  const wordLength = target.name.length;

  const [state, setState] = useState<WordleState>(() => {
    const loaded = loadState();
    if (loaded && loaded.word === target.name) return loaded;
    return {
      date: today,
      word: target.name,
      guesses: [],
      solved: false,
      failed: false,
    };
  });
  const [current, setCurrent] = useState('');
  const [streak, setStreak] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    setStreak(computeStreak(loadHistory()));
  }, [state.solved]);

  // Letter color tracking para el keyboard
  const letterStates = useMemo(() => {
    const map: Record<string, LetterState> = {};
    for (const g of state.guesses) {
      const evals = evalGuess(g, target.name);
      for (let i = 0; i < g.length; i++) {
        const cur = map[g[i]];
        const next = evals[i];
        // Promote only: correct > present > absent
        if (next === 'correct') map[g[i]] = 'correct';
        else if (next === 'present' && cur !== 'correct') map[g[i]] = 'present';
        else if (!cur) map[g[i]] = 'absent';
      }
    }
    return map;
  }, [state.guesses, target.name]);

  const isGameOver = state.solved || state.failed;

  const submit = () => {
    if (current.length !== wordLength || isGameOver) {
      setShakeKey((k) => k + 1);
      return;
    }
    const guess = current.toUpperCase();
    const newGuesses = [...state.guesses, guess];
    const isCorrect = guess === target.name;
    const isExhausted = newGuesses.length >= MAX_GUESSES;

    const next: WordleState = {
      ...state,
      guesses: newGuesses,
      solved: isCorrect,
      failed: !isCorrect && isExhausted,
    };
    setState(next);
    saveState(next);
    setCurrent('');

    if (isCorrect) {
      const history = loadHistory();
      if (!history.includes(today)) {
        history.push(today);
        saveHistory(history);
      }
    }
  };

  const onKey = (key: string) => {
    if (isGameOver) return;
    if (key === 'ENTER') return submit();
    if (key === '⌫' || key === 'BACKSPACE') {
      setCurrent((c) => c.slice(0, -1));
      return;
    }
    if (/^[A-Z]$/.test(key) && current.length < wordLength) {
      setCurrent((c) => c + key);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === 'ENTER' || k === 'BACKSPACE' || /^[A-Z]$/.test(k)) {
        onKey(k);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, state]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Render rows
  const rows: string[] = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < state.guesses.length) rows.push(state.guesses[i]);
    else if (i === state.guesses.length && !isGameOver) rows.push(current.padEnd(wordLength, ' '));
    else rows.push(' '.repeat(wordLength));
  }

  return (
    <div className="space-y-4">
      {streak > 0 && (
        <div className="card-base p-2.5 flex items-center justify-center gap-2 text-sm">
          <FireIcon className="w-4 h-4 text-accent-red" />
          <span className="font-display font-bold text-accent-red tabular-nums">
            {streak}
          </span>
          <span className="text-ink-dim text-xs">racha</span>
        </div>
      )}

      <div className="text-center text-xs text-ink-faint">
        Adivina un Pokémon de <strong className="text-ink">{wordLength} letras</strong>
      </div>

      {/* Grid */}
      <div
        key={shakeKey}
        className="space-y-1.5 flex flex-col items-center"
      >
        {rows.map((row, i) => {
          const isCurrentRow = i === state.guesses.length && !isGameOver;
          const isPastRow = i < state.guesses.length;
          const evals = isPastRow ? evalGuess(row, target.name) : null;
          return (
            <div
              key={i}
              className={`flex gap-1.5 ${
                isCurrentRow && shakeKey > 0 && current.length !== wordLength
                  ? 'animate-shake'
                  : ''
              }`}
            >
              {Array.from({ length: wordLength }).map((_, j) => {
                const ch = row[j] ?? ' ';
                const e = evals?.[j];
                const bg =
                  e === 'correct'
                    ? 'bg-accent-green/80 border-accent-green'
                    : e === 'present'
                    ? 'bg-accent-yellow/80 border-accent-yellow text-bg-950'
                    : e === 'absent'
                    ? 'bg-bg-800 border-white/[0.08] text-ink-faint'
                    : 'border-white/[0.10]';
                return (
                  <div
                    key={j}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-md border-2 flex items-center justify-center text-xl font-display font-bold uppercase ${bg}`}
                  >
                    {ch.trim()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Keyboard */}
      {!isGameOver && (
        <div className="space-y-1.5">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1">
              {row.map((k) => {
                const ls = letterStates[k];
                const bg =
                  ls === 'correct'
                    ? 'bg-accent-green text-white'
                    : ls === 'present'
                    ? 'bg-accent-yellow text-bg-950'
                    : ls === 'absent'
                    ? 'bg-bg-800 text-ink-faint'
                    : 'glass';
                const wide = k === 'ENTER' || k === '⌫';
                return (
                  <button
                    key={k}
                    onClick={() => onKey(k)}
                    className={`h-10 sm:h-11 rounded-md font-bold text-xs ${bg} ${
                      wide ? 'px-2.5 sm:px-3' : 'w-7 sm:w-8'
                    } active:scale-95 transition-transform`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Resultado */}
      {isGameOver && (
        <div
          className={`card-base p-5 text-center ${
            state.solved
              ? 'border-accent-green/30 bg-accent-green/[0.05]'
              : 'border-accent-red/30 bg-accent-red/[0.05]'
          }`}
        >
          {state.solved ? (
            <>
              <TrophyIcon className="w-8 h-8 text-accent-green mx-auto mb-2" />
              <div className="font-display font-bold text-lg">
                ¡Resuelto en {state.guesses.length}/{MAX_GUESSES}!
              </div>
            </>
          ) : (
            <>
              <XIcon className="w-8 h-8 text-accent-red mx-auto mb-2" />
              <div className="font-display font-bold text-lg">
                Sin suerte hoy
              </div>
              <div className="text-sm text-ink-dim mt-1">
                Era <strong className="text-ink">{target.name}</strong>
              </div>
            </>
          )}
          <img
            src={artworkFor(target.id)}
            alt={target.name}
            className="w-32 h-32 mx-auto object-contain my-3"
          />
          <Link
            href={`/pokedex/${target.id}`}
            className="text-sm text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
          >
            Ver ficha
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <p className="text-[10px] text-ink-faint mt-3">
            Vuelve mañana — Pokémon nuevo cada 24h (UTC).
          </p>
        </div>
      )}
    </div>
  );
}
