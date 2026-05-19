'use client';

import { useMemo, useState } from 'react';
import {
  STAT_KEYS,
  STAT_LABELS,
  STAT_LABELS_SHORT,
  NATURES,
  natureMultiplier,
  calcAllStats,
  totalEVs,
  MAX_TOTAL_EVS,
  MAX_EV_PER_STAT,
  type StatKey,
  type Nature,
} from '@/lib/stats';

// Presets de Pokémon populares para empezar rápido.
const PRESETS: Array<{ name: string; base: Record<StatKey, number> }> = [
  { name: 'Garchomp', base: { hp: 108, attack: 130, defense: 95, specialAttack: 80, specialDefense: 85, speed: 102 } },
  { name: 'Iron Hands', base: { hp: 154, attack: 140, defense: 108, specialAttack: 50, specialDefense: 68, speed: 50 } },
  { name: 'Great Tusk', base: { hp: 115, attack: 131, defense: 131, specialAttack: 53, specialDefense: 53, speed: 87 } },
  { name: 'Kingambit', base: { hp: 100, attack: 135, defense: 120, specialAttack: 60, specialDefense: 85, speed: 50 } },
  { name: 'Flutter Mane', base: { hp: 55, attack: 55, defense: 55, specialAttack: 135, specialDefense: 135, speed: 135 } },
  { name: 'Skeledirge', base: { hp: 104, attack: 75, defense: 100, specialAttack: 110, specialDefense: 75, speed: 66 } },
  { name: 'Custom', base: { hp: 100, attack: 100, defense: 100, specialAttack: 100, specialDefense: 100, speed: 100 } },
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

export function StatCalculator() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [base, setBase] = useState(PRESETS[0].base);
  const [level, setLevel] = useState(50);
  const [natureIdx, setNatureIdx] = useState(15); // Modest
  const [ivs, setIvs] = useState(MAX_IVS);
  const [evs, setEvs] = useState({ ...ZERO_STATS, hp: 252, speed: 252, defense: 4 });

  const nature = NATURES[natureIdx];

  const finalStats = useMemo(
    () => calcAllStats({ base, ivs, evs, level, nature }),
    [base, ivs, evs, level, nature]
  );

  const totalEv = totalEVs(evs);
  const evOverflow = totalEv > MAX_TOTAL_EVS;

  const applyPreset = (idx: number) => {
    setPresetIdx(idx);
    setBase(PRESETS[idx].base);
  };

  const maxOutStat = (stat: StatKey) => {
    setEvs((prev) => ({ ...prev, [stat]: MAX_EV_PER_STAT }));
  };

  const clearEVs = () => setEvs(ZERO_STATS);

  return (
    <div className="space-y-5">
      {/* Top: preset + level + nature */}
      <div className="card-base p-4 grid sm:grid-cols-3 gap-3">
        <label className="text-xs">
          <span className="text-ink-dim">Pokémon (preset o custom)</span>
          <select
            value={presetIdx}
            onChange={(e) => applyPreset(Number(e.target.value))}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
          >
            {PRESETS.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="text-ink-dim">Nivel (1-100)</span>
          <input
            type="number"
            min={1}
            max={100}
            value={level}
            onChange={(e) => setLevel(Math.max(1, Math.min(100, Number(e.target.value))))}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm tabular-nums"
          />
        </label>
        <label className="text-xs">
          <span className="text-ink-dim">Naturaleza</span>
          <select
            value={natureIdx}
            onChange={(e) => setNatureIdx(Number(e.target.value))}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
          >
            {NATURES.map((n, i) => (
              <option key={n.name} value={i}>
                {n.name}
                {n.up && n.down
                  ? ` (+${STAT_LABELS_SHORT[n.up]} / -${STAT_LABELS_SHORT[n.down]})`
                  : ' (neutra)'}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Tabla principal */}
      <div className="card-base p-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-ink-faint">
              <th className="text-left py-2 px-2">Stat</th>
              <th className="text-right py-2 px-2">Base</th>
              <th className="text-right py-2 px-2">IV</th>
              <th className="text-right py-2 px-2">EV</th>
              <th className="text-right py-2 px-2">Nat</th>
              <th className="text-right py-2 px-2 text-brand-glow">Total</th>
            </tr>
          </thead>
          <tbody>
            {STAT_KEYS.map((k) => {
              const mult = natureMultiplier(nature, k);
              return (
                <tr key={k} className="border-t border-white/[0.04]">
                  <td className="py-2 px-2 font-semibold">{STAT_LABELS[k]}</td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={base[k]}
                      onChange={(e) =>
                        setBase((p) => ({ ...p, [k]: Number(e.target.value) || 0 }))
                      }
                      className="w-16 h-8 px-2 text-right rounded bg-white/[0.04] border border-white/[0.06] text-xs tabular-nums"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={ivs[k]}
                      onChange={(e) =>
                        setIvs((p) => ({ ...p, [k]: Math.min(31, Math.max(0, Number(e.target.value) || 0)) }))
                      }
                      className="w-14 h-8 px-2 text-right rounded bg-white/[0.04] border border-white/[0.06] text-xs tabular-nums"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={252}
                        step={4}
                        value={evs[k]}
                        onChange={(e) =>
                          setEvs((p) => ({
                            ...p,
                            [k]: Math.min(252, Math.max(0, Number(e.target.value) || 0)),
                          }))
                        }
                        className="w-16 h-8 px-2 text-right rounded bg-white/[0.04] border border-white/[0.06] text-xs tabular-nums"
                      />
                      <button
                        onClick={() => maxOutStat(k)}
                        className="text-[9px] text-brand-glow hover:text-brand-hover uppercase tracking-widest"
                        title="Max EV (252)"
                      >
                        252
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right text-xs">
                    {k === 'hp' ? (
                      <span className="text-ink-faint">—</span>
                    ) : mult === 1.1 ? (
                      <span className="text-accent-green">+10%</span>
                    ) : mult === 0.9 ? (
                      <span className="text-accent-red">−10%</span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className="font-display text-xl font-bold tabular-nums text-brand-glow">
                      {finalStats[k]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.06]">
              <td colSpan={3} className="py-2 px-2 text-xs text-ink-faint">
                Total EVs
              </td>
              <td className="py-2 px-2 text-right text-xs">
                <span
                  className={
                    evOverflow ? 'text-accent-red font-bold' : 'text-ink'
                  }
                >
                  {totalEv} / {MAX_TOTAL_EVS}
                </span>
              </td>
              <td colSpan={2} className="py-2 px-2 text-right">
                <button
                  onClick={clearEVs}
                  className="text-[10px] uppercase tracking-widest text-ink-faint hover:text-ink"
                >
                  Reset EVs
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {evOverflow && (
        <div className="card-base p-3 text-xs text-accent-red border-accent-red/30">
          ⚠ Has superado los 510 EVs totales — esta distribución NO es legal
          in-game.
        </div>
      )}

      <div className="text-xs text-ink-faint">
        Fórmula oficial Game Freak. Nivel 50 es el estándar VGC, nivel 100 para
        OU. Tip: 4 EVs = +1 stat (a partir de 252).
      </div>
    </div>
  );
}
