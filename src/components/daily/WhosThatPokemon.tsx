'use client';

import { useEffect, useState, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { artworkFor, TOTAL_POKEMON } from '@/lib/pokeapi';
import {
  CheckIcon,
  XIcon,
  FireIcon,
  TrophyIcon,
  ArrowRight,
} from '@/components/ui/Icon';

const STORAGE_KEY = 'pokehub-whos-that-history';
const STATE_KEY = 'pokehub-whos-that-state';

interface DailyState {
  date: string;
  pokemonId: number;
  guesses: string[];
  solved: boolean;
  revealed: boolean;
}

interface PokeIndexEntry {
  id: number;
  name: string;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

// Daily Pokémon es determinista por fecha — todos los users ven el mismo.
// Seed simple basada en hash de la fecha.
function dailyPokemonId(dateISO: string): number {
  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) | 0;
  }
  // Mod a Gen 1-9 (1..1025)
  return (Math.abs(hash) % TOTAL_POKEMON) + 1;
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
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveHistory(dates: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates.slice(-365)));
  } catch {
    /* ignore */
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

export function WhosThatPokemon() {
  const today = todayISO();
  const pokemonId = useMemo(() => dailyPokemonId(today), [today]);
  const [state, setState] = useState<DailyState>(() => {
    const loaded = loadState();
    if (loaded && loaded.pokemonId === pokemonId) return loaded;
    return {
      date: today,
      pokemonId,
      guesses: [],
      solved: false,
      revealed: false,
    };
  });
  const [input, setInput] = useState('');
  const [pokeIndex, setPokeIndex] = useState<PokeIndexEntry[]>([]);
  const [pokemonName, setPokemonName] = useState<string>('');
  const [suggestions, setSuggestions] = useState<PokeIndexEntry[]>([]);
  const [streak, setStreak] = useState(0);

  // Carga el index de Pokémon (cached)
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then((r) => r.json())
      .then((data) => {
        const entries: PokeIndexEntry[] = (data.results ?? []).map(
          (p: any, i: number) => ({
            id: i + 1,
            name: p.name,
          })
        );
        setPokeIndex(entries);
        const target = entries.find((p) => p.id === pokemonId);
        if (target) setPokemonName(target.name);
      })
      .catch(() => {});
  }, [pokemonId]);

  useEffect(() => {
    setStreak(computeStreak(loadHistory()));
  }, [state.solved]);

  // Filtra sugerencias mientras escribe
  useEffect(() => {
    const q = input.trim().toLowerCase();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      pokeIndex
        .filter((p) => p.name.includes(q))
        .slice(0, 5)
    );
  }, [input, pokeIndex]);

  const submit = (guessName: string) => {
    if (!guessName.trim() || state.solved || state.revealed) return;
    const normalized = guessName.trim().toLowerCase();
    if (state.guesses.includes(normalized)) {
      setInput('');
      return;
    }
    const isCorrect = normalized === pokemonName;
    const nextState: DailyState = {
      ...state,
      guesses: [...state.guesses, normalized],
      solved: isCorrect,
    };
    setState(nextState);
    saveState(nextState);
    setInput('');
    setSuggestions([]);

    if (isCorrect) {
      // Añade al history para racha
      const history = loadHistory();
      if (!history.includes(today)) {
        history.push(today);
        saveHistory(history);
      }
    }
  };

  const reveal = () => {
    const nextState = { ...state, revealed: true };
    setState(nextState);
    saveState(nextState);
  };

  const showImage = state.solved || state.revealed;

  return (
    <div className="space-y-5">
      {/* Streak banner */}
      {streak > 0 && (
        <div className="card-base p-3 flex items-center justify-center gap-3 text-sm">
          <FireIcon className="w-4 h-4 text-accent-red" />
          <span className="font-display font-bold text-accent-red tabular-nums">
            {streak} {streak === 1 ? 'día' : 'días'}
          </span>
          <span className="text-ink-dim">seguidos adivinando</span>
        </div>
      )}

      {/* Silueta o reveal */}
      <div className="card-base p-8 flex items-center justify-center min-h-[320px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-brand/15 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-accent-yellow/10 blur-3xl" />
        </div>
        <div className="relative">
          {pokemonId ? (
            <img
              src={artworkFor(pokemonId)}
              alt={showImage ? 'Pokémon' : '???'}
              className={`w-56 h-56 sm:w-64 sm:h-64 object-contain transition-all duration-500 ${
                showImage
                  ? ''
                  : '[filter:brightness(0)_drop-shadow(0_10px_20px_rgba(96,165,250,0.4))]'
              }`}
            />
          ) : (
            <div className="w-56 h-56 animate-pulse bg-white/[0.06] rounded-full" />
          )}
        </div>
      </div>

      {/* Guess input */}
      {!state.solved && !state.revealed && (
        <div className="card-base p-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toLowerCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit(input);
              }}
              placeholder="Escribe tu respuesta (ej: pikachu)…"
              className="w-full h-11 px-4 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-mono"
              autoFocus
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 card-base p-1 z-10 shadow-card-hover">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => submit(s.name)}
                    className="w-full text-left px-3 h-9 rounded hover:bg-white/[0.06] text-sm font-mono flex items-center gap-2"
                  >
                    <span className="text-[10px] text-ink-faint">#{s.id}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => submit(input)}
              disabled={!input.trim()}
              className="h-10 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              Adivinar
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={reveal}
              className="text-xs text-ink-faint hover:text-accent-red"
            >
              Rendirse y revelar
            </button>
          </div>
        </div>
      )}

      {/* Historial intentos */}
      {state.guesses.length > 0 && (
        <div className="space-y-1">
          {state.guesses.map((g, i) => {
            const correct = g === pokemonName;
            return (
              <div
                key={`${g}-${i}`}
                className={`card-base p-2.5 flex items-center gap-3 ${
                  correct
                    ? 'border-accent-green/30 bg-accent-green/[0.05]'
                    : 'border-accent-red/20 bg-accent-red/[0.03]'
                }`}
              >
                <span className="text-xs font-mono text-ink-faint w-7">
                  #{i + 1}
                </span>
                <span className="font-mono text-sm capitalize flex-1">{g}</span>
                {correct ? (
                  <span className="text-accent-green inline-flex items-center gap-1 text-xs font-bold">
                    <CheckIcon className="w-3.5 h-3.5" /> ¡CORRECTO!
                  </span>
                ) : (
                  <XIcon className="w-3.5 h-3.5 text-accent-red" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resultado */}
      {(state.solved || state.revealed) && (
        <div
          className={`card-base p-5 ${
            state.solved
              ? 'border-accent-green/30 bg-accent-green/[0.05]'
              : 'border-accent-red/30 bg-accent-red/[0.05]'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {state.solved ? (
              <span className="w-10 h-10 rounded-full bg-accent-green/20 text-accent-green inline-flex items-center justify-center">
                <TrophyIcon className="w-5 h-5" />
              </span>
            ) : (
              <span className="w-10 h-10 rounded-full bg-accent-red/20 text-accent-red inline-flex items-center justify-center">
                <XIcon className="w-5 h-5" />
              </span>
            )}
            <div>
              <div className="font-display font-bold text-lg">
                {state.solved
                  ? `¡Lo conseguiste en ${state.guesses.length} ${
                      state.guesses.length === 1 ? 'intento' : 'intentos'
                    }!`
                  : 'Sin suerte hoy'}
              </div>
              <div className="text-xs text-ink-dim capitalize">
                Era <strong className="text-ink">{pokemonName}</strong>
              </div>
            </div>
          </div>
          <Link
            href={`/pokedex/${pokemonId}`}
            className="mt-3 text-sm text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
          >
            Ver ficha de {pokemonName}
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
