'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTeamStore } from '@/stores/teamStore';
import {
  analyzeThreats,
  threatTier,
  type MetaThreat,
  type ThreatAnalysis,
  type TeamMemberLite,
} from '@/lib/team-analysis/threats';
import { artworkFor } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ShieldIcon,
  FireIcon,
  CheckIcon,
  XIcon,
} from '@/components/ui/Icon';
import type { TeamMember } from '@/types/pokemon';

interface ApiResponse {
  format: string;
  source: string;
  dataDate: string;
  fetchedAt: string;
  entries: MetaThreat[];
}

const FORMATS = [
  { id: 'championspreview', label: 'Champions Reg M-A' },
  { id: 'gen9ou', label: 'SV OU' },
  { id: 'gen9doublesou', label: 'SV Doubles' },
];

export function ThreatsView() {
  const team = useTeamStore((s) => s.current);
  const members = team.filter(Boolean) as TeamMember[];
  const [meta, setMeta] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('championspreview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/meta/threats?format=${format}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Sin datos para este formato');
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setMeta(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Error al cargar meta');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [format]);

  const analyses = useMemo<ThreatAnalysis[]>(() => {
    if (!meta || members.length === 0) return [];
    const teamLite: TeamMemberLite[] = members.map((m) => ({
      pokemonId: m.pokemonId,
      name: m.name,
      types: m.types,
      stats: m.stats,
    }));
    return analyzeThreats(teamLite, meta.entries).slice(0, 12);
  }, [meta, members]);

  if (members.length === 0) {
    return (
      <div className="card-base p-6 text-center text-sm text-ink-dim">
        Añade Pokémon a tu equipo para ver qué amenazas del meta te pegan más
        fuerte.
      </div>
    );
  }

  return (
    <div className="card-base p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-accent-red" />
            ¿Qué del meta te pega más fuerte?
          </h3>
          <p className="text-xs text-ink-dim mt-1">
            Análisis automático del top usage actual cruzado con los tipos de
            tu equipo. Cuanto más arriba en la lista, más problemático.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`h-8 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                format === f.id
                  ? 'bg-ink text-bg-950'
                  : 'glass text-ink-soft hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {meta && (
        <div className="flex items-center gap-2 text-[10px] text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
            </span>
            Live · {meta.source}
          </span>
          {meta.dataDate && <span>· {meta.dataDate}</span>}
          <span>· {meta.entries.length} Pokémon analizados</span>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/30 rounded-xl p-3">
          {error}
        </div>
      )}

      {!loading && analyses.length > 0 && (
        <div className="space-y-2">
          {analyses.map((a, i) => (
            <ThreatRow key={a.threat.speciesId} analysis={a} index={i} />
          ))}
        </div>
      )}

      {!loading && analyses.length === 0 && meta && (
        <div className="text-sm text-ink-dim text-center py-6">
          Tu equipo cubre bien todas las amenazas del meta. 👌
        </div>
      )}
    </div>
  );
}

function ThreatRow({
  analysis: a,
  index,
}: {
  analysis: ThreatAnalysis;
  index: number;
}) {
  const tier = threatTier(a);
  const tierColors = {
    red: {
      border: 'border-accent-red/30',
      bg: 'bg-accent-red/5',
      glow: 'bg-accent-red/15',
      text: 'text-accent-red',
      label: 'CRÍTICO',
    },
    yellow: {
      border: 'border-accent-yellow/30',
      bg: 'bg-accent-yellow/5',
      glow: 'bg-accent-yellow/15',
      text: 'text-accent-yellow',
      label: 'AVISO',
    },
    green: {
      border: 'border-accent-green/30',
      bg: 'bg-accent-green/5',
      glow: 'bg-accent-green/15',
      text: 'text-accent-green',
      label: 'CUBIERTO',
    },
  }[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      className={`relative overflow-hidden rounded-xl border ${tierColors.border} ${tierColors.bg} p-3 sm:p-4`}
    >
      <div
        className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${tierColors.glow} blur-2xl pointer-events-none`}
      />
      <div className="relative flex items-center gap-3">
        <Link
          href={`/pokedex/${a.threat.speciesId}`}
          className="shrink-0 group"
        >
          <img
            src={artworkFor(a.threat.speciesId)}
            alt={a.threat.name}
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform"
            loading="lazy"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/pokedex/${a.threat.speciesId}`}
              className="font-display font-bold hover:text-brand-glow truncate"
            >
              {a.threat.name}
            </Link>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${tierColors.text} ${tierColors.glow}`}
            >
              {tierColors.label}
            </span>
            <span className="text-[10px] text-ink-faint font-mono">
              {a.threat.usagePct.toFixed(1)}% uso
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {a.threat.types.map((t) => (
              <TypeBadge key={t} type={t} size="xs" />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-accent-red">
              <XIcon className="w-3 h-3" />
              {a.weakCount} débil{a.weakCount === 1 ? '' : 'es'}
            </span>
            <span className="inline-flex items-center gap-1 text-accent-green">
              <CheckIcon className="w-3 h-3" />
              {a.hitBackCount} cubre
            </span>
            {a.immuneCount > 0 && (
              <span className="inline-flex items-center gap-1 text-brand-glow">
                <ShieldIcon className="w-3 h-3" />
                {a.immuneCount} inmune
              </span>
            )}
          </div>
        </div>
        {a.bestCounter ? (
          <div className="hidden sm:block shrink-0 text-right">
            <div className="text-[9px] uppercase tracking-widest text-ink-faint font-semibold">
              Tu mejor counter
            </div>
            <div className="flex items-center gap-1.5 mt-1 justify-end">
              <img
                src={artworkFor(a.bestCounter.pokemonId)}
                alt={a.bestCounter.name}
                className="w-9 h-9 object-contain"
              />
              <div className="text-right">
                <div className="text-xs font-bold text-ink-soft capitalize">
                  {a.bestCounter.name.replace(/-/g, ' ')}
                </div>
                <div className="text-[10px] font-mono text-accent-green">
                  {a.bestCounter.outgoing}× vs {a.bestCounter.incoming}×
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block shrink-0 text-right text-[10px] text-accent-red font-bold uppercase tracking-widest">
            Sin counter claro
          </div>
        )}
      </div>

      {/* Per-member matchups detail */}
      <div className="mt-3 pt-3 border-t border-white/[0.05] flex flex-wrap gap-1.5">
        {a.matchups.map((m) => {
          const incomingHot = m.incoming >= 2;
          const outgoingHot = m.outgoing >= 2;
          const immune = m.incoming === 0;
          const cls = immune
            ? 'bg-brand/10 border-brand/30 text-brand-glow'
            : incomingHot && !outgoingHot
            ? 'bg-accent-red/10 border-accent-red/30 text-accent-red'
            : outgoingHot && !incomingHot
            ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
            : 'glass text-ink-dim border-white/[0.06]';
          return (
            <div
              key={m.pokemonId}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono ${cls}`}
              title={`${m.name}: recibe ${m.incoming}×, devuelve ${m.outgoing}×`}
            >
              <img
                src={artworkFor(m.pokemonId)}
                alt=""
                className="w-5 h-5 object-contain"
              />
              <span className="text-[10px]">
                {immune ? '0×' : `${m.incoming}× / ${m.outgoing}×`}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
