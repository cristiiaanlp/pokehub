'use client';

import { useTeamStore } from '@/stores/teamStore';
import { TeamSlot } from '@/components/team-builder/TeamSlot';
import { PokemonPicker } from '@/components/team-builder/PokemonPicker';
import { Link } from '@/i18n/routing';
import { TeamAnalysis } from '@/components/team-builder/TeamAnalysis';
import { TeamHeatmap } from '@/components/team-builder/TeamHeatmap';
import { TeraOptimizer } from '@/components/team-builder/TeraOptimizer';
import { ThreatsView } from '@/components/team-builder/ThreatsView';
import { ShowdownIO } from '@/components/team-builder/ShowdownIO';
import { SavedTeams } from '@/components/team-builder/SavedTeams';
import { BoltIcon, FireIcon, ArrowRight } from '@/components/ui/Icon';

export default function TeamBuilderPage() {
  const team = useTeamStore((s) => s.current);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-10">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
          Team Builder
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Construye tu <span className="gradient-text">equipo perfecto</span>
        </h1>
        <p className="text-ink-dim mt-3 max-w-2xl">
          Selecciona 6 Pokémon, revisa el análisis defensivo y de cobertura en
          tiempo real, y guarda tantos equipos como quieras.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {team.map((m, i) => (
          <TeamSlot key={i} member={m} index={i} />
        ))}
      </div>

      <ShowdownIO />

      <TeamAnalysis />

      <TeamHeatmap />

      <TeraOptimizer />

      <ThreatsView />

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/tools/speed-tier"
          className="card-base card-hover p-5 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-yellow/15 text-accent-yellow flex items-center justify-center">
              <BoltIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold">Speed Tier</div>
              <div className="text-xs text-ink-dim">
                Calcula velocidad con EVs, nature y boosts
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          href="/tools/damage-calc"
          className="card-base card-hover p-5 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-red/15 text-accent-red flex items-center justify-center">
              <FireIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold">Damage Calc</div>
              <div className="text-xs text-ink-dim">
                Daño exacto Gen 9 con OHKO / 2HKO
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <SavedTeams />

      <PokemonPicker />
    </div>
  );
}
