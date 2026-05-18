'use client';

import { useTeamStore } from '@/stores/teamStore';
import { TeamSlot } from '@/components/team-builder/TeamSlot';
import { PokemonPicker } from '@/components/team-builder/PokemonPicker';
import { TeamAnalysis } from '@/components/team-builder/TeamAnalysis';
import { SavedTeams } from '@/components/team-builder/SavedTeams';

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

      <TeamAnalysis />

      <SavedTeams />

      <PokemonPicker />
    </div>
  );
}
