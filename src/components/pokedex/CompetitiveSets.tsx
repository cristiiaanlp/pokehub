'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getSetsFor, getPartnersFor, type PokemonSet } from '@/lib/meta/sets';
import { Button } from '@/components/ui/Button';
import { CheckIcon, SaveIcon, BookOpenIcon } from '@/components/ui/Icon';
import { artworkFor } from '@/lib/pokeapi';
import Link from 'next/link';

interface Props {
  speciesId: number;
}

function setToShowdown(set: PokemonSet): string {
  const lines: string[] = [];
  lines.push(`${set.name}${set.item ? ` @ ${set.item}` : ''}`);
  if (set.ability) lines.push(`Ability: ${set.ability}`);
  if (set.teraType) lines.push(`Tera Type: ${set.teraType}`);
  if (set.evs) {
    const evParts: string[] = [];
    if (set.evs.hp) evParts.push(`${set.evs.hp} HP`);
    if (set.evs.atk) evParts.push(`${set.evs.atk} Atk`);
    if (set.evs.def) evParts.push(`${set.evs.def} Def`);
    if (set.evs.spa) evParts.push(`${set.evs.spa} SpA`);
    if (set.evs.spd) evParts.push(`${set.evs.spd} SpD`);
    if (set.evs.spe) evParts.push(`${set.evs.spe} Spe`);
    if (evParts.length) lines.push(`EVs: ${evParts.join(' / ')}`);
  }
  if (set.nature) lines.push(`${set.nature} Nature`);
  for (const m of set.moves) lines.push(`- ${m}`);
  return lines.join('\n');
}

export function CompetitiveSets({ speciesId }: Props) {
  const sets = getSetsFor(speciesId);
  const partners = getPartnersFor(speciesId);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (sets.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <BookOpenIcon className="w-8 h-8 text-ink-faint mx-auto mb-3" />
        <div className="font-semibold text-ink-dim">
          Sin sets curados todavía para este Pokémon
        </div>
        <p className="text-sm text-ink-faint mt-1.5 max-w-md mx-auto">
          Estamos curando sets competitivos del top 30 del meta actual.
          Próximamente añadiremos generación con IA para cualquier Pokémon.
        </p>
      </div>
    );
  }

  const copy = async (set: PokemonSet, idx: number) => {
    try {
      await navigator.clipboard.writeText(setToShowdown(set));
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {sets.map((set, idx) => (
          <motion.div
            key={set.setName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card-base p-5 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-brand-glow font-bold">
                  Set competitivo · SV OU
                </div>
                <h3 className="font-display text-lg font-bold mt-1">
                  {set.setName}
                </h3>
                <p className="text-sm text-ink-dim mt-1.5 max-w-2xl">
                  {set.description}
                </p>
              </div>
              <Button
                size="sm"
                variant={copiedIdx === idx ? 'primary' : 'secondary'}
                onClick={() => copy(set, idx)}
              >
                {copiedIdx === idx ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-3.5 h-3.5" />
                    Showdown
                  </>
                )}
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1 text-sm">
                {set.item && (
                  <KV label="Objeto" value={set.item} accent="text-accent-yellow" />
                )}
                {set.ability && (
                  <KV label="Habilidad" value={set.ability} />
                )}
                {set.nature && <KV label="Naturaleza" value={set.nature} />}
                {set.teraType && (
                  <KV label="Tera Type" value={set.teraType} accent="text-brand-glow" />
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1.5">
                  EVs
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {set.evs &&
                    Object.entries(set.evs).map(([k, v]) =>
                      v ? (
                        <div
                          key={k}
                          className="px-2 py-1 rounded-md bg-white/[0.04] flex items-center justify-between"
                        >
                          <span className="text-ink-faint uppercase">
                            {k}
                          </span>
                          <span className="font-mono font-bold">{v}</span>
                        </div>
                      ) : null
                    )}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.05]">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-2">
                Movimientos
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {set.moves.map((m) => (
                  <div
                    key={m}
                    className="px-3 py-2 rounded-lg glass text-sm capitalize text-center"
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {partners.length > 0 && (
        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold mb-1">
            Compañeros frecuentes
          </h3>
          <p className="text-xs text-ink-dim mb-4">
            Pokémon que suelen verse con éste en equipos competitivos.
          </p>
          <div className="flex gap-3 flex-wrap">
            {partners.map((id) => (
              <Link
                key={id}
                href={`/pokedex/${id}`}
                className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl glass hover:bg-white/[0.06] transition-colors"
              >
                <img
                  src={artworkFor(id)}
                  alt={`Partner ${id}`}
                  className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KV({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg glass">
      <span className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
        {label}
      </span>
      <span className={`text-sm font-semibold ${accent ?? 'text-ink'}`}>
        {value}
      </span>
    </div>
  );
}
