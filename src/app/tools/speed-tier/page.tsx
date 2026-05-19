'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/common/PageHeader';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { Button } from '@/components/ui/Button';
import {
  BoltIcon,
  ArrowRight,
  SearchIcon,
} from '@/components/ui/Icon';
import { artworkFor, getPokemon } from '@/lib/pokeapi';
import { formatPokemonName, padId } from '@/lib/utils';
import {
  NATURES_SPEED,
  SPEED_ITEMS,
  SPEED_ABILITIES,
  STAGE_MULT,
  computeSpeed,
  BENCHMARKS,
} from '@/lib/team-analysis/speed';

interface State {
  speciesId: number;
  name: string;
  baseSpeed: number;
}

const DEFAULTS: State = { speciesId: 445, name: 'garchomp', baseSpeed: 102 };

export default function SpeedTierPage() {
  const [target, setTarget] = useState<State>(DEFAULTS);
  const [level, setLevel] = useState(50);
  const [ev, setEv] = useState(252);
  const [iv, setIv] = useState(31);
  const [natureId, setNatureId] = useState<string>('jolly');
  const [itemId, setItemId] = useState('none');
  const [abilityId, setAbilityId] = useState('none');
  const [stages, setStages] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loadingPick, setLoadingPick] = useState(false);

  const nature = NATURES_SPEED.find((n) => n.id === natureId)!;
  const item = SPEED_ITEMS.find((i) => i.id === itemId)!;
  const ability = SPEED_ABILITIES.find((a) => a.id === abilityId)!;

  const speed = computeSpeed({
    baseSpeed: target.baseSpeed,
    level,
    ev,
    iv,
    natureMult: nature.mult,
    itemMult: item.mult,
    abilityMult: ability.mult,
    stages,
  });

  // Speeds at stage 0 baseline for reference
  const baseline = computeSpeed({
    baseSpeed: target.baseSpeed,
    level,
    ev,
    iv,
    natureMult: nature.mult,
    itemMult: item.mult,
    abilityMult: 1,
    stages: 0,
  });

  const onPick = async (id: number) => {
    setLoadingPick(true);
    try {
      const data = await getPokemon(id);
      setTarget({
        speciesId: data.id,
        name: data.name,
        baseSpeed: data.stats.speed,
      });
    } finally {
      setLoadingPick(false);
    }
  };

  // Sort benchmarks: show ALL with our final speed highlighted
  const benchmarksSorted = [...BENCHMARKS]
    .sort((a, b) => b.speed - a.speed);

  const outspeed = benchmarksSorted.filter((b) => speed > b.speed);
  const outspedBy = benchmarksSorted.filter((b) => speed < b.speed);
  const tied = benchmarksSorted.find((b) => b.speed === speed);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <PageHeader
        kicker="Herramienta competitiva"
        title={
          <>
            <span className="gradient-text">Speed Tier</span> Visualizer
          </>
        }
        subtitle="Configura EVs, naturaleza, items y boosts. Mira en vivo a quién adelantas y quién te adelanta en el meta competitivo."
        right={
          <Link href="/team-builder" className="text-sm text-ink-faint hover:text-ink">
            ← Team Builder
          </Link>
        }
      />

      <div className="grid lg:grid-cols-[1fr,1.2fr] gap-5">
        {/* Controls */}
        <div className="space-y-4">
          {/* Pokémon target */}
          <div className="card-base p-5">
            <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-3">
              Pokémon objetivo
            </div>
            <div className="flex items-center gap-3">
              <img
                src={artworkFor(target.speciesId)}
                alt={target.name}
                className="w-16 h-16 object-contain shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-ink-faint">
                  #{padId(target.speciesId)}
                </div>
                <div className="font-display text-xl font-bold">
                  {formatPokemonName(target.name)}
                </div>
                <div className="text-xs text-ink-dim">
                  Base Speed:{' '}
                  <span className="font-bold text-ink">
                    {target.baseSpeed}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPickerOpen(true)}
                disabled={loadingPick}
              >
                <SearchIcon className="w-3.5 h-3.5" />
                Cambiar
              </Button>
            </div>
          </div>

          {/* EV/IV sliders */}
          <div className="card-base p-5 space-y-4">
            <SliderRow
              label="EVs en Speed"
              value={ev}
              min={0}
              max={252}
              step={4}
              onChange={setEv}
              suffix={`/${252}`}
            />
            <SliderRow
              label="IV"
              value={iv}
              min={0}
              max={31}
              step={1}
              onChange={setIv}
              suffix="/31"
            />
            <SliderRow
              label="Nivel"
              value={level}
              min={1}
              max={100}
              step={1}
              onChange={setLevel}
            />
          </div>

          {/* Selects */}
          <div className="card-base p-5 space-y-3">
            <Select
              label="Naturaleza"
              value={natureId}
              onChange={setNatureId}
              options={NATURES_SPEED.map((n) => ({
                value: n.id,
                label: n.label,
              }))}
            />
            <Select
              label="Item"
              value={itemId}
              onChange={setItemId}
              options={SPEED_ITEMS.map((i) => ({
                value: i.id,
                label: i.label + (i.mult !== 1 ? ` (${i.mult}×)` : ''),
              }))}
            />
            <Select
              label="Habilidad / Buff"
              value={abilityId}
              onChange={setAbilityId}
              options={SPEED_ABILITIES.map((a) => ({
                value: a.id,
                label: a.label + (a.mult !== 1 ? ` (${a.mult}×)` : ''),
              }))}
            />
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-ink-dim font-semibold uppercase tracking-widest text-[10px]">
                  Stages (Dragon Dance, etc.)
                </span>
                <span className="font-mono font-bold text-ink">
                  {stages > 0 ? '+' : ''}
                  {stages} ({(STAGE_MULT[stages] ?? 1).toFixed(2)}×)
                </span>
              </div>
              <div className="flex gap-1">
                {[-2, -1, 0, 1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStages(s)}
                    className={`flex-1 h-9 rounded-md text-xs font-bold transition-colors ${
                      stages === s
                        ? 'bg-brand text-white shadow-glow'
                        : 'glass text-ink-soft hover:text-ink'
                    }`}
                  >
                    {s > 0 ? `+${s}` : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result + benchmarks */}
        <div className="space-y-4">
          <motion.div
            key={speed}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="card-base p-6 relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
            <div className="relative text-center">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1">
                Speed final
              </div>
              <motion.div
                key={speed}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-display text-6xl sm:text-7xl font-bold tabular-nums gradient-text inline-flex items-center gap-2"
              >
                <BoltIcon className="w-12 h-12 text-accent-yellow" />
                {speed}
              </motion.div>
              {baseline !== speed && (
                <div className="text-xs text-ink-faint mt-1">
                  Base sin boost: {baseline} ·{' '}
                  <span className="text-accent-green">
                    +{speed - baseline}
                  </span>{' '}
                  con modificadores
                </div>
              )}
              {tied && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 h-7 rounded-md bg-accent-yellow/15 text-accent-yellow text-xs font-bold uppercase tracking-widest">
                  ⚡ Empata con {tied.name}
                </div>
              )}
            </div>
          </motion.div>

          <div className="card-base p-5">
            <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2 text-accent-green">
              <BoltIcon className="w-4 h-4" />
              Adelantas a {outspeed.length} benchmark{outspeed.length === 1 ? '' : 's'}
            </h3>
            <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
              {outspeed.slice(0, 10).map((b) => (
                <BenchmarkRow key={b.name} b={b} current={speed} faster={true} />
              ))}
              {outspeed.length === 0 && (
                <div className="text-xs text-ink-dim text-center py-3">
                  No adelantas a nadie del top tier — sube EVs o usa Scarf.
                </div>
              )}
            </div>
          </div>

          <div className="card-base p-5">
            <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2 text-accent-red">
              <BoltIcon className="w-4 h-4" />
              Te adelantan {outspedBy.length} benchmark{outspedBy.length === 1 ? '' : 's'}
            </h3>
            <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
              {outspedBy.slice(0, 10).map((b) => (
                <BenchmarkRow key={b.name} b={b} current={speed} faster={false} />
              ))}
              {outspedBy.length === 0 && (
                <div className="text-xs text-accent-green text-center py-3 font-bold">
                  🚀 Más rápido que TODO el meta. Eres absurdo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-ink-faint text-center">
        Fórmula:{' '}
        <code className="font-mono">
          floor((2·base + IV + EV/4) × nivel/100 + 5) × nature × item × ability × stages
        </code>
      </div>

      <PokemonSelectModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Pokémon objetivo"
        onPick={(p) => onPick(p.id)}
      />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-ink-dim font-semibold uppercase tracking-widest text-[10px]">
          {label}
        </span>
        <span className="font-mono font-bold text-ink tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1.5">
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg glass text-sm font-medium bg-bg-900 border border-white/[0.06] outline-none focus:border-brand/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function BenchmarkRow({
  b,
  current,
  faster,
}: {
  b: { name: string; speed: number; note: string };
  current: number;
  faster: boolean;
}) {
  const diff = current - b.speed;
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg glass text-xs">
      <div
        className={`w-1 h-8 rounded-full ${
          faster ? 'bg-accent-green' : 'bg-accent-red'
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink truncate">{b.name}</div>
        <div className="text-[10px] text-ink-faint truncate">{b.note}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-mono font-bold tabular-nums">{b.speed}</div>
        <div
          className={`text-[9px] font-mono ${
            faster ? 'text-accent-green' : 'text-accent-red'
          }`}
        >
          {faster ? '+' : ''}
          {diff}
        </div>
      </div>
    </div>
  );
}
