'use client';

import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { typeChecks, getSpecificCounters } from '@/lib/meta/counters';
import type { PokemonType } from '@/types/pokemon';
import { artworkFor } from '@/lib/pokeapi';
import { ShieldIcon, SwordIcon, TargetIcon } from '@/components/ui/Icon';

interface Props {
  speciesId: number;
  types: PokemonType[];
}

export function CountersView({ speciesId, types }: Props) {
  const checks = typeChecks(types);
  const specific = getSpecificCounters(speciesId);

  // Sort: those that hit back (best) first, then by defendsBest ascending
  const sortedChecks = [...checks].sort((a, b) => {
    if (a.hitsBack && !b.hitsBack) return -1;
    if (!a.hitsBack && b.hitsBack) return 1;
    return a.defendsBest - b.defendsBest;
  });

  const hitsBack = sortedChecks.filter((c) => c.hitsBack !== null);
  const safeSwitchIns = sortedChecks.filter((c) => c.hitsBack === null);

  return (
    <div className="space-y-5">
      {specific.length > 0 && (
        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold flex items-center gap-2">
            <TargetIcon className="w-4 h-4 text-accent-red" />
            Counters específicos
          </h3>
          <p className="text-xs text-ink-dim mt-1 mb-4">
            Pokémon que históricamente han controlado a este. Datos curados del
            meta actual.
          </p>
          <div className="flex gap-3 flex-wrap">
            {specific.map((id) => (
              <Link
                key={id}
                href={`/pokedex/${id}`}
                className="group flex flex-col items-center gap-1 p-3 rounded-xl glass hover:bg-white/[0.06] transition-colors"
              >
                <img
                  src={artworkFor(id)}
                  alt=""
                  className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card-base p-5">
        <h3 className="font-display text-base font-bold flex items-center gap-2">
          <SwordIcon className="w-4 h-4 text-accent-yellow" />
          Tipos que hit-back + resisten
        </h3>
        <p className="text-xs text-ink-dim mt-1 mb-4">
          Tipos que toman ≤ 1× de sus STABs y golpean super-eficaz a uno de
          ellos.
        </p>
        {hitsBack.length === 0 ? (
          <div className="text-sm text-ink-dim text-center py-4">
            Ningún tipo defiende y golpea de vuelta — Pokémon ofensivo difícil.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {hitsBack.map((c, i) => (
              <motion.div
                key={c.type}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl glass"
              >
                <TypeBadge type={c.type} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-ink-dim">
                    Toma{' '}
                    <span
                      className={
                        c.defendsBest === 0
                          ? 'text-accent-green font-bold'
                          : c.defendsBest <= 0.5
                          ? 'text-accent-green'
                          : 'text-ink'
                      }
                    >
                      {c.defendsBest === 0 ? '0×' : `${c.defendsBest}×`}
                    </span>{' '}
                    · golpea{' '}
                    <span className="text-accent-yellow font-bold uppercase">
                      {c.hitsBack}
                    </span>{' '}
                    super-eficaz
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="card-base p-5">
        <h3 className="font-display text-base font-bold flex items-center gap-2">
          <ShieldIcon className="w-4 h-4 text-brand-glow" />
          Switch-ins seguros
        </h3>
        <p className="text-xs text-ink-dim mt-1 mb-4">
          Tipos que resisten todos sus STABs pero no devuelven daño extra.
        </p>
        {safeSwitchIns.length === 0 ? (
          <div className="text-sm text-ink-dim text-center py-4">
            No hay tipos que resistan todos los STABs.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {safeSwitchIns.map((c) => (
              <div key={c.type} className="relative">
                <TypeBadge type={c.type} size="sm" />
                <span className="absolute -bottom-1 -right-1 text-[9px] px-1 rounded bg-bg-900 text-ink-faint font-mono">
                  {c.defendsBest === 0 ? '0×' : `${c.defendsBest}×`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
