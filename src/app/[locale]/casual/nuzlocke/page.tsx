'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/common/PageHeader';
import { NuzlockeRunView } from '@/components/casual/NuzlockeRunView';
import {
  useNuzlockeStore,
  NUZLOCKE_GAMES,
  DEFAULT_RULES,
  type NuzlockeRules,
} from '@/stores/nuzlockeStore';
import {
  PlusIcon,
  TargetIcon,
  ArrowRight,
  TrashIcon,
  CheckIcon,
} from '@/components/ui/Icon';

export default function NuzlockePage() {
  const runs = useNuzlockeStore((s) => s.runs);
  const activeRunId = useNuzlockeStore((s) => s.activeRunId);
  const setActive = useNuzlockeStore((s) => s.setActive);
  const createRun = useNuzlockeStore((s) => s.createRun);
  const deleteRun = useNuzlockeStore((s) => s.deleteRun);

  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftGame, setDraftGame] = useState(NUZLOCKE_GAMES[0]);
  const [draftRules, setDraftRules] = useState<NuzlockeRules>(DEFAULT_RULES);

  const activeRun = runs.find((r) => r.id === activeRunId);

  const start = () => {
    if (!draftName.trim()) return;
    createRun({
      name: draftName.trim(),
      game: draftGame,
      rules: draftRules,
    });
    setDraftName('');
    setDraftRules(DEFAULT_RULES);
    setCreating(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <PageHeader
        kicker="Modo Casual · Nuzlocke Helper"
        title={
          <>
            Lleva tu <span className="gradient-text">nuzlocke</span> sin
            spreadsheets
          </>
        }
        subtitle="Crea runs, registra encuentros por ruta, marca muertes y haz que cada cazado tenga su lápida o trofeo."
        right={
          <Link href="/casual" className="text-sm text-ink-faint hover:text-ink">
            ← Volver a Casual
          </Link>
        }
      />

      {/* Runs list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <TargetIcon className="w-5 h-5 text-accent-red" />
            Tus runs
          </h2>
          <button
            onClick={() => setCreating((v) => !v)}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-wider shadow-glow hover:bg-brand-hover"
          >
            <PlusIcon className="w-4 h-4" />
            Nueva run
          </button>
        </div>

        <AnimatePresence>
          {creating && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="card-base p-5 space-y-3 overflow-hidden"
            >
              <input
                type="text"
                placeholder="Nombre de la run..."
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full h-11 px-3 rounded-xl glass text-sm outline-none border border-white/[0.06] focus:border-brand/40"
                autoFocus
              />
              <select
                value={draftGame}
                onChange={(e) => setDraftGame(e.target.value)}
                className="w-full h-11 px-3 rounded-xl glass text-sm font-semibold bg-bg-900 border border-white/[0.06] outline-none"
              >
                {NUZLOCKE_GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-2">
                  Reglas
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {Object.entries(draftRules).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() =>
                        setDraftRules((d) => ({
                          ...d,
                          [k]: !v,
                        }))
                      }
                      className={`h-9 px-3 inline-flex items-center justify-between gap-2 rounded-lg text-sm transition-colors ${
                        v
                          ? 'bg-brand/15 text-brand-glow'
                          : 'glass text-ink-soft hover:text-ink'
                      }`}
                    >
                      <span>{RULE_LABELS[k] ?? k}</span>
                      {v && <CheckIcon className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => setCreating(false)}
                  className="h-10 px-4 rounded-lg glass text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  Cancelar
                </button>
                <button
                  onClick={start}
                  disabled={!draftName.trim()}
                  className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand to-brand-glow text-white text-sm font-bold disabled:opacity-50 shadow-glow"
                >
                  Empezar run
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {runs.length === 0 && !creating ? (
          <div className="card-base p-10 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-accent-red/15 text-accent-red inline-flex items-center justify-center mb-3">
              <TargetIcon className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold">
              Aún no tienes runs
            </h3>
            <p className="text-sm text-ink-dim mt-1.5 mb-5">
              Crea tu primera run para empezar a registrar encuentros. Cada
              cosa que cuente — vidas, muertes, medallas — vive aquí.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="h-11 px-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-white text-sm font-bold shadow-glow"
            >
              <PlusIcon className="w-4 h-4" />
              Crear mi primera run
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {runs.map((r) => {
              const isActive = r.id === activeRunId;
              const isEnded = r.endedAt !== null;
              const team = r.encounters.filter((e) => e.status === 'team').length;
              const dead = r.encounters.filter((e) => e.status === 'dead').length;
              return (
                <button
                  key={r.id}
                  onClick={() => setActive(r.id)}
                  className={`group text-left p-4 rounded-xl transition-colors relative ${
                    isActive
                      ? 'bg-brand/15 border border-brand/30'
                      : 'glass hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-display font-bold truncate flex-1 min-w-0">
                      {r.name}
                    </div>
                    {isEnded && (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest ml-2 ${
                          r.endedReason === 'completed'
                            ? 'text-accent-green'
                            : 'text-accent-red'
                        }`}
                      >
                        {r.endedReason}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-faint truncate mt-0.5">
                    {r.game}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-accent-green">
                      {team} en equipo
                    </span>
                    {dead > 0 && (
                      <span className="text-accent-red">💀 {dead}</span>
                    )}
                    <span className="text-ink-faint">
                      {r.badges}/8 medallas
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('¿Eliminar esta run?')) deleteRun(r.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-ink-faint hover:text-accent-red transition-opacity"
                    aria-label="Eliminar"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active run details */}
      {activeRun && (
        <motion.section
          key={activeRun.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-glow animate-pulse" />
            Run activa
          </div>
          <NuzlockeRunView run={activeRun} />
        </motion.section>
      )}
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
