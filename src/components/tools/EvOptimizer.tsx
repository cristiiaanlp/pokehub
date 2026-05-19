'use client';

import { useMemo, useState } from 'react';
import {
  STAT_KEYS,
  STAT_LABELS,
  NATURES,
  calcStat,
  evNeededForTarget,
  type StatKey,
} from '@/lib/stats';
import { CheckIcon } from '@/components/ui/Icon';

// Benchmarks típicos del meta VGC Reg G / OU SV. Bases reales.
interface Benchmark {
  name: string;
  stat: StatKey;
  value: number;
  notes: string;
}

const BENCHMARKS: Benchmark[] = [
  // Velocidad
  { name: 'Garchomp scarf (max Spe, Jolly)', stat: 'speed', value: 442, notes: 'Bench muy común en VGC' },
  { name: 'Iron Valiant base 116 Spe (max, +Spe)', stat: 'speed', value: 200, notes: 'Lv50 sin scarf' },
  { name: 'Tornadus base 121 Spe (max, +Spe)', stat: 'speed', value: 206, notes: 'Tailwind setter' },
  { name: 'Greninja base 122 (max, +Spe)', stat: 'speed', value: 207, notes: 'OU lvl 100' },
  { name: 'Flutter Mane base 135 Spe (max, +Spe)', stat: 'speed', value: 222, notes: 'Lv50' },
  { name: 'Miraidon base 135 (max, +Spe)', stat: 'speed', value: 222, notes: 'Lv50, Quark Drive Spe activo = 288' },
  { name: 'Whimsicott base 116 (max, +Spe)', stat: 'speed', value: 200, notes: 'Prankster outspeed' },
  { name: 'Iron Hands base 50 (0 IVs/EVs)', stat: 'speed', value: 76, notes: 'Trick Room speed' },
  // HP/Defenses (lv50 approximates)
  { name: 'HP "redondo" para Tera Rocosa', stat: 'hp', value: 168, notes: 'Múltiplo de 16 → Leftovers heal eficiente' },
  { name: 'HP para sobrevivir Stealth Rock x4 weak', stat: 'hp', value: 200, notes: '50% HP tras SR — Boots highly recommended' },
];

const ZERO_STATS: Record<StatKey, number> = {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
};
const MAX_IVS: Record<StatKey, number> = {
  hp: 31,
  attack: 31,
  defense: 31,
  specialAttack: 31,
  specialDefense: 31,
  speed: 31,
};

