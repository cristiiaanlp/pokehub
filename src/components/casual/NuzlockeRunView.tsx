'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { artworkFor } from '@/lib/pokeapi';
import { formatPokemonName, padId } from '@/lib/utils';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  TrophyIcon,
} from '@/components/ui/Icon';
import {
  useNuzlockeStore,
  type EncounterStatus,
  type NuzlockeRun,
} from '@/stores/nuzlockeStore';

const STATUS_META: Record<EncounterStatus, { label: string; cls: string }> = {
  team: { label: 'En equipo', cls: 'bg-accent-green/15 text-accent-green' },
  box: { label: 'En caja', cls: 'bg-brand/15 text-brand-glow' },
  dead: { label: '💀 Muerto', cls: 'bg-accent-red/15 text-accent-red' },
  released: { label: 'Liberado', cls: 'bg-white/[0.06] text-ink-soft' },
  fled: { label: 'Huyó', cls: 'bg-ink-faint/15 text-ink-dim' },
  failed: { label: 'Fallaste KO', cls: 'bg-accent-red/15 text-accent-red' },
  pending: { label: 'Pendiente', cls: 'bg-accent-yellow/15 text-accent-yellow' },
};

export function NuzlockeRunView({ run }: { run: NuzlockeRun }) {
  const addEnc = useNuzlockeStore((s) => s.addEncounter);
  const updateEnc = useNuzlockeStore((s) => s.updateEncounter);
  const removeEnc = useNuzlockeStore((s) => s.removeEncounter);
  const setBadges = useNuzlockeStore((s) => s.setBadges);
  const endRun = useNuzlockeStore((s) => s.endRun);
  const reviveRun = useNuzlockeStore((s) => s.reviveRun);

  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [newRoute, setNewRoute] = useState('');

  const team = run.encounters.filter((e) => e.status === 'team');
  const dead = run.encounters.filter((e) => e.status === 'dead');
  const box = run.encounters.filter((e) => e.status === 'box');
  const totalCaught = run.encounters.filter((e) =>
    ['team', 'box', 'dead'].includes(e.status)
  ).length;

  const addRoute = () => {
    if (!newRoute.trim()) return;
    addEnc(run.id, {
      route: newRoute.trim(),
      pokemonId: null,
      pokemonName: null,
      status: 'pending',
    });
    setNewRoute('');
  };

  const isEnded = run.endedAt !== null;

  return (
    <div className="space-y-5">
      {/* Run summary */}
      <div className="card-base p-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
        <div className="relative grid sm:grid-cols-[1fr,auto] gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-brand-glow font-bold">
              {run.game}
            </div>
            <h2 className="font-display text-2xl font-bold mt-1">
              {run.name}
            </h2>
            <div className="text-xs text-ink-dim mt-1">
              Empezado{' '}
              {new Date(run.startedAt).toLocaleDateString()}
              {isEnded && (
                <>
                  {' '}
                  · Terminado{' '}
                  {run.endedAt && new Date(run.endedAt).toLocaleDateString()}
                  {run.endedReason && (
                    <span
                      className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                        run.endedReason === 'completed'
                          ? 'bg-accent-green/15 text-accent-green'
                          : run.endedReason === 'wiped'
                          ? 'bg-accent-red/15 text-accent-red'
                          : 'bg-white/[0.06] text-ink-soft'
                      }`}
                    >
                      {run.endedReason}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              <MiniStat label="Equipo" value={`${team.length}/6`} tone="green" />
              <MiniStat label="Caja" value={String(box.length)} tone="blue" />
              <MiniStat label="Muertos" value={String(dead.length)} tone="red" />
              <MiniStat label="Total capturados" value={String(totalCaught)} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">
              Medallas
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBadges(run.id, i + 1 === run.badges ? i : i + 1)}
                  disabled={isEnded}
                  className={`w-7 h-7 rounded-md transition-colors ${
                    i < run.badges
                      ? 'bg-gradient-to-br from-accent-yellow to-orange-500 shadow-glow'
                      : 'bg-white/[0.05] hover:bg-white/[0.10]'
                  }`}
                  aria-label={`Medalla ${i + 1}`}
                />
              ))}
            </div>
            {!isEnded ? (
              <div className="flex gap-1.5 flex-wrap pt-1">
                <button
                  onClick={() => endRun(run.id, 'completed')}
                  className="h-7 px-2.5 inline-flex items-center gap-1 rounded-md bg-accent-green/15 text-accent-green text-[10px] font-bold uppercase tracking-widest hover:bg-accent-green/25"
                >
                  <TrophyIcon className="w-3 h-3" /> Completada
                </button>
                <button
                  onClick={() => endRun(run.id, 'wiped')}
                  className="h-7 px-2.5 rounded-md bg-accent-red/15 text-accent-red text-[10px] font-bold uppercase tracking-widest hover:bg-accent-red/25"
                >
                  💀 Wipe
                </button>
                <button
                  onClick={() => endRun(run.id, 'abandoned')}
                  className="h-7 px-2.5 rounded-md bg-white/[0.06] text-ink-soft text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.12]"
                >
                  Abandonar
                </button>
              </div>
            ) : (
              <button
                onClick={() => reviveRun(run.id)}
                className="h-8 px-3 rounded-md bg-brand/15 text-brand-glow text-xs font-bold hover:bg-brand/25"
              >
                Reactivar run
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active rules */}
      <div className="card-base p-4">
        <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-2">
          Reglas activas
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(run.rules)
            .filter(([, v]) => v)
            .map(([k]) => (
              <span
                key={k}
                className="text-[11px] px-2 h-6 inline-flex items-center rounded-md glass text-ink-soft"
              >
                {RULE_LABELS[k] ?? k}
              </span>
            ))}
        </div>
      </div>

      {/* Add encounter */}
      {!isEnded && (
        <div className="card-base p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-2">
            Añadir ruta
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Ruta 31, Bosque Verde..."
              value={newRoute}
              onChange={(e) => setNewRoute(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRoute()}
              className="flex-1 h-11 px-3 rounded-xl glass text-sm outline-none border border-white/[0.06] focus:border-brand/40 placeholder:text-ink-faint"
            />
            <button
              onClick={addRoute}
              disabled={!newRoute.trim()}
              className="h-11 px-4 inline-flex items-center gap-1.5 rounded-xl bg-brand text-white text-sm font-semibold shadow-glow disabled:opacity-50 hover:bg-brand-hover"
            >
              <PlusIcon className="w-4 h-4" />
              Añadir
            </button>
          </div>
        </div>
      )}

      {/* Encounters list */}
      <div className="space-y-2">
        {run.encounters.length === 0 ? (
          <div className="card-base p-8 text-center text-ink-dim text-sm">
            Aún no hay rutas en esta run. Añade la primera arriba.
          </div>
        ) : (
          <AnimatePresence>
            {run.encounters.map((enc) => (
              <motion.div
                key={enc.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-base p-3 sm:p-4 relative"
              >
                <div className="flex items-center gap-3">
                  {enc.pokemonId ? (
                    <img
                      src={artworkFor(enc.pokemonId)}
                      alt=""
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <button
                      onClick={() => setPickerFor(enc.id)}
                      disabled={isEnded}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-white/[0.1] hover:border-brand/40 flex items-center justify-center text-ink-faint hover:text-brand-glow transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-ink-faint">{enc.route}</div>
                    {enc.pokemonId ? (
                      <>
                        <div className="font-display font-bold truncate">
                          {enc.nickname ||
                            formatPokemonName(enc.pokemonName ?? '')}
                        </div>
                        {enc.nickname && (
                          <div className="text-[11px] text-ink-faint">
                            {formatPokemonName(enc.pokemonName ?? '')} · #
                            {padId(enc.pokemonId)}
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => setPickerFor(enc.id)}
                        disabled={isEnded}
                        className="text-sm font-semibold text-brand-glow hover:text-brand-hover"
                      >
                        Asignar Pokémon
                      </button>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] px-2 h-6 inline-flex items-center rounded-md font-bold uppercase tracking-widest ${
                        STATUS_META[enc.status].cls
                      }`}
                    >
                      {STATUS_META[enc.status].label}
                    </span>
                  </div>
                  <button
                    onClick={() => removeEnc(run.id, enc.id)}
                    disabled={isEnded}
                    className="text-ink-faint hover:text-accent-red shrink-0"
                    aria-label="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                {enc.pokemonId && !isEnded && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <input
                      placeholder="Apodo..."
                      value={enc.nickname ?? ''}
                      onChange={(e) =>
                        updateEnc(run.id, enc.id, { nickname: e.target.value })
                      }
                      className="flex-1 min-w-[160px] h-8 px-2.5 rounded-md glass text-xs outline-none border border-white/[0.06] focus:border-brand/40"
                    />
                    <StatusButton
                      label="Equipo"
                      active={enc.status === 'team'}
                      onClick={() =>
                        updateEnc(run.id, enc.id, { status: 'team' })
                      }
                    />
                    <StatusButton
                      label="Caja"
                      active={enc.status === 'box'}
                      onClick={() =>
                        updateEnc(run.id, enc.id, { status: 'box' })
                      }
                    />
                    <StatusButton
                      label="💀"
                      active={enc.status === 'dead'}
                      onClick={() =>
                        updateEnc(run.id, enc.id, { status: 'dead' })
                      }
                      danger
                    />
                  </div>
                )}
                {!enc.pokemonId && !isEnded && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <StatusButton
                      label="Huyó"
                      active={enc.status === 'fled'}
                      onClick={() =>
                        updateEnc(run.id, enc.id, { status: 'fled' })
                      }
                    />
                    <StatusButton
                      label="KO fallido"
                      active={enc.status === 'failed'}
                      onClick={() =>
                        updateEnc(run.id, enc.id, { status: 'failed' })
                      }
                      danger
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <PokemonSelectModal
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        title="Selecciona el Pokémon capturado"
        onPick={(p) => {
          if (pickerFor) {
            updateEnc(run.id, pickerFor, {
              pokemonId: p.id,
              pokemonName: p.name,
              status: 'team',
            });
            setPickerFor(null);
          }
        }}
      />
    </div>
  );
}

function StatusButton({
  label,
  active,
  onClick,
  danger,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${
        active
          ? danger
            ? 'bg-accent-red text-white'
            : 'bg-ink text-bg-950'
          : 'glass text-ink-soft hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'green' | 'red' | 'blue';
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">
        {label}
      </div>
      <div
        className={`font-display text-xl font-bold ${
          tone === 'green'
            ? 'text-accent-green'
            : tone === 'red'
            ? 'text-accent-red'
            : tone === 'blue'
            ? 'text-brand-glow'
            : 'text-ink'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

const RULE_LABELS: Record<string, string> = {
  dupesClause: 'Dupes clause',
  speciesClause: 'Species clause',
  nicknameRequired: 'Apodo obligatorio',
  shinyClause: 'Shiny clause',
  setMode: 'Set mode',
  noItemsInBattle: 'Sin items en batalla',
  levelCap: 'Level cap',
};

void XIcon;
void CheckIcon;
