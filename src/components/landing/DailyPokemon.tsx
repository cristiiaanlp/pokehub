'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { artworkFor, TOTAL_POKEMON } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { SparklesIcon, ArrowRight, CheckIcon, XIcon } from '@/components/ui/Icon';
import type { PokemonType } from '@/types/pokemon';

interface DailyData {
  id: number;
  name: string;
  types: PokemonType[];
  flavor: string;
  height: number;
  weight: number;
  bst: number;
}

// Deterministic daily Pokémon based on UTC date — same for everyone same day
function dailyPokemonId(): number {
  const d = new Date();
  const utcDay = Math.floor(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000
  );
  // Simple LCG-style hash for variety
  const seed = (utcDay * 9301 + 49297) % 233280;
  return ((seed % TOTAL_POKEMON) + 1);
}

function todayISO() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

interface SolvedState {
  date: string;
  correctType: PokemonType;
  correctGen: number;
}

export function DailyPokemon() {
  const [data, setData] = useState<DailyData | null>(null);
  const [reveal, setReveal] = useState(false);
  const [pickedType, setPickedType] = useState<PokemonType | null>(null);
  const id = dailyPokemonId();

  useEffect(() => {
    // Check if already solved today
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('pokehub-daily-solved');
    if (raw) {
      try {
        const parsed: SolvedState = JSON.parse(raw);
        if (parsed.date === todayISO()) {
          setReveal(true);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
          cache: 'force-cache',
        });
        if (!res.ok) return;
        const raw = await res.json();
        const types = raw.types
          .sort((a: any, b: any) => a.slot - b.slot)
          .map((t: any) => t.type.name as PokemonType);

        // Fetch species for flavor
        const speciesRes = await fetch(raw.species.url, { cache: 'force-cache' });
        const species = await speciesRes.json();
        const flavor =
          species.flavor_text_entries.find(
            (e: any) => e.language.name === 'es'
          )?.flavor_text ??
          species.flavor_text_entries.find(
            (e: any) => e.language.name === 'en'
          )?.flavor_text ??
          '';

        const bst = raw.stats.reduce((s: number, x: any) => s + x.base_stat, 0);

        if (!cancelled) {
          setData({
            id: raw.id,
            name: raw.name,
            types,
            flavor: flavor.replace(/\f|\n/g, ' '),
            height: raw.height,
            weight: raw.weight,
            bst,
          });
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleGuess = (t: PokemonType) => {
    if (reveal || !data) return;
    setPickedType(t);
    const correct = data.types.includes(t);
    setReveal(true);
    localStorage.setItem(
      'pokehub-daily-solved',
      JSON.stringify({
        date: todayISO(),
        correctType: data.types[0],
        guessed: t,
        correct,
      })
    );
  };

  if (!data) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="card-base p-8 h-44 animate-pulse" />
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-accent-yellow/25 p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/10 via-orange-500/5 to-brand/10" />
        <div className="absolute -top-24 -right-24 w-[350px] h-[350px] bg-accent-yellow/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid lg:grid-cols-[1fr,auto] gap-6 items-center">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-accent-yellow/15 text-accent-yellow text-xs font-bold tracking-widest uppercase">
              <SparklesIcon className="w-3.5 h-3.5" />
              Pokémon del día
            </div>

            {!reveal ? (
              <>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  ¿Adivinas qué <span className="gradient-text">tipo</span> es?
                </h2>
                <p className="text-ink-soft text-sm">
                  Mira la silueta y elige el tipo principal. Inténtalo una vez al
                  día.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(
                    [
                      'fire',
                      'water',
                      'grass',
                      'electric',
                      'psychic',
                      'fighting',
                      'dragon',
                      'fairy',
                      'dark',
                      'steel',
                    ] as PokemonType[]
                  ).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleGuess(t)}
                      className="transition-transform hover:scale-105 active:scale-95"
                    >
                      <TypeBadge type={t} size="sm" />
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-ink-faint">
                  Sin ánimo: solo es por diversión 🎲
                </div>
              </>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <h2 className="font-display text-2xl sm:text-3xl font-bold">
                    Era {capitalize(data.name)}
                  </h2>
                  <div className="flex gap-1.5">
                    {data.types.map((t) => (
                      <TypeBadge key={t} type={t} size="md" />
                    ))}
                  </div>
                  {pickedType && (
                    <div
                      className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg ${
                        data.types.includes(pickedType)
                          ? 'bg-accent-green/15 text-accent-green'
                          : 'bg-accent-red/15 text-accent-red'
                      }`}
                    >
                      {data.types.includes(pickedType) ? (
                        <>
                          <CheckIcon className="w-4 h-4" />
                          ¡Acertaste!
                        </>
                      ) : (
                        <>
                          <XIcon className="w-4 h-4" />
                          Fallaste — era {data.types[0]}
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-ink-soft text-sm line-clamp-3 max-w-lg">
                    {data.flavor}
                  </p>
                  <div className="flex gap-3 text-xs text-ink-faint pt-1">
                    <span>
                      BST{' '}
                      <span className="text-ink font-bold">{data.bst}</span>
                    </span>
                    <span>
                      Altura{' '}
                      <span className="text-ink font-bold">
                        {(data.height / 10).toFixed(1)} m
                      </span>
                    </span>
                    <span>
                      Peso{' '}
                      <span className="text-ink font-bold">
                        {(data.weight / 10).toFixed(1)} kg
                      </span>
                    </span>
                  </div>
                  <Link
                    href={`/pokedex/${data.id}`}
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-brand-glow hover:text-brand-hover"
                  >
                    Ver detalle completo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-44 h-44 sm:w-56 sm:h-56 mx-auto lg:mx-0"
          >
            <img
              src={artworkFor(data.id)}
              alt={reveal ? data.name : '???'}
              className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
              style={{
                filter: reveal ? 'none' : 'brightness(0) contrast(100%)',
                transition: 'filter 0.6s ease',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
}
