'use client';

import { useEffect, useMemo, useState } from 'react';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { artworkFor, getPokemon } from '@/lib/pokeapi';
import { analyzeSynergy } from '@/lib/team-analysis/synergy';
import { TypeBadge } from '@/components/ui/TypeBadge';
import {
  PlusIcon,
  ShieldIcon,
  SwordIcon,
  ArrowRight,
} from '@/components/ui/Icon';
import type { PokemonDetail, PokemonListItem } from '@/types/pokemon';

export function SynergyAnalyzer() {
  const [a, setA] = useState<PokemonListItem | null>(null);
  const [b, setB] = useState<PokemonListItem | null>(null);
  const [aDetail, setADetail] = useState<PokemonDetail | null>(null);
  const [bDetail, setBDetail] = useState<PokemonDetail | null>(null);
  const [pickerOpen, setPickerOpen] = useState<null | 'a' | 'b'>(null);

  useEffect(() => {
    if (a) getPokemon(String(a.id)).then(setADetail).catch(() => {});
    else setADetail(null);
  }, [a]);

  useEffect(() => {
    if (b) getPokemon(String(b.id)).then(setBDetail).catch(() => {});
    else setBDetail(null);
  }, [b]);

  const result = useMemo(() => {
    if (!aDetail || !bDetail) return null;
    return analyzeSynergy(aDetail, bDetail);
  }, [aDetail, bDetail]);

  const verdictColor = {
    S: 'text-accent-green border-accent-green/30 bg-accent-green/[0.05]',
    A: 'text-accent-green border-accent-green/30 bg-accent-green/[0.05]',
    B: 'text-accent-yellow border-accent-yellow/30 bg-accent-yellow/[0.05]',
    C: 'text-accent-yellow border-accent-yellow/30 bg-accent-yellow/[0.05]',
    D: 'text-accent-red border-accent-red/30 bg-accent-red/[0.05]',
  };

  return (
    <div className="space-y-5">
      {/* Picker */}
      <div className="grid sm:grid-cols-2 gap-4">
        <PokemonCard
          label="Pokémon A"
          detail={aDetail}
          onPick={() => setPickerOpen('a')}
        />
        <PokemonCard
          label="Pokémon B"
          detail={bDetail}
          onPick={() => setPickerOpen('b')}
        />
      </div>

      {!aDetail || !bDetail ? (
        <div className="card-base p-8 text-center text-sm text-ink-dim">
          Selecciona dos Pokémon para analizar su sinergia.
        </div>
      ) : result ? (
        <>
          {/* Score grande */}
          <div className={`card-base p-6 border text-center ${verdictColor[result.verdict]}`}>
            <div className="font-display text-7xl font-bold tabular-nums">
              {result.score}
              <span className="text-2xl text-ink-faint">/100</span>
            </div>
            <div className="font-display text-2xl font-bold mt-1">
              Tier {result.verdict}
            </div>
            <p className="text-sm text-ink-soft mt-2">{result.verdictText}</p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ScoreCard
              label="Defensa"
              value={result.defensiveBonus}
              max={30}
              icon={ShieldIcon}
              tone="text-brand-glow"
            />
            <ScoreCard
              label="Ofensa"
              value={result.offensiveBonus}
              max={30}
              icon={SwordIcon}
              tone="text-accent-red"
            />
            <ScoreCard
              label="Stat split"
              value={result.statBonus}
              max={20}
              icon={SwordIcon}
              tone="text-purple-300"
            />
            <ScoreCard
              label="Speed"
              value={result.speedBonus}
              max={20}
              icon={SwordIcon}
              tone="text-accent-yellow"
            />
          </div>

          {/* Coverage details */}
          <div className="grid sm:grid-cols-2 gap-3">
            <CoverageBlock
              title={`${aDetail.name} cubre defensivamente a ${bDetail.name}`}
              types={result.aCoversForB}
              tone="text-brand-glow"
            />
            <CoverageBlock
              title={`${bDetail.name} cubre defensivamente a ${aDetail.name}`}
              types={result.bCoversForA}
              tone="text-brand-glow"
            />
            <CoverageBlock
              title={`${aDetail.name} aporta coverage ofensiva única`}
              types={result.aHitsForB}
              tone="text-accent-red"
            />
            <CoverageBlock
              title={`${bDetail.name} aporta coverage ofensiva única`}
              types={result.bHitsForA}
              tone="text-accent-red"
            />
          </div>

          <p className="text-[10px] text-ink-faint">
            El score considera solo análisis por tipos. No incluye items,
            abilities o moves específicos — para análisis profundo, usa el
            equipo completo en{' '}
            <a href="/team-builder" className="text-brand-glow underline">
              Team Builder
            </a>{' '}
            con todos los análisis.
          </p>
        </>
      ) : null}

      <PokemonSelectModal
        open={pickerOpen !== null}
        onClose={() => setPickerOpen(null)}
        onPick={(p) => {
          if (pickerOpen === 'a') setA(p);
          else if (pickerOpen === 'b') setB(p);
          setPickerOpen(null);
        }}
        title={`Selecciona Pokémon ${pickerOpen?.toUpperCase()}`}
      />
    </div>
  );
}

function PokemonCard({
  label,
  detail,
  onPick,
}: {
  label: string;
  detail: PokemonDetail | null;
  onPick: () => void;
}) {
  if (detail) {
    return (
      <button
        onClick={onPick}
        className="card-base p-4 w-full text-left flex items-center gap-3 hover:bg-white/[0.04]"
      >
        <img
          src={artworkFor(detail.id)}
          alt={detail.name}
          className="w-16 h-16 object-contain shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint">
            {label}
          </div>
          <div className="font-display font-bold capitalize">
            {detail.name.replace(/-/g, ' ')}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {detail.types.map((t) => (
              <TypeBadge key={t} type={t} size="xs" />
            ))}
          </div>
        </div>
        <span className="text-xs text-brand-glow shrink-0">Cambiar</span>
      </button>
    );
  }
  return (
    <button
      onClick={onPick}
      className="card-base card-hover p-5 w-full border-2 border-dashed border-white/[0.08] hover:border-brand/30 flex flex-col items-center justify-center gap-2 text-sm font-bold text-ink-dim hover:text-ink min-h-[100px]"
    >
      <PlusIcon className="w-5 h-5" />
      Selecciona {label}
    </button>
  );
}

function ScoreCard({
  label,
  value,
  max,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  icon: any;
  tone: string;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="card-base p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">
          {label}
        </span>
        <Icon className={`w-3 h-3 ${tone}`} />
      </div>
      <div className={`font-display text-xl font-bold tabular-nums ${tone}`}>
        {value}
        <span className="text-xs text-ink-faint">/{max}</span>
      </div>
      <div className="mt-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full ${tone === 'text-accent-red' ? 'bg-accent-red' : tone === 'text-brand-glow' ? 'bg-brand-glow' : tone === 'text-purple-300' ? 'bg-purple-400' : 'bg-accent-yellow'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CoverageBlock({
  title,
  types,
  tone,
}: {
  title: string;
  types: string[];
  tone: string;
}) {
  return (
    <div className="card-base p-3 capitalize">
      <div className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${tone}`}>
        {title}
      </div>
      {types.length === 0 ? (
        <div className="text-xs text-ink-faint italic">Ninguno</div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {types.map((t) => (
            <TypeBadge key={t} type={t as any} size="xs" />
          ))}
        </div>
      )}
    </div>
  );
}
