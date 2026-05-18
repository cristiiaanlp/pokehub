'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/common/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { TypeBadge } from '@/components/ui/TypeBadge';
import {
  GENERATIONS,
  rollOne,
  rollTeam,
  rollRandomMonotype,
  rollStarter,
  rollNuzlockeChallenge,
  type NuzlockeChallenge,
} from '@/lib/casual/randomizer';
import { ALL_TYPES } from '@/lib/type-effectiveness';
import {
  getPokedexIndex,
  hydrateTypesForIds,
  artworkFor,
} from '@/lib/pokeapi';
import type { PokemonListItem, PokemonType } from '@/types/pokemon';
import { formatPokemonName, padId, cn } from '@/lib/utils';
import { SparklesIcon, ArrowRight } from '@/components/ui/Icon';

export default function RandomizerPage() {
  const [pool, setPool] = useState<PokemonListItem[]>([]);

  useEffect(() => {
    getPokedexIndex().then((idx) => setAllAndHydrate(idx));
    async function setAllAndHydrate(idx: PokemonListItem[]) {
      setPool([...idx]);
      // hydrate types in background so type filters work
      const ids = idx.filter((p) => p.types.length === 0).slice(0, 400).map((p) => p.id);
      await hydrateTypesForIds(ids);
      const refreshed = await getPokedexIndex();
      setPool([...refreshed]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <PageHeader
        kicker="Modo Casual · Randomizer"
        title={
          <>
            Lanza los <span className="gradient-text">dados</span>
          </>
        }
        subtitle="Pokémon aleatorio, equipo de 6, monotipo, starter random o un challenge nuzlocke completo. Para cuando no sabes a qué jugar."
        right={
          <Link href="/casual" className="text-sm text-ink-faint hover:text-ink">
            ← Volver a Casual
          </Link>
        }
      />

      <Tabs defaultValue="team">
        <TabsList className="flex-wrap mb-5">
          <TabsTrigger value="single">1 Pokémon</TabsTrigger>
          <TabsTrigger value="team">Team de 6</TabsTrigger>
          <TabsTrigger value="monotype">Monotipo</TabsTrigger>
          <TabsTrigger value="starter">Starter random</TabsTrigger>
          <TabsTrigger value="nuzlocke">Nuzlocke challenge</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <SingleRoll pool={pool} />
        </TabsContent>
        <TabsContent value="team">
          <TeamRoll pool={pool} />
        </TabsContent>
        <TabsContent value="monotype">
          <MonotypeRoll pool={pool} />
        </TabsContent>
        <TabsContent value="starter">
          <StarterRoll />
        </TabsContent>
        <TabsContent value="nuzlocke">
          <NuzlockeRoll />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FilterRow({
  selectedGens,
  setSelectedGens,
  selectedTypes,
  setSelectedTypes,
  showTypeFilter = true,
}: {
  selectedGens: number[];
  setSelectedGens: (v: number[]) => void;
  selectedTypes?: PokemonType[];
  setSelectedTypes?: (v: PokemonType[]) => void;
  showTypeFilter?: boolean;
}) {
  const toggleGen = (g: number) => {
    if (selectedGens.includes(g))
      setSelectedGens(selectedGens.filter((x) => x !== g));
    else setSelectedGens([...selectedGens, g]);
  };
  const toggleType = (t: PokemonType) => {
    if (!setSelectedTypes || !selectedTypes) return;
    if (selectedTypes.includes(t))
      setSelectedTypes(selectedTypes.filter((x) => x !== t));
    else setSelectedTypes([...selectedTypes, t]);
  };
  return (
    <div className="card-base p-4 space-y-3">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-2">
          Generación · vacío = todas
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GENERATIONS.map((g) => (
            <button
              key={g.id}
              onClick={() => toggleGen(g.id)}
              className={cn(
                'h-7 px-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors',
                selectedGens.includes(g.id)
                  ? 'bg-ink text-bg-950'
                  : 'glass text-ink-soft hover:text-ink'
              )}
            >
              {g.id}
            </button>
          ))}
        </div>
      </div>
      {showTypeFilter && setSelectedTypes && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-2">
            Tipos · vacío = todos
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TYPES.map((t) => {
              const active = selectedTypes?.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={cn(
                    'transition-all',
                    selectedTypes && selectedTypes.length > 0 && !active && 'opacity-40 saturate-50 hover:opacity-100 hover:saturate-100',
                    active && 'ring-2 ring-ink scale-105'
                  )}
                >
                  <TypeBadge type={t} size="xs" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PickedCard({ p, big = false }: { p: PokemonListItem; big?: boolean }) {
  return (
    <Link
      href={`/pokedex/${p.id}`}
      className={cn(
        'group block card-base relative overflow-hidden',
        big ? 'p-6' : 'p-4'
      )}
    >
      <div className="text-[10px] font-mono text-ink-faint">
        #{padId(p.id)}
      </div>
      <div className={cn('flex items-center justify-center', big ? 'h-44' : 'h-24')}>
        <img
          src={artworkFor(p.id)}
          alt={p.name}
          className="max-h-full object-contain group-hover:scale-110 transition-transform drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = p.sprite;
          }}
        />
      </div>
      <div className="text-center mt-2">
        <div
          className={cn(
            'font-display font-bold truncate',
            big ? 'text-2xl' : 'text-sm'
          )}
        >
          {formatPokemonName(p.name)}
        </div>
        <div className="flex flex-wrap gap-1 justify-center mt-1">
          {p.types.map((t) => (
            <TypeBadge key={t} type={t} size="xs" />
          ))}
        </div>
      </div>
    </Link>
  );
}

function RollButton({ onClick, label = 'Lanzar' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="h-12 px-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-white font-bold text-sm shadow-glow-strong hover:scale-[1.02] active:scale-[0.97] transition-transform"
    >
      🎲 {label}
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}

function SingleRoll({ pool }: { pool: PokemonListItem[] }) {
  const [gens, setGens] = useState<number[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [picked, setPicked] = useState<PokemonListItem | null>(null);

  const roll = () => {
    setPicked(rollOne(pool, { gens, types }));
  };

  return (
    <div className="grid lg:grid-cols-[1fr,1.2fr] gap-5">
      <div className="space-y-3">
        <FilterRow
          selectedGens={gens}
          setSelectedGens={setGens}
          selectedTypes={types}
          setSelectedTypes={setTypes}
        />
        <RollButton onClick={roll} label="Lanzar Pokémon" />
      </div>
      <div className="flex items-center justify-center min-h-[280px]">
        <AnimatePresence mode="wait">
          {picked ? (
            <motion.div
              key={picked.id}
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="w-72"
            >
              <PickedCard p={picked} big />
            </motion.div>
          ) : (
            <div className="text-ink-faint text-sm text-center">
              Configura filtros y dale al botón mágico
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TeamRoll({ pool }: { pool: PokemonListItem[] }) {
  const [gens, setGens] = useState<number[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [team, setTeam] = useState<PokemonListItem[]>([]);

  const roll = () => {
    setTeam(rollTeam(pool, { gens, types }, 6));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-ink-dim">
          Genera 6 Pokémon aleatorios para tu próximo run, batalla amistosa o
          challenge.
        </p>
        <RollButton onClick={roll} label="Lanzar equipo" />
      </div>
      <FilterRow
        selectedGens={gens}
        setSelectedGens={setGens}
        selectedTypes={types}
        setSelectedTypes={setTypes}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[180px]">
        <AnimatePresence>
          {team.map((p, i) => (
            <motion.div
              key={`${p.id}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring' }}
            >
              <PickedCard p={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MonotypeRoll({ pool }: { pool: PokemonListItem[] }) {
  const [result, setResult] = useState<{ type: PokemonType; team: PokemonListItem[] } | null>(null);

  const roll = () => {
    setResult(rollRandomMonotype(pool, 6));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-ink-dim">
          Genera un equipo monotipo aleatorio. Modo desafío: completa el juego
          solo con ese tipo.
        </p>
        <RollButton onClick={roll} label="Lanzar monotipo" />
      </div>
      {result && (
        <motion.div
          key={result.type}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs uppercase tracking-widest text-ink-faint font-bold">
              Tipo elegido
            </span>
            <TypeBadge type={result.type} size="md" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {result.team.map((p, i) => (
              <motion.div
                key={`${p.id}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <PickedCard p={p} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StarterRoll() {
  const [id, setId] = useState<number | null>(null);
  return (
    <div className="text-center space-y-5">
      <p className="text-sm text-ink-dim max-w-md mx-auto">
        Elige starter al azar entre los 27 starters oficiales (Gen 1-9).
      </p>
      <RollButton onClick={() => setId(rollStarter())} label="¡Tira la moneda!" />
      <AnimatePresence mode="wait">
        {id && (
          <motion.div
            key={id}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="card-base p-6 max-w-sm mx-auto"
          >
            <img
              src={artworkFor(id)}
              alt=""
              className="w-40 h-40 mx-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
            />
            <div className="text-center mt-2 font-display text-2xl font-bold">
              <Link href={`/pokedex/${id}`} className="hover:text-brand-glow">
                Ver detalle →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NuzlockeRoll() {
  const [c, setC] = useState<NuzlockeChallenge | null>(null);
  const challenge = useMemo(() => c, [c]);
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-ink-dim max-w-xl mx-auto">
          Reglas + twist + starter random. Generador de challenges para tu
          próxima run.
        </p>
      </div>
      <div className="flex justify-center">
        <RollButton onClick={() => setC(rollNuzlockeChallenge())} label="Generar challenge" />
      </div>
      <AnimatePresence mode="wait">
        {challenge && (
          <motion.div
            key={`${challenge.starterId}-${challenge.twist}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card-base p-6 max-w-2xl mx-auto space-y-4 relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-accent-red/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="grid sm:grid-cols-[auto,1fr] gap-4 items-center">
                <div className="flex flex-col items-center">
                  <img
                    src={artworkFor(challenge.starterId)}
                    alt=""
                    className="w-28 h-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                  />
                  <div className="text-[10px] uppercase tracking-widest text-accent-red font-bold mt-1">
                    Starter forzoso
                  </div>
                  <Link
                    href={`/pokedex/${challenge.starterId}`}
                    className="text-xs text-brand-glow hover:text-brand-hover"
                  >
                    Ver detalle →
                  </Link>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1">
                      Twist único
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20">
                      <SparklesIcon className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold">
                        {challenge.twist}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1">
                      Reglas activas
                    </div>
                    <ul className="space-y-1">
                      {challenge.rules.map((r) => (
                        <li
                          key={r}
                          className="flex items-start gap-2 text-sm text-ink-soft"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-glow mt-2 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="text-center pt-3">
                <Link
                  href="/casual/nuzlocke"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-glow hover:text-brand-hover"
                >
                  Llevar la run en el Nuzlocke Helper
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
