'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  TrophyIcon,
  SaveIcon,
  CheckIcon,
} from '@/components/ui/Icon';
import { artworkFor } from '@/lib/pokeapi';
import {
  type SampleTeam,
  teamToShowdown,
} from '@/lib/champions/data';
import { resolveSmogonName } from '@/lib/meta/name-resolver';

interface Props {
  team: SampleTeam;
  expanded?: boolean;
}

const ARCHETYPE_COLOR: Record<string, string> = {
  'Hyper Offense': '#EF4444',
  Balance: '#3B82F6',
  Stall: '#10B981',
  Rain: '#60A5FA',
  Sun: '#FACC15',
  'Sun Offense': '#FACC15',
  Sand: '#A8A878',
  'Trick Room': '#A855F7',
};

export function TeamCard({ team, expanded: defaultExpanded = false }: Props) {
  const [open, setOpen] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const accent = ARCHETYPE_COLOR[team.archetype] ?? '#3B82F6';

  const copyShowdown = async () => {
    try {
      await navigator.clipboard.writeText(teamToShowdown(team));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      layout
      className="card-base overflow-hidden"
    >
      <div className="relative p-5 sm:p-6">
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-25 blur-2xl pointer-events-none"
          style={{ background: accent }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span
                className="font-bold uppercase tracking-widest px-2 py-1 rounded-md"
                style={{ background: `${accent}25`, color: accent }}
              >
                {team.archetype}
              </span>
              <span className="text-ink-faint">·</span>
              <span className="text-ink-dim">
                {team.format === 'reg-ma'
                  ? 'Pokémon Champions · Reg M-A'
                  : team.format === 'gen9vgc'
                  ? 'SV VGC'
                  : 'SV OU'}
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold mt-2">
              {team.name}
            </h3>
            <div className="text-sm text-ink-dim mt-1 flex items-center gap-1.5 flex-wrap">
              <TrophyIcon className="w-3.5 h-3.5 text-accent-yellow" />
              {team.author}
              <span className="text-ink-faint">·</span>
              <span>{team.tournament}</span>
              <span className="text-ink-faint">·</span>
              <span className="text-ink-faint">{team.date}</span>
            </div>
            {team.description && (
              <p className="text-sm text-ink-soft mt-2 leading-relaxed max-w-2xl">
                {team.description}
              </p>
            )}

            {/* Team members preview */}
            <div className="mt-4 flex gap-1 sm:gap-2 flex-wrap">
              {team.members.map((m, i) => {
                const id = m.speciesId ?? resolveSmogonName(m.name);
                return (
                  <div
                    key={i}
                    className="relative group/icon"
                    title={m.name}
                  >
                    {id ? (
                      <Link href={`/pokedex/${id}`}>
                        <img
                          src={artworkFor(id)}
                          alt={m.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg bg-white/[0.03] group-hover/icon:scale-110 transition-transform"
                          loading="lazy"
                        />
                      </Link>
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/[0.04] flex items-center justify-center text-[8px] text-ink-faint text-center p-1">
                        {m.name}
                      </div>
                    )}
                    {m.item && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent-yellow/30 ring-2 ring-bg-900" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:w-44 sm:shrink-0">
            <button
              onClick={() => setOpen((v) => !v)}
              className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl glass-strong hover:bg-white/[0.10] text-sm font-semibold text-ink"
            >
              {open ? 'Ocultar detalles' : 'Ver detalles'}
              <ArrowRight
                className={`w-4 h-4 transition-transform ${
                  open ? 'rotate-90' : ''
                }`}
              />
            </button>
            <button
              onClick={copyShowdown}
              className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold shadow-glow"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Copiado
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Export Showdown
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="p-5 sm:p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {team.members.map((m, i) => {
                const id = m.speciesId ?? resolveSmogonName(m.name);
                return (
                  <div key={i} className="glass rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      {id ? (
                        <img
                          src={artworkFor(id)}
                          alt={m.name}
                          className="w-10 h-10 object-contain shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-white/[0.04] shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm truncate">
                          {m.name}
                        </div>
                        {m.item && (
                          <div className="text-[10px] text-accent-yellow truncate">
                            @ {m.item}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-ink-dim space-y-0.5">
                      {m.ability && (
                        <div>
                          <span className="text-ink-faint">Hab:</span>{' '}
                          <span className="text-ink-soft">{m.ability}</span>
                        </div>
                      )}
                      {m.nature && (
                        <div>
                          <span className="text-ink-faint">Nat:</span>{' '}
                          <span className="text-ink-soft">{m.nature}</span>
                        </div>
                      )}
                      {m.teraType && (
                        <div>
                          <span className="text-ink-faint">Tera:</span>{' '}
                          <span className="text-ink-soft">{m.teraType}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                      {m.moves.map((mv) => (
                        <div
                          key={mv}
                          className="px-2 py-1 rounded-md bg-white/[0.04] text-ink-soft truncate"
                          title={mv}
                        >
                          {mv}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
