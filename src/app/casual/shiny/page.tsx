'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/common/PageHeader';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { HuntCard, NewHuntButton } from '@/components/casual/HuntCard';
import { useShinyStore } from '@/stores/shinyStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { SparklesIcon, ArrowRight } from '@/components/ui/Icon';
import { artworkFor, shinyArtworkFor } from '@/lib/pokeapi';
import { formatPokemonName, padId } from '@/lib/utils';

export default function ShinyTrackerPage() {
  const hunts = useShinyStore((s) => s.hunts);
  const totalFound = useShinyStore((s) => s.totalShiniesFound);
  const createHunt = useShinyStore((s) => s.createHunt);
  const [pickerOpen, setPickerOpen] = useState(false);

  const active = hunts.filter((h) => h.foundAt === null);
  const found = hunts.filter((h) => h.foundAt !== null).sort((a, b) => (b.foundAt ?? 0) - (a.foundAt ?? 0));

  const totalEncounters = active.reduce((s, h) => s + h.encounters, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <PageHeader
        kicker="Modo Casual · Shiny Tracker"
        title={
          <>
            <span className="gradient-text">Shiny hunting</span> · serio o casual
          </>
        }
        subtitle="Lleva la cuenta de tus hunts, calcula odds en vivo y guarda el momento exacto en que cazas tu shiny."
        right={
          <Link
            href="/casual"
            className="text-sm text-ink-faint hover:text-ink"
          >
            ← Volver a Casual
          </Link>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Hunts activas"
          value={String(active.length)}
          color="text-brand-glow"
        />
        <StatCard
          label="Shinies capturados"
          value={String(totalFound)}
          color="text-accent-yellow"
          highlight
        />
        <StatCard
          label="Encuentros totales"
          value={totalEncounters.toLocaleString()}
          color="text-accent-green"
        />
        <StatCard
          label="Tiempo invertido"
          value={hunts.length === 0 ? '—' : `${Math.max(1, Math.round((Date.now() - Math.min(...hunts.map((h) => h.startedAt))) / 86400000))}d`}
          color="text-ink-soft"
        />
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-5">
          <TabsTrigger value="active">
            Activas ({active.length})
          </TabsTrigger>
          <TabsTrigger value="found">
            Capturados ({found.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {active.length === 0 ? (
            <EmptyState
              title="Sin hunts activas"
              description="Crea tu primera hunt: elige un Pokémon, elige el método, dale al +1 cada encuentro."
              actionLabel="Empezar primera hunt"
              onAction={() => setPickerOpen(true)}
            />
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {active.map((h) => (
                <HuntCard key={h.id} hunt={h} />
              ))}
              <NewHuntButton onClick={() => setPickerOpen(true)} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="found">
          {found.length === 0 ? (
            <EmptyState
              title="Aún no has cazado ninguno"
              description="Los shinies que captures aparecerán aquí como trofeo permanente."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {found.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-base p-4 relative overflow-hidden group"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent-yellow/15 blur-2xl pointer-events-none" />
                  <div className="relative">
                    <div className="text-[10px] font-mono text-ink-faint">
                      #{padId(h.pokemonId)}
                    </div>
                    <div className="flex items-center justify-center my-2">
                      <img
                        src={shinyArtworkFor(h.pokemonId)}
                        alt={h.pokemonName}
                        className="w-24 h-24 object-contain group-hover:scale-110 transition-transform drop-shadow-[0_8px_16px_rgba(250,204,21,0.4)]"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = artworkFor(
                            h.pokemonId
                          );
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-display font-bold text-sm truncate">
                        {h.nickname || formatPokemonName(h.pokemonName)}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-accent-yellow font-bold uppercase tracking-widest mt-1">
                        <SparklesIcon className="w-3 h-3" />
                        Shiny
                      </div>
                      <div className="text-[10px] text-ink-faint mt-1.5">
                        {h.encounters.toLocaleString()} encuentros
                      </div>
                      {h.foundAt && (
                        <div className="text-[10px] text-ink-faint mt-0.5">
                          {new Date(h.foundAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PokemonSelectModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="¿A qué Pokémon vas a cazar?"
        onPick={(p) => {
          createHunt({
            pokemonId: p.id,
            pokemonName: p.name,
            methodId: 'full-odds',
            shinyCharm: false,
          });
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card-base p-4 ${
        highlight ? 'border-accent-yellow/30 bg-accent-yellow/5' : ''
      }`}
    >
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
        {label}
      </div>
      <div className={`font-display text-2xl font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="card-base p-10 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-accent-yellow/15 text-accent-yellow inline-flex items-center justify-center mb-3">
        <SparklesIcon className="w-7 h-7" />
      </div>
      <h2 className="font-display text-xl font-bold mb-1">{title}</h2>
      <p className="text-ink-dim text-sm mb-5">{description}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="h-11 px-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-white font-bold text-sm shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
