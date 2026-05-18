'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { artworkFor, shinyArtworkFor } from '@/lib/pokeapi';
import { formatPokemonName, padId } from '@/lib/utils';
import {
  SparklesIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
} from '@/components/ui/Icon';
import { useShinyStore, type ShinyHunt } from '@/stores/shinyStore';
import { SHINY_METHODS, denominatorFor, cumulativeProb, encountersForProb, formatOdds } from '@/lib/shiny/odds';

interface Props {
  hunt: ShinyHunt;
}

export function HuntCard({ hunt }: Props) {
  const increment = useShinyStore((s) => s.increment);
  const decrement = useShinyStore((s) => s.decrement);
  const setMethod = useShinyStore((s) => s.setMethod);
  const setCharm = useShinyStore((s) => s.setCharm);
  const markFound = useShinyStore((s) => s.markFound);
  const del = useShinyStore((s) => s.deleteHunt);
  const reset = useShinyStore((s) => s.resetEncounters);

  const [step, setStep] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [nickname, setNickname] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const method =
    SHINY_METHODS.find((m) => m.id === hunt.methodId) ?? SHINY_METHODS[0];
  const denom = denominatorFor(method, hunt.shinyCharm);
  const cumPct = cumulativeProb(hunt.encounters, denom) * 100;
  const halfway = encountersForProb(0.5, denom);
  const found = hunt.foundAt !== null;

  return (
    <motion.div
      layout
      className={`card-base relative overflow-hidden ${
        found ? 'border-accent-yellow/40 bg-accent-yellow/5' : ''
      }`}
    >
      {found && (
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-accent-yellow/20 blur-3xl pointer-events-none" />
      )}
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={
                found
                  ? shinyArtworkFor(hunt.pokemonId)
                  : artworkFor(hunt.pokemonId)
              }
              alt={hunt.pokemonName}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = artworkFor(
                  hunt.pokemonId
                );
              }}
            />
            {found && (
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-accent-yellow to-orange-500 text-bg-950 flex items-center justify-center shadow-glow"
              >
                <SparklesIcon className="w-5 h-5" />
              </motion.div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-ink-faint">
              #{padId(hunt.pokemonId)}
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-display text-xl sm:text-2xl font-bold">
                {hunt.nickname || formatPokemonName(hunt.pokemonName)}
              </h3>
              {hunt.nickname && (
                <span className="text-xs text-ink-faint">
                  ({formatPokemonName(hunt.pokemonName)})
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-ink-dim">
              {method.label}
              {hunt.shinyCharm && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-yellow/15 text-accent-yellow uppercase tracking-wider">
                  charm
                </span>
              )}
              <span className="ml-1.5 text-ink-faint">
                · {formatOdds(denom)}
              </span>
            </div>
            {!found && (
              <>
                <div className="mt-3 flex items-baseline gap-3">
                  <div className="font-display text-4xl sm:text-5xl font-bold tabular-nums">
                    {hunt.encounters.toLocaleString()}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-ink-faint">
                    Encuentros
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-ink-dim">
                      Probabilidad acumulada
                    </span>
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        cumPct >= 50
                          ? 'text-accent-green'
                          : cumPct >= 25
                          ? 'text-accent-yellow'
                          : 'text-ink-soft'
                      }`}
                    >
                      {cumPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: `${Math.min(cumPct, 100)}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full bg-gradient-to-r from-brand to-accent-yellow"
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-ink-faint">
                    Mediana (50%): ~{halfway.toLocaleString()} encuentros
                  </div>
                </div>
              </>
            )}
            {found && (
              <div className="mt-3 text-sm text-accent-yellow font-bold">
                ¡Encontrado! · {hunt.encounters.toLocaleString()} encuentros
                en {Math.round((hunt.foundAt! - hunt.startedAt) / 86400000)}d
              </div>
            )}
          </div>
        </div>

        {!found && (
          <>
            <div className="mt-5 grid grid-cols-[1fr,auto,1fr] gap-2 items-stretch">
              <button
                onClick={() => decrement(hunt.id, step)}
                className="h-12 inline-flex items-center justify-center rounded-xl glass hover:bg-white/[0.06] text-ink-soft text-lg font-bold active:scale-[0.97] transition-transform"
                aria-label="Restar"
              >
                −{step}
              </button>
              <select
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
                className="h-12 px-3 rounded-xl glass text-sm font-semibold text-ink bg-bg-900 outline-none border border-white/[0.06]"
                aria-label="Cantidad por click"
              >
                <option value={1}>+1</option>
                <option value={5}>+5</option>
                <option value={10}>+10</option>
                <option value={25}>+25</option>
                <option value={100}>+100</option>
              </select>
              <button
                onClick={() => increment(hunt.id, step)}
                className="h-12 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-glow text-white text-lg font-bold shadow-glow active:scale-[0.97] transition-transform"
                aria-label="Sumar"
              >
                +{step}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setShowSettings((v) => !v)}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg glass text-xs font-semibold text-ink-soft hover:text-ink"
              >
                ⚙️ Método y opciones
              </button>
              <input
                type="text"
                placeholder="Nombre / mote"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-9 px-3 rounded-lg glass text-sm flex-1 min-w-0 outline-none border border-white/[0.06] focus:border-brand/40 placeholder:text-ink-faint"
              />
              <button
                onClick={() => markFound(hunt.id, nickname)}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-accent-yellow text-bg-950 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                ¡Lo tengo!
              </button>
            </div>

            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl glass space-y-2"
              >
                <label className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft font-semibold">
                    Shiny Charm
                  </span>
                  <button
                    onClick={() => setCharm(hunt.id, !hunt.shinyCharm)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      hunt.shinyCharm ? 'bg-accent-yellow' : 'bg-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        hunt.shinyCharm ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </label>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1.5">
                    Método
                  </div>
                  <select
                    value={hunt.methodId}
                    onChange={(e) => setMethod(hunt.id, e.target.value)}
                    className="w-full h-10 px-3 rounded-lg glass text-sm font-semibold bg-bg-900 border border-white/[0.06] outline-none"
                  >
                    {SHINY_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-[11px] text-ink-faint leading-snug">
                    {method.description}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => reset(hunt.id)}
                    className="text-xs text-ink-faint hover:text-ink-soft"
                  >
                    Resetear contador
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}

        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
          <div className="text-[10px] text-ink-faint">
            Iniciado{' '}
            {new Date(hunt.startedAt).toLocaleDateString()}
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-accent-red font-semibold">¿Eliminar?</span>
              <button
                onClick={() => del(hunt.id)}
                className="px-2 py-1 rounded bg-accent-red text-white font-bold uppercase tracking-wider"
              >
                Sí
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded bg-white/[0.06] text-ink-soft"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-ink-faint hover:text-accent-red"
              aria-label="Eliminar hunt"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function NewHuntButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card-base p-6 w-full flex flex-col items-center justify-center gap-2 text-ink-soft hover:text-ink hover:bg-white/[0.06] border-dashed border-white/[0.1] hover:border-brand/40 transition-colors min-h-[180px]"
    >
      <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand-glow flex items-center justify-center">
        <PlusIcon className="w-5 h-5" />
      </div>
      <div className="font-display font-bold">Empezar nueva hunt</div>
      <div className="text-xs text-ink-faint">
        Elige Pokémon · método · go
      </div>
    </button>
  );
}

export function FoundIndicator() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 h-6 rounded-md bg-accent-yellow/15 text-accent-yellow text-[10px] font-bold uppercase tracking-widest">
      <CheckIcon className="w-3 h-3" />
      Capturado
    </div>
  );
}
