'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import type { PokemonDetail, TeamMember } from '@/types/pokemon';
import { TypeBadge, TYPE_HEX } from '@/components/ui/TypeBadge';
import { StatBar } from '@/components/ui/StatBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import {
  HeartIcon,
  VolumeIcon,
  SparklesIcon,
  PlusIcon,
  ChevronRight,
} from '@/components/ui/Icon';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTeamStore } from '@/stores/teamStore';
import {
  bst,
  formatHeightMeters,
  formatPokemonName,
  formatWeightKg,
  padId,
} from '@/lib/utils';
import { EffectivenessGrid } from './EffectivenessGrid';
import { EvolutionChain } from './EvolutionChain';
import { CompetitiveSets } from './CompetitiveSets';
import { CountersView } from './CountersView';
import { LivePikalyticsData } from './LivePikalyticsData';
import type { EnrichedPikalyticsData } from '@/lib/pikalytics/enrich';

interface PokemonDetailViewProps {
  data: PokemonDetail;
  live?: EnrichedPikalyticsData | null;
  liveFormatLabel?: string;
  liveFetchedAt?: string;
}

export function PokemonDetailView({
  data,
  live,
  liveFormatLabel,
  liveFetchedAt,
}: PokemonDetailViewProps) {
  const [shiny, setShiny] = useState(false);
  const isFav = useFavoritesStore((s) => s.ids.includes(data.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const team = useTeamStore((s) => s.current);
  const setSlot = useTeamStore((s) => s.setSlot);

  const primary = data.types[0];
  const secondary = data.types[1];
  const accent = TYPE_HEX(primary);
  const accent2 = secondary ? TYPE_HEX(secondary) : accent;

  const playCry = () => {
    if (!data.cry) return;
    try {
      const audio = new Audio(data.cry);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch {
      /* ignore */
    }
  };

  const addToTeam = () => {
    const firstEmpty = team.findIndex((s) => s === null);
    const slot = firstEmpty === -1 ? 0 : firstEmpty;
    const member: TeamMember = {
      pokemonId: data.id,
      name: data.name,
      sprite: data.sprite,
      types: data.types,
      stats: data.stats,
      abilities: data.abilities,
      ability: data.abilities[0]?.name,
      moves: [],
    };
    setSlot(slot, member);
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div
        className="relative rounded-[2rem] overflow-hidden p-6 sm:p-10"
        style={{
          background: `linear-gradient(135deg, ${accent}30 0%, ${accent2}20 100%)`,
        }}
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full blur-3xl opacity-50"
          style={{ background: accent }}
        />

        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative flex justify-center order-2 lg:order-1">
            <motion.img
              key={shiny ? 'shiny' : 'normal'}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              src={shiny ? data.shinyArtwork : data.artwork}
              alt={data.name}
              className="w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = data.sprite;
              }}
            />
          </div>

          {/* Info */}
          <div className="space-y-5 order-1 lg:order-2">
            <div>
              <div className="text-xs font-mono text-ink-faint">
                #{padId(data.id)} · {data.genus || 'Pokémon'}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mt-1">
                {formatPokemonName(data.name)}
              </h1>
              <div className="flex flex-wrap gap-2 mt-3">
                {data.types.map((t) => (
                  <TypeBadge key={t} type={t} size="md" />
                ))}
              </div>
            </div>

            <p className="text-ink-soft leading-relaxed max-w-xl">
              {data.flavorText || '—'}
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-md">
              <Stat label="Altura" value={formatHeightMeters(data.height)} />
              <Stat label="Peso" value={formatWeightKg(data.weight)} />
              <Stat label="BST" value={String(bst(data.stats))} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={addToTeam} variant="primary" size="md">
                <PlusIcon className="w-4 h-4" />
                Añadir al equipo
              </Button>
              <Button
                variant={isFav ? 'danger' : 'secondary'}
                size="md"
                onClick={() => toggleFav(data.id)}
              >
                <HeartIcon filled={isFav} className="w-4 h-4" />
                {isFav ? 'En favoritos' : 'Favorito'}
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShiny((s) => !s)}
              >
                <SparklesIcon className="w-4 h-4" />
                {shiny ? 'Normal' : 'Shiny'}
              </Button>
              {data.cry && (
                <Button variant="ghost" size="md" onClick={playCry}>
                  <VolumeIcon className="w-4 h-4" />
                  Cry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats">
        <TabsList className="mb-5 flex-wrap">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="moves">Movimientos</TabsTrigger>
          <TabsTrigger value="effectiveness">Tipos</TabsTrigger>
          <TabsTrigger value="evolution">Evolución</TabsTrigger>
          <TabsTrigger value="sets">Sets</TabsTrigger>
          <TabsTrigger value="counters">Counters</TabsTrigger>
          {live && (
            <TabsTrigger value="live">Live · Pikalytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="stats">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="card-base p-6 space-y-3">
              <h3 className="font-display text-lg font-bold mb-2">
                Stats base
              </h3>
              <StatBar label="HP" value={data.stats.hp} />
              <StatBar label="Ataque" value={data.stats.attack} />
              <StatBar label="Defensa" value={data.stats.defense} />
              <StatBar label="Atq. Esp." value={data.stats.specialAttack} />
              <StatBar label="Def. Esp." value={data.stats.specialDefense} />
              <StatBar label="Velocidad" value={data.stats.speed} />
              <div className="mt-2 pt-3 border-t border-white/[0.05] flex items-baseline justify-between">
                <span className="text-sm text-ink-dim">Total</span>
                <span className="font-display text-2xl font-bold text-ink">
                  {bst(data.stats)}
                </span>
              </div>
            </div>

            <div className="card-base p-6">
              <h3 className="font-display text-lg font-bold mb-3">Habilidades</h3>
              <div className="space-y-2">
                {data.abilities.map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between p-3 rounded-xl glass"
                  >
                    <div>
                      <div className="text-sm font-semibold capitalize">
                        {a.name.replace(/-/g, ' ')}
                      </div>
                      {a.isHidden && (
                        <div className="text-[10px] text-accent-yellow font-bold uppercase tracking-wider">
                          Habilidad oculta
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-faint" />
                  </div>
                ))}
              </div>
              <h3 className="font-display text-lg font-bold mb-3 mt-6">
                Información
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Generación" value={data.generation.replace('generation-', 'Gen ').toUpperCase()} />
                <Stat label="Exp. base" value={String(data.baseExperience ?? '—')} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="moves">
          <div className="card-base p-6">
            <h3 className="font-display text-lg font-bold mb-4">
              Movimientos ({data.moves.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {data.moves.map((m) => (
                <div
                  key={m.name}
                  className="px-3 py-2 rounded-lg glass text-sm capitalize hover:bg-white/[0.06] transition-colors"
                >
                  {m.name.replace(/-/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="effectiveness">
          <div className="card-base p-6">
            <h3 className="font-display text-lg font-bold mb-1">
              Efectividad recibida
            </h3>
            <p className="text-sm text-ink-dim mb-5">
              Cómo los tipos atacantes afectan a este Pokémon.
            </p>
            <EffectivenessGrid types={data.types} />
          </div>
        </TabsContent>

        <TabsContent value="evolution">
          <div className="card-base p-6">
            <h3 className="font-display text-lg font-bold mb-4">
              Cadena evolutiva
            </h3>
            <EvolutionChain chain={data.evolutionChain} currentId={data.id} />
          </div>
        </TabsContent>

        <TabsContent value="sets">
          <CompetitiveSets speciesId={data.id} />
        </TabsContent>

        <TabsContent value="counters">
          <CountersView speciesId={data.id} types={data.types} />
        </TabsContent>

        {live && (
          <TabsContent value="live">
            <LivePikalyticsData
              data={live}
              pokemonName={formatPokemonName(data.name)}
              fetchedAt={liveFetchedAt ?? new Date().toISOString()}
              formatLabel={liveFormatLabel ?? 'Pikalytics'}
            />
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-center pt-4">
        <Link
          href="/pokedex"
          className="text-sm text-ink-dim hover:text-ink"
        >
          ← Volver a la Pokédex
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl glass px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
        {label}
      </div>
      <div className="text-base font-display font-bold text-ink mt-0.5">
        {value}
      </div>
    </div>
  );
}
