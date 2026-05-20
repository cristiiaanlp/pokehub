'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/common/PageHeader';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { Button } from '@/components/ui/Button';
import { SearchIcon, BoltIcon, FireIcon, CheckIcon } from '@/components/ui/Icon';
import { getPokemon, artworkFor } from '@/lib/pokeapi';
import { formatPokemonName, padId } from '@/lib/utils';
import {
  encodeCalcState,
  decodeCalcState,
  type SharedCalcState,
} from '@/lib/damage/share';
import {
  calculateDamage,
  type BattlerInput,
  type FieldInput,
  type MoveData,
  type AbilityId,
  type ItemId,
} from '@/lib/damage/formula';
import { COMPETITIVE_MOVES } from '@/lib/damage/moves';
import {
  POKEMON_NATURES,
  DEFAULT_EVS_OFFENSIVE_PHYS,
  DEFAULT_EVS_OFFENSIVE_SPEC,
  DEFAULT_EVS_DEFENSIVE,
} from '@/lib/damage/stats';
import { ITEM_MODIFIERS, ITEM_LABELS } from '@/lib/damage/items';
import { ABILITY_LABELS } from '@/lib/damage/abilities';
import type { PokemonType } from '@/types/pokemon';

interface PokeStats {
  speciesId: number;
  name: string;
  types: PokemonType[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
}

const DEFAULTS = {
  attacker: {
    speciesId: 445,
    name: 'garchomp',
    types: ['dragon', 'ground'] as PokemonType[],
    baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
  } as PokeStats,
  defender: {
    speciesId: 437,
    name: 'bronzong',
    types: ['steel', 'psychic'] as PokemonType[],
    baseStats: { hp: 67, atk: 89, def: 116, spa: 79, spd: 116, spe: 33 },
  } as PokeStats,
};

export default function DamageCalcPage() {
  const [attacker, setAttacker] = useState<PokeStats>(DEFAULTS.attacker);
  const [defender, setDefender] = useState<PokeStats>(DEFAULTS.defender);

  // Attacker settings
  const [atkLevel, setAtkLevel] = useState(50);
  const [atkNature, setAtkNature] = useState('jolly');
  const [atkAtkEv, setAtkAtkEv] = useState(252);
  const [atkSpaEv, setAtkSpaEv] = useState(0);
  const [atkAbility, setAtkAbility] = useState<AbilityId>('none');
  const [atkItem, setAtkItem] = useState<ItemId>('life-orb');
  const [atkStage, setAtkStage] = useState(0);

  // Defender settings
  const [defLevel, setDefLevel] = useState(50);
  const [defNature, setDefNature] = useState('careful');
  const [defHpEv, setDefHpEv] = useState(252);
  const [defDefEv, setDefDefEv] = useState(0);
  const [defSpdEv, setDefSpdEv] = useState(252);
  const [defAbility, setDefAbility] = useState<AbilityId>('none');
  const [defItem, setDefItem] = useState<ItemId>('none');
  const [defStage, setDefStage] = useState(0);
  const [defHpPct, setDefHpPct] = useState(100);

  // Move
  const [moveName, setMoveName] = useState('Earthquake');

  // Field
  const [weather, setWeather] = useState<FieldInput['weather']>('none');
  const [terrain, setTerrain] = useState<FieldInput['terrain']>('none');
  const [critical, setCritical] = useState(false);
  const [reflect, setReflect] = useState(false);
  const [lightScreen, setLightScreen] = useState(false);

  // Picker
  const [pickerFor, setPickerFor] = useState<'attacker' | 'defender' | null>(null);
  const [loadingPick, setLoadingPick] = useState(false);

  // Share
  const [justCopied, setJustCopied] = useState(false);
  const [hydrating, setHydrating] = useState(false);

  // Hidratar desde URL al montar (deep-link compartido)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (!sp.has('a') && !sp.has('d')) return;
    const s = decodeCalcState(sp);
    setHydrating(true);

    (async () => {
      try {
        if (s.a) {
          const data = await getPokemon(s.a);
          setAttacker({
            speciesId: data.id,
            name: data.name,
            types: data.types,
            baseStats: {
              hp: data.stats.hp,
              atk: data.stats.attack,
              def: data.stats.defense,
              spa: data.stats.specialAttack,
              spd: data.stats.specialDefense,
              spe: data.stats.speed,
            },
          });
        }
        if (s.d) {
          const data = await getPokemon(s.d);
          setDefender({
            speciesId: data.id,
            name: data.name,
            types: data.types,
            baseStats: {
              hp: data.stats.hp,
              atk: data.stats.attack,
              def: data.stats.defense,
              spa: data.stats.specialAttack,
              spd: data.stats.specialDefense,
              spe: data.stats.speed,
            },
          });
        }
      } catch {
        // si falla la carga, dejamos defaults
      }
      if (s.al !== undefined) setAtkLevel(s.al);
      if (s.an) setAtkNature(s.an);
      if (s.aae !== undefined) setAtkAtkEv(s.aae);
      if (s.ase !== undefined) setAtkSpaEv(s.ase);
      if (s.aa) setAtkAbility(s.aa as AbilityId);
      if (s.ai) setAtkItem(s.ai as ItemId);
      if (s.ag !== undefined) setAtkStage(s.ag);
      if (s.dl !== undefined) setDefLevel(s.dl);
      if (s.dn) setDefNature(s.dn);
      if (s.dhe !== undefined) setDefHpEv(s.dhe);
      if (s.dde !== undefined) setDefDefEv(s.dde);
      if (s.dse !== undefined) setDefSpdEv(s.dse);
      if (s.da) setDefAbility(s.da as AbilityId);
      if (s.di) setDefItem(s.di as ItemId);
      if (s.dg !== undefined) setDefStage(s.dg);
      if (s.dhp !== undefined) setDefHpPct(s.dhp);
      if (s.m) setMoveName(s.m);
      if (s.w) setWeather(s.w as FieldInput['weather']);
      if (s.t) setTerrain(s.t as FieldInput['terrain']);
      if (s.c !== undefined) setCritical(s.c === 1);
      if (s.r !== undefined) setReflect(s.r === 1);
      if (s.ls !== undefined) setLightScreen(s.ls === 1);
      setHydrating(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move: MoveData | undefined = useMemo(
    () => COMPETITIVE_MOVES.find((m) => m.name === moveName),
    [moveName]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const state: SharedCalcState = {
      a: attacker.speciesId,
      al: atkLevel,
      an: atkNature,
      aae: atkAtkEv,
      ase: atkSpaEv,
      aa: atkAbility,
      ai: atkItem,
      ag: atkStage,
      d: defender.speciesId,
      dl: defLevel,
      dn: defNature,
      dhe: defHpEv,
      dde: defDefEv,
      dse: defSpdEv,
      da: defAbility,
      di: defItem,
      dg: defStage,
      dhp: defHpPct,
      m: moveName,
      w: weather ?? 'none',
      t: terrain ?? 'none',
      c: critical ? 1 : 0,
      r: reflect ? 1 : 0,
      ls: lightScreen ? 1 : 0,
    };
    return `${window.location.origin}${window.location.pathname}?${encodeCalcState(state)}`;
  }, [
    attacker.speciesId, atkLevel, atkNature, atkAtkEv, atkSpaEv, atkAbility, atkItem, atkStage,
    defender.speciesId, defLevel, defNature, defHpEv, defDefEv, defSpdEv, defAbility, defItem, defStage, defHpPct,
    moveName, weather, terrain, critical, reflect, lightScreen,
  ]);

  const copyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      // fallback: select prompt
      window.prompt('Copia este enlace:', shareUrl);
    }
  };

  const onPick = async (kind: 'attacker' | 'defender', speciesId: number) => {
    setLoadingPick(true);
    try {
      const data = await getPokemon(speciesId);
      const stats: PokeStats = {
        speciesId: data.id,
        name: data.name,
        types: data.types,
        baseStats: {
          hp: data.stats.hp,
          atk: data.stats.attack,
          def: data.stats.defense,
          spa: data.stats.specialAttack,
          spd: data.stats.specialDefense,
          spe: data.stats.speed,
        },
      };
      if (kind === 'attacker') setAttacker(stats);
      else setDefender(stats);
    } finally {
      setLoadingPick(false);
      setPickerFor(null);
    }
  };

  const attackerInput: BattlerInput = {
    baseStats: attacker.baseStats,
    types: attacker.types,
    level: atkLevel,
    evs: { hp: 0, atk: atkAtkEv, def: 0, spa: atkSpaEv, spd: 0 },
    nature: atkNature,
    item: atkItem,
    ability: atkAbility,
    attackStage: atkStage,
  };
  const defenderInput: BattlerInput = {
    baseStats: defender.baseStats,
    types: defender.types,
    level: defLevel,
    evs: { hp: defHpEv, atk: 0, def: defDefEv, spa: 0, spd: defSpdEv },
    nature: defNature,
    item: defItem,
    ability: defAbility,
    defenseStage: defStage,
    currentHpPct: defHpPct,
  };
  const fieldInput: FieldInput = {
    weather,
    terrain,
    critical,
    reflect,
    lightScreen,
  };

  const result = move ? calculateDamage(attackerInput, defenderInput, move, fieldInput) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <PageHeader
        kicker="Herramienta competitiva"
        title={
          <>
            <span className="gradient-text">Damage</span> Calculator
          </>
        }
        subtitle="Calcula daño exacto Gen 9 con STAB, items, habilidades, weather, screens y crits. Conoce si haces OHKO antes de pulsar el botón."
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={copyShare}
              disabled={hydrating}
              className={`text-xs font-bold h-9 px-3 rounded-lg inline-flex items-center gap-1.5 transition-colors ${
                justCopied
                  ? 'bg-accent-green/15 text-accent-green'
                  : 'glass hover:bg-white/[0.08] text-ink-soft hover:text-ink'
              }`}
              aria-label="Copiar enlace compartible del cálculo"
            >
              {justCopied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" /> Copiado
                </>
              ) : (
                <>🔗 Compartir</>
              )}
            </button>
            <Link href="/team-builder" className="text-sm text-ink-faint hover:text-ink">
              ← Team Builder
            </Link>
          </div>
        }
      />

      {/* Battler cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Attacker */}
        <BattlerCard
          title="Atacante"
          accent="text-accent-red"
          poke={attacker}
          onChangePoke={() => setPickerFor('attacker')}
          level={atkLevel}
          onLevel={setAtkLevel}
          nature={atkNature}
          onNature={setAtkNature}
          evs={[
            { label: 'EVs Atk', value: atkAtkEv, onChange: setAtkAtkEv, show: move?.category === 'physical' },
            { label: 'EVs SpA', value: atkSpaEv, onChange: setAtkSpaEv, show: move?.category === 'special' },
          ]}
          ability={atkAbility}
          onAbility={(v) => setAtkAbility(v as AbilityId)}
          item={atkItem}
          onItem={(v) => setAtkItem(v as ItemId)}
          stage={atkStage}
          onStage={setAtkStage}
          stageLabel={move?.category === 'physical' ? 'Atk' : 'SpA'}
        />

        {/* Defender */}
        <BattlerCard
          title="Defensor"
          accent="text-brand-glow"
          poke={defender}
          onChangePoke={() => setPickerFor('defender')}
          level={defLevel}
          onLevel={setDefLevel}
          nature={defNature}
          onNature={setDefNature}
          evs={[
            { label: 'EVs HP', value: defHpEv, onChange: setDefHpEv, show: true },
            { label: 'EVs Def', value: defDefEv, onChange: setDefDefEv, show: move?.category === 'physical' },
            { label: 'EVs SpD', value: defSpdEv, onChange: setDefSpdEv, show: move?.category === 'special' },
          ]}
          ability={defAbility}
          onAbility={(v) => setDefAbility(v as AbilityId)}
          item={defItem}
          onItem={(v) => setDefItem(v as ItemId)}
          stage={defStage}
          onStage={setDefStage}
          stageLabel={move?.category === 'physical' ? 'Def' : 'SpD'}
          hpPct={defHpPct}
          onHpPct={setDefHpPct}
        />
      </div>

      {/* Move selector */}
      <div className="card-base p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-accent-red" />
            Movimiento
          </h3>
          {move && (
            <div className="flex items-center gap-2 text-xs">
              <TypeBadge type={move.type} size="sm" />
              <span className="font-mono text-ink-soft">
                {move.basePower} BP · {move.category}
              </span>
              {move.priority ? (
                <span className="px-2 h-5 inline-flex items-center rounded bg-accent-yellow/15 text-accent-yellow text-[10px] font-bold uppercase tracking-widest">
                  +{move.priority} prio
                </span>
              ) : null}
            </div>
          )}
        </div>
        <select
          value={moveName}
          onChange={(e) => setMoveName(e.target.value)}
          className="w-full h-11 px-3 rounded-xl glass text-sm font-semibold bg-bg-900 border border-white/[0.06] outline-none focus:border-brand/40"
        >
          <optgroup label="Físicos">
            {COMPETITIVE_MOVES.filter((m) => m.category === 'physical').map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} ({m.type}, {m.basePower} BP)
              </option>
            ))}
          </optgroup>
          <optgroup label="Especiales">
            {COMPETITIVE_MOVES.filter((m) => m.category === 'special').map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} ({m.type}, {m.basePower} BP)
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Field conditions */}
      <div className="card-base p-5 space-y-3">
        <h3 className="font-display text-lg font-bold">Condiciones de campo</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <Select
            label="Weather"
            value={weather}
            onChange={(v) => setWeather(v as FieldInput['weather'])}
            options={[
              { value: 'none', label: 'Sin clima' },
              { value: 'sun', label: '☀ Sol' },
              { value: 'rain', label: '🌧 Lluvia' },
              { value: 'sand', label: '🌪 Tormenta' },
              { value: 'snow', label: '❄ Nieve' },
            ]}
          />
          <Select
            label="Terrain"
            value={terrain}
            onChange={(v) => setTerrain(v as FieldInput['terrain'])}
            options={[
              { value: 'none', label: 'Sin terrain' },
              { value: 'electric', label: '⚡ Electric' },
              { value: 'grassy', label: '🌿 Grassy' },
              { value: 'psychic', label: '🔮 Psychic' },
              { value: 'misty', label: '☁ Misty' },
            ]}
          />
          <Toggle label="Crítico" value={critical} onChange={setCritical} />
          <div className="space-y-1.5">
            <Toggle
              label={`Reflect ${move?.category === 'physical' ? '(activo)' : ''}`}
              value={reflect}
              onChange={setReflect}
            />
            <Toggle
              label={`Light Screen ${move?.category === 'special' ? '(activo)' : ''}`}
              value={lightScreen}
              onChange={setLightScreen}
            />
          </div>
        </div>
      </div>

      {/* Result */}
      <ResultPanel result={result} move={move} attacker={attacker} defender={defender} />

      <PokemonSelectModal
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        title={pickerFor === 'attacker' ? 'Atacante' : 'Defensor'}
        onPick={(p) => pickerFor && onPick(pickerFor, p.id)}
      />
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────