export function EvOptimizer() {
  const [base, setBase] = useState<Record<StatKey, number>>({
    hp: 100,
    attack: 100,
    defense: 100,
    specialAttack: 100,
    specialDefense: 100,
    speed: 100,
  });
  const [level, setLevel] = useState(50);
  const [stat, setStat] = useState<StatKey>('speed');
  const [target, setTarget] = useState<number>(200);
  const [natureBoost, setNatureBoost] = useState<'plus' | 'neutral' | 'minus'>('plus');
  const [ivOverride, setIvOverride] = useState(31);

  // Nature simulado: Timid para +Spe, Hardy neutral, Brave para -Spe.
  // Para HP siempre es neutral.
  const nature = useMemo(() => {
    if (stat === 'hp' || natureBoost === 'neutral') return NATURES[0]; // Hardy
    if (natureBoost === 'plus') {
      const found = NATURES.find((n) => n.up === stat);
      return found ?? NATURES[0];
    }
    const found = NATURES.find((n) => n.down === stat);
    return found ?? NATURES[0];
  }, [stat, natureBoost]);

  const minEv = useMemo(
    () => evNeededForTarget(base[stat], ivOverride, level, nature, stat, target),
    [base, stat, target, level, nature, ivOverride]
  );

  // Stat resultante con minEv (si alcanzable)
  const resultStat =
    minEv >= 0
      ? calcStat(base[stat], ivOverride, minEv, level, nature, stat)
      : 0;

  const applyBench = (b: Benchmark) => {
    setStat(b.stat);
    setTarget(b.value);
    setNatureBoost('plus');
  };

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="card-base p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <label>
          <span className="text-xs text-ink-dim">Tu base stat ({STAT_LABELS[stat]})</span>
          <input
            type="number"
            min={1}
            max={255}
            value={base[stat]}
            onChange={(e) =>
              setBase((p) => ({ ...p, [stat]: Number(e.target.value) || 0 }))
            }
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] tabular-nums"
          />
        </label>
        <label>
          <span className="text-xs text-ink-dim">Stat objetivo</span>
          <input
            type="number"
            min={0}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value) || 0)}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] tabular-nums"
          />
        </label>
        <label>
          <span className="text-xs text-ink-dim">Stat</span>
          <select
            value={stat}
            onChange={(e) => setStat(e.target.value as StatKey)}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06]"
          >
            {STAT_KEYS.map((k) => (
              <option key={k} value={k}>
                {STAT_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs text-ink-dim">Naturaleza</span>
          <select
            value={natureBoost}
            onChange={(e) => setNatureBoost(e.target.value as any)}
            disabled={stat === 'hp'}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] disabled:opacity-50"
          >
            <option value="plus">+10% ({nature.name})</option>
            <option value="neutral">Neutra</option>
            <option value="minus">−10%</option>
          </select>
        </label>
        <label>
          <span className="text-xs text-ink-dim">IV</span>
          <input
            type="number"
            min={0}
            max={31}
            value={ivOverride}
            onChange={(e) =>
              setIvOverride(Math.min(31, Math.max(0, Number(e.target.value) || 0)))
            }
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] tabular-nums"
          />
        </label>
        <label>
          <span className="text-xs text-ink-dim">Nivel</span>
          <input
            type="number"
            min={1}
            max={100}
            value={level}
            onChange={(e) =>
              setLevel(Math.max(1, Math.min(100, Number(e.target.value))))
            }
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] tabular-nums"
          />
        </label>
      </div>

      {/* Resultado */}
      <div
        className={`card-base p-5 ${
          minEv >= 0
            ? 'border-accent-green/30 bg-accent-green/[0.04]'
            : 'border-accent-red/30 bg-accent-red/[0.04]'
        }`}
      >
        {minEv >= 0 ? (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-accent-green font-bold flex items-center gap-1">
              <CheckIcon className="w-3 h-3" />
              Resultado
            </div>
            <div className="font-display text-3xl font-bold">
              <span className="text-brand-glow tabular-nums">{minEv}</span>
              <span className="text-base font-normal text-ink-soft ml-2">
                EVs mínimos en {STAT_LABELS[stat]}
              </span>
            </div>
            <div className="text-sm text-ink-dim">
              Con esos EVs alcanzas{' '}
              <strong className="text-ink">{resultStat}</strong> de{' '}
              {STAT_LABELS[stat]} (objetivo: {target}).
            </div>
            {minEv === 0 && (
              <div className="text-xs text-accent-green">
                ✨ Ya tienes ese stat sin invertir EVs.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-accent-red font-bold">
              Inalcanzable
            </div>
            <div className="font-display text-xl font-bold">
              Aunque maxees EVs (252) + IVs (31) + nature, no llegas a {target}.
            </div>
            <div className="text-sm text-ink-dim">
              Máximo posible con base {base[stat]}:{' '}
              <strong className="text-ink">
                {calcStat(base[stat], 31, 252, level, nature, stat)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Benchmarks */}
      <div className="card-base p-4">
        <h3 className="font-display font-bold text-sm mb-3">
          Benchmarks comunes (click para aplicar)
        </h3>
        <div className="space-y-1">
          {BENCHMARKS.map((b) => (
            <button
              key={b.name}
              onClick={() => applyBench(b)}
              className="w-full text-left p-2.5 rounded-lg glass hover:bg-white/[0.08] flex items-center gap-3"
            >
              <span className="font-semibold text-sm flex-1 truncate">
                {b.name}
              </span>
              <span className="text-xs text-ink-dim">{STAT_LABELS[b.stat]}</span>
              <span className="font-display font-bold text-brand-glow tabular-nums">
                {b.value}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-ink-faint mt-3">
          Tip: aspirando a outspeedear, suma 1 al benchmark (ej. "outspeed Garchomp scarf" = 443).
        </p>
      </div>
    </div>
  );
}
