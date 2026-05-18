'use client';

import { useMemo } from 'react';
import { TypeBadge } from '@/components/ui/TypeBadge';
import {
  teamDefensiveProfile,
  teamOffensiveCoverage,
} from '@/lib/type-effectiveness';
import {
  ShieldIcon,
  SwordIcon,
  BoltIcon,
  TargetIcon,
} from '@/components/ui/Icon';
import { useTeamStore } from '@/stores/teamStore';
import type { TeamMember } from '@/types/pokemon';
import { bst } from '@/lib/utils';

export function TeamAnalysis() {
  const team = useTeamStore((s) => s.current);
  const members = team.filter(Boolean) as TeamMember[];

  const defensive = useMemo(() => teamDefensiveProfile(members), [members]);
  const offensive = useMemo(() => teamOffensiveCoverage(members), [members]);

  const hotWeaknesses = defensive
    .filter((d) => d.weakCount - d.resistCount >= 2)
    .sort((a, b) => b.weakCount - a.weakCount);

  const uncovered = offensive
    .filter((o) => o.multiplier <= 1)
    .sort((a, b) => a.attackerCount - b.attackerCount);

  const avgSpeed =
    members.length === 0
      ? 0
      : Math.round(
          members.reduce((s, m) => s + m.stats.speed, 0) / members.length
        );
  const avgBST =
    members.length === 0
      ? 0
      : Math.round(members.reduce((s, m) => s + bst(m.stats), 0) / members.length);

  const insights: { tone: 'warn' | 'info' | 'good'; text: string }[] = [];
  if (members.length < 6 && members.length > 0) {
    insights.push({
      tone: 'info',
      text: `Tu equipo tiene ${members.length}/6 Pokémon. Añade más para un análisis completo.`,
    });
  }
  if (hotWeaknesses.length > 0) {
    insights.push({
      tone: 'warn',
      text: `Debilidad fuerte a tipo ${hotWeaknesses[0].type.toUpperCase()}: ${hotWeaknesses[0].weakCount} miembros débiles.`,
    });
  }
  if (uncovered.length > 0 && members.length >= 3) {
    const worst = uncovered.slice(0, 3).map((u) => u.type).join(', ');
    insights.push({
      tone: 'warn',
      text: `Cobertura ofensiva pobre contra: ${worst}.`,
    });
  }
  if (avgSpeed > 0 && avgSpeed < 70 && members.length >= 3) {
    insights.push({
      tone: 'warn',
      text: `Velocidad media baja (${avgSpeed}). Considera un sweeper rápido o Trick Room.`,
    });
  }
  if (
    avgSpeed >= 100 &&
    members.length >= 3 &&
    hotWeaknesses.length === 0
  ) {
    insights.push({
      tone: 'good',
      text: `Equipo veloz y sin debilidades obvias — buen balance.`,
    });
  }
  if (members.length === 0) {
    insights.push({
      tone: 'info',
      text: 'Añade Pokémon para empezar a ver el análisis en vivo.',
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Pokémon"
          value={`${members.length}/6`}
          Icon={TargetIcon}
        />
        <MetricCard
          label="BST medio"
          value={String(avgBST || '—')}
          Icon={SwordIcon}
        />
        <MetricCard
          label="Velocidad media"
          value={String(avgSpeed || '—')}
          Icon={BoltIcon}
        />
        <MetricCard
          label="Debilidades graves"
          value={String(hotWeaknesses.length)}
          Icon={ShieldIcon}
          tone={hotWeaknesses.length > 2 ? 'warn' : undefined}
        />
      </div>

      {insights.length > 0 && (
        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <BoltIcon className="w-4 h-4 text-accent-yellow" />
            Consejos del coach
          </h3>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 p-3 rounded-xl text-sm leading-relaxed ${
                  ins.tone === 'warn'
                    ? 'bg-accent-red/10 text-ink border border-accent-red/20'
                    : ins.tone === 'good'
                    ? 'bg-accent-green/10 text-ink border border-accent-green/20'
                    : 'glass text-ink-soft'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                    ins.tone === 'warn'
                      ? 'bg-accent-red'
                      : ins.tone === 'good'
                      ? 'bg-accent-green'
                      : 'bg-brand-glow'
                  }`}
                />
                {ins.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold mb-1 flex items-center gap-2">
            <ShieldIcon className="w-4 h-4 text-brand-glow" />
            Perfil defensivo
          </h3>
          <p className="text-xs text-ink-faint mb-4">
            Cuántos miembros son débiles vs resisten cada tipo atacante.
          </p>
          <div className="space-y-1.5">
            {defensive
              .slice()
              .sort((a, b) => b.weakCount - a.weakCount)
              .map((d) => (
                <div key={d.type} className="flex items-center gap-3">
                  <div className="w-20 shrink-0">
                    <TypeBadge type={d.type} size="xs" />
                  </div>
                  <div className="flex-1 flex gap-1 items-center">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2.5 flex-1 rounded ${
                          i < d.weakCount
                            ? 'bg-accent-red'
                            : i < d.weakCount + d.resistCount
                            ? 'bg-accent-green/60'
                            : 'bg-white/[0.05]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-mono text-ink-faint w-12 text-right">
                    {d.weakCount}/{d.resistCount}
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-3 flex gap-3 text-xs text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-accent-red" />
              Débil
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-accent-green/60" />
              Resiste
            </span>
          </div>
        </div>

        <div className="card-base p-5">
          <h3 className="font-display text-base font-bold mb-1 flex items-center gap-2">
            <SwordIcon className="w-4 h-4 text-accent-yellow" />
            Cobertura ofensiva (STAB)
          </h3>
          <p className="text-xs text-ink-faint mb-4">
            Tipos contra los que tienes super-eficaz desde tus tipos propios.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {offensive
              .slice()
              .sort((a, b) => b.multiplier - a.multiplier)
              .map((o) => (
                <div
                  key={o.type}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md glass"
                >
                  <TypeBadge type={o.type} size="xs" />
                  <span
                    className={`text-xs font-mono ml-auto ${
                      o.multiplier >= 2
                        ? 'text-accent-green'
                        : o.multiplier === 0
                        ? 'text-accent-red'
                        : 'text-ink-faint'
                    }`}
                  >
                    {o.multiplier === 0 ? '0' : `${o.multiplier}×`}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  Icon: any;
  tone?: 'warn';
}) {
  return (
    <div
      className={`card-base p-4 ${
        tone === 'warn' ? 'border-accent-red/30 bg-accent-red/5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
          {label}
        </div>
        <Icon
          className={`w-3.5 h-3.5 ${
            tone === 'warn' ? 'text-accent-red' : 'text-ink-faint'
          }`}
        />
      </div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