function BattlerCard({
  title,
  accent,
  poke,
  onChangePoke,
  level,
  onLevel,
  nature,
  onNature,
  evs,
  ability,
  onAbility,
  item,
  onItem,
  stage,
  onStage,
  stageLabel,
  hpPct,
  onHpPct,
}: {
  title: string;
  accent: string;
  poke: PokeStats;
  onChangePoke: () => void;
  level: number;
  onLevel: (v: number) => void;
  nature: string;
  onNature: (v: string) => void;
  evs: { label: string; value: number; onChange: (v: number) => void; show: boolean }[];
  ability: AbilityId;
  onAbility: (v: string) => void;
  item: ItemId;
  onItem: (v: string) => void;
  stage: number;
  onStage: (v: number) => void;
  stageLabel: string;
  hpPct?: number;
  onHpPct?: (v: number) => void;
}) {
  return (
    <div className="card-base p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`text-xs uppercase tracking-widest font-bold ${accent}`}>
          {title}
        </div>
        <Button size="sm" variant="secondary" onClick={onChangePoke}>
          <SearchIcon className="w-3.5 h-3.5" />
          Cambiar
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={artworkFor(poke.speciesId)}
          alt={poke.name}
          className="w-16 h-16 object-contain shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-ink-faint">
            #{padId(poke.speciesId)}
          </div>
          <div className="font-display text-xl font-bold">
            {formatPokemonName(poke.name)}
          </div>
          <div className="flex gap-1 mt-1">
            {poke.types.map((t) => (
              <TypeBadge key={t} type={t} size="xs" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.05]">
        <NumField label="Nivel" value={level} min={1} max={100} onChange={onLevel} />
        <Select
          label="Naturaleza"
          value={nature}
          onChange={onNature}
          options={Object.values(POKEMON_NATURES).map((n) => ({
            value: n.id,
            label: n.label,
          }))}
        />
        {evs.filter((e) => e.show).map((e) => (
          <NumField
            key={e.label}
            label={e.label}
            value={e.value}
            min={0}
            max={252}
            step={4}
            onChange={e.onChange}
          />
        ))}
      </div>

      <Select
        label="Habilidad"
        value={ability}
        onChange={onAbility}
        options={Object.entries(ABILITY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
      />
      <Select
        label="Objeto"
        value={item}
        onChange={onItem}
        options={Object.entries(ITEM_LABELS).map(([k, v]) => ({ value: k, label: v }))}
      />

      <div>
        <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1.5">
          Stages {stageLabel}
        </div>
        <div className="flex gap-1">
          {[-2, -1, 0, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onStage(s)}
              className={`flex-1 h-8 rounded-md text-xs font-bold transition-colors ${
                stage === s
                  ? 'bg-brand text-white shadow-glow'
                  : 'glass text-ink-soft hover:text-ink'
              }`}
            >
              {s > 0 ? `+${s}` : s}
            </button>
          ))}
        </div>
      </div>

      {onHpPct !== undefined && (
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="uppercase tracking-widest text-ink-faint font-semibold">
              HP actual
            </span>
            <span className="font-mono font-bold">{hpPct}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={hpPct}
            onChange={(e) => onHpPct(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </div>
      )}
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
        className="w-full h-9 px-2 rounded-lg glass text-xs font-medium bg-bg-900 border border-white/[0.06] outline-none focus:border-brand/40"
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

function NumField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1.5">
        {label}
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="w-full h-9 px-2 rounded-lg glass text-xs font-mono bg-bg-900 border border-white/[0.06] outline-none focus:border-brand/40"
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`h-9 px-3 rounded-lg text-xs font-bold transition-colors w-full ${
        value ? 'bg-brand/15 text-brand-glow' : 'glass text-ink-soft hover:text-ink'
      }`}
    >
      {value ? '✓ ' : ''}
      {label}
    </button>
  );
}

function ResultPanel({
  result,
  move,
  attacker,
  defender,
}: {
  result: ReturnType<typeof calculateDamage>;
  move?: MoveData;
  attacker: PokeStats;
  defender: PokeStats;
}) {
  if (!move || !result) {
    return (
      <div className="card-base p-10 text-center text-ink-dim text-sm">
        Selecciona un movimiento para calcular el daño.
      </div>
    );
  }

  const isImmune = result.maxDamage === 0;
  const isKO = result.minPct >= 100;
  const tone = isImmune
    ? 'text-ink-faint'
    : isKO
    ? 'text-accent-green'
    : result.maxPct >= 50
    ? 'text-accent-yellow'
    : 'text-ink';

  return (
    <motion.div
      key={`${move.name}-${result.minDamage}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-6 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent-red/15 blur-3xl pointer-events-none" />
      <div className="relative space-y-4">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1">
            {formatPokemonName(attacker.name)} usa{' '}
            <span className="text-ink">{move.name}</span> contra{' '}
            {formatPokemonName(defender.name)}
          </div>
          {isImmune ? (
            <div className={`font-display text-5xl font-bold ${tone}`}>
              ⛔ INMUNE
            </div>
          ) : (
            <>
              <div
                className={`font-display text-5xl sm:text-6xl font-bold tabular-nums ${tone} inline-flex items-baseline gap-2`}
              >
                <BoltIcon className="w-12 h-12 text-accent-yellow" />
                {result.minPct.toFixed(1)}–{result.maxPct.toFixed(1)}%
              </div>
              <div className="text-xs text-ink-dim mt-1">
                {result.minDamage}–{result.maxDamage} de {result.defenderHp} HP
              </div>
            </>
          )}
        </div>

        {!isImmune && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <ResultStat
                label="OHKO"
                value={`${result.ohkoPct.toFixed(0)}%`}
                tone={result.ohkoPct === 100 ? 'green' : result.ohkoPct >= 50 ? 'yellow' : 'red'}
              />
              <ResultStat
                label={`Hits to KO (best)`}
                value={
                  result.bestHitsToKo === Infinity ? '∞' : String(result.bestHitsToKo)
                }
              />
              <ResultStat
                label="Hits to KO (worst)"
                value={
                  result.worstHitsToKo === Infinity ? '∞' : String(result.worstHitsToKo)
                }
              />
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1.5">
                Rolls (16 valores aleatorios 85-100%)
              </div>
              <div className="grid grid-cols-8 gap-1 text-[10px] font-mono">
                {result.rolls.map((r, i) => {
                  const pct = (r / result.defenderHp) * 100;
                  const ko = pct >= 100;
                  return (
                    <div
                      key={i}
                      className={`text-center py-1 rounded ${
                        ko ? 'bg-accent-green/20 text-accent-green' : 'bg-white/[0.04] text-ink-soft'
                      }`}
                      title={`Roll ${i}: ${r} (${pct.toFixed(1)}%)`}
                    >
                      {r}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-1.5">
                Desglose
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.modifierBreakdown.map((m, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-1 rounded glass font-mono"
                  >
                    {m.label}: ×{m.mult.toFixed(2)}
                  </span>
                ))}
                <span className="text-[10px] px-2 py-1 rounded glass font-mono">
                  Atk stat: {result.attackStat}
                </span>
                <span className="text-[10px] px-2 py-1 rounded glass font-mono">
                  Def stat: {result.defenseStat}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'green' | 'yellow' | 'red';
}) {
  const toneCls = tone === 'green'
    ? 'text-accent-green'
    : tone === 'yellow'
    ? 'text-accent-yellow'
    : tone === 'red'
    ? 'text-accent-red'
    : 'text-ink';
  return (
    <div className="card-base p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
        {label}
      </div>
      <div className={`font-display text-xl font-bold mt-1 tabular-nums ${toneCls}`}>
        {value}
      </div>
    </div>
  );
}

