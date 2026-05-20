'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { artworkFor, getPokemon } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import {
  PlusIcon,
  SwordIcon,
  ShieldIcon,
  ArrowRight,
} from '@/components/ui/Icon';
import {
  calculateDamage,
  type BattlerInput,
  type FieldInput,
  type MoveData,
} from '@/lib/damage/formula';
import { COMPETITIVE_MOVES } from '@/lib/damage/moves';
import type { PokemonDetail, PokemonListItem } from '@/types/pokemon';
import type { MetaThreat } from '@/lib/team-analysis/threats';

interface RowResult {
  threat: MetaThreat;
  minPct: number;
  maxPct: number;
  ohkoPct: number;
  worstHitsToKo: number;
}

const FIELD_DEFAULT: FieldInput = {
  weather: 'none',
  terrain: 'none',
};

// EVs estándar offensive: 252 ataque + 252 spe + 4 HP
const DEFAULT_ATK_EVS = { hp: 4, atk: 252, def: 0, spa: 252, spd: 0 };
// EVs estándar defensive: 252 HP + 252 def + 4 SpD (físico) o spd (especial)
const DEFAULT_DEF_EVS = { hp: 252, atk: 0, def: 128, spa: 0, spd: 128 };

export function BatchDamageCalc() {
  const [attacker, setAttacker] = useState<PokemonListItem | null>(null);
  const [attackerDetail, setAttackerDetail] = useState<PokemonDetail | null>(null);
  const [moveName, setMoveName] = useState<string>('Earthquake');
  const [threats, setThreats] = useState<MetaThreat[]>([]);
  const [threatDetails, setThreatDetails] = useState<
    Record<number, PokemonDetail>
  >({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nature, setNature] = useState<string>('jolly');
  const [level, setLevel] = useState(50);

  // Carga atacante completo cuando lo selecciona
  useEffect(() => {
    if (!attacker) return;
    getPokemon(String(attacker.id)).then(setAttackerDetail).catch(() => {});
  }, [attacker]);

  // Carga lista de threats de Pikalytics live
  useEffect(() => {
    fetch('/api/meta/threats?format=championspreview')
      .then((r) => r.json())
      .then((data) => {
        const entries = ((data.entries ?? []) as MetaThreat[]).slice(0, 10);
        setThreats(entries);
        // Carga detalles en paralelo
        setLoading(true);
        Promise.all(entries.map((t) => getPokemon(String(t.speciesId))))
          .then((details) => {
            const map: Record<number, PokemonDetail> = {};
            details.forEach((d, i) => {
              map[entries[i].speciesId] = d;
            });
            setThreatDetails(map);
          })
          .finally(() => setLoading(false));
      });
  }, []);

  const move = useMemo(
    () => COMPETITIVE_MOVES.find((m) => m.name === moveName),
    [moveName]
  );

  const results: RowResult[] = useMemo(() => {
    if (!attackerDetail || !move || move.category === 'status') return [];

    const atkInput: BattlerInput = {
      baseStats: {
        hp: attackerDetail.stats.hp,
        atk: attackerDetail.stats.attack,
        def: attackerDetail.stats.defense,
        spa: attackerDetail.stats.specialAttack,
        spd: attackerDetail.stats.specialDefense,
        spe: attackerDetail.stats.speed,
      },
      types: attackerDetail.types,
      level,
      evs: DEFAULT_ATK_EVS,
      nature,
    };

    return threats
      .map((threat) => {
        const defDetail = threatDetails[threat.speciesId];
        if (!defDetail) return null;
        const defInput: BattlerInput = {
          baseStats: {
            hp: defDetail.stats.hp,
            atk: defDetail.stats.attack,
            def: defDetail.stats.defense,
            spa: defDetail.stats.specialAttack,
            spd: defDetail.stats.specialDefense,
            spe: defDetail.stats.speed,
          },
          types: defDetail.types,
          level,
          evs: DEFAULT_DEF_EVS,
          nature: 'careful',
        };
        const result = calculateDamage(atkInput, defInput, move, FIELD_DEFAULT);
        if (!result) return null;
        return {
          threat,
          minPct: result.minPct,
          maxPct: result.maxPct,
          ohkoPct: result.ohkoPct,
          worstHitsToKo: result.worstHitsToKo,
        };
      })
      .filter((x): x is RowResult => x !== null);
  }, [attackerDetail, threats, threatDetails, move, level, nature]);

  // Categorizar moves por physical / special
  const physicalMoves = COMPETITIVE_MOVES.filter((m) => m.category === 'physical');
  const specialMoves = COMPETITIVE_MOVES.filter((m) => m.category === 'special');

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="card-base p-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink-dim block mb-2">Atacante</label>
          {attackerDetail ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="card-base p-3 w-full text-left flex items-center gap-3 hover:bg-white/[0.04]"
            >
              <img
                src={artworkFor(attackerDetail.id)}
                alt={attackerDetail.name}
                className="w-12 h-12 object-contain shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold capitalize text-sm">
                  {attackerDetail.name.replace(/-/g, ' ')}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {attackerDetail.types.map((t) => (
                    <TypeBadge key={t} type={t} size="xs" />
                  ))}
                </div>
              </div>
              <span className="text-xs text-brand-glow shrink-0">Cambiar</span>
            </button>
          ) : (
            <button
              onClick={() => setPickerOpen(true)}
              className="card-base card-hover w-full p-4 border-2 border-dashed border-white/[0.08] hover:border-brand/30 flex items-center justify-center gap-2 text-sm font-bold text-ink-dim hover:text-ink"
            >
              <PlusIcon className="w-4 h-4" />
              Selecciona atacante
            </button>
          )}
        </div>
        <div>
          <label className="text-xs text-ink-dim block mb-2">Movimiento</label>
          <select
            value={moveName}
            onChange={(e) => setMoveName(e.target.value)}
            className="w-full h-11 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
          >
            <optgroup label="Físicos">
              {physicalMoves.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.basePower} BP · {m.type})
                </option>
              ))}
            </optgroup>
            <optgroup label="Especiales">
              {specialMoves.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.basePower} BP · {m.type})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label className="text-xs text-ink-dim block mb-2">Nivel</label>
          <input
            type="number"
            min={1}
            max={100}
            value={level}
            onChange={(e) =>
              setLevel(Math.max(1, Math.min(100, Number(e.target.value))))
            }
            className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm tabular-nums"
          />
        </div>
        <div>
          <label className="text-xs text-ink-dim block mb-2">Naturaleza</label>
          <select
            value={nature}
            onChange={(e) => setNature(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
          >
            <option value="adamant">Adamant (+Atk)</option>
            <option value="jolly">Jolly (+Spe)</option>
            <option value="modest">Modest (+SpA)</option>
            <option value="timid">Timid (+Spe)</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
      </div>

      {!attackerDetail && (
        <div className="card-base p-8 text-center text-sm text-ink-dim">
          Selecciona un atacante para empezar.
        </div>
      )}

      {attackerDetail && loading && (
        <div className="card-base p-8 text-center text-sm text-ink-dim">
          Cargando top 10 del meta…
        </div>
      )}

      {/* Resultados */}
      {attackerDetail && !loading && results.length > 0 && (
        <>
          <div className="card-base p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-ink-faint">
                Atacante con 252 EVs ofensivos + nature
              </span>
              <span className="text-ink-faint">·</span>
              <span className="text-ink-faint">
                Defensores con 252 HP / 128 Def / 128 SpD
              </span>
            </div>
          </div>
          <div className="card-base overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-[10px] uppercase tracking-widest text-ink-faint border-b border-white/[0.06]">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Defensor</th>
                  <th className="text-right p-3">Daño %</th>
                  <th className="text-right p-3">Hits to KO</th>
                  <th className="text-right p-3">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <ResultRow key={r.threat.speciesId} r={r} rank={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-ink-faint">
            Cálculo: fórmula oficial Gen 9. No incluye items (Choice Specs/Band)
            ni habilidades — para esos casos avanzados usa el{' '}
            <Link href="/tools/damage-calc" className="text-brand-glow underline">
              Damage Calc completo
            </Link>
            .
          </p>
        </>
      )}

      <PokemonSelectModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(p) => {
          setAttacker(p);
          setPickerOpen(false);
        }}
        title="Selecciona el atacante"
      />
    </div>
  );
}

function ResultRow({ r, rank }: { r: RowResult; rank: number }) {
  const verdict =
    r.ohkoPct >= 100
      ? { text: 'OHKO', cls: 'text-accent-green', bg: 'bg-accent-green/[0.08]' }
      : r.ohkoPct >= 50
      ? { text: 'OHKO ~50%', cls: 'text-accent-yellow', bg: 'bg-accent-yellow/[0.08]' }
      : r.worstHitsToKo <= 2
      ? { text: '2HKO', cls: 'text-brand-glow', bg: 'bg-brand/[0.05]' }
      : r.worstHitsToKo <= 3
      ? { text: '3HKO', cls: 'text-ink', bg: '' }
      : { text: '4HKO+', cls: 'text-ink-faint', bg: '' };

  return (
    <tr className={`border-b border-white/[0.03] last:border-0 ${verdict.bg}`}>
      <td className="p-3 text-xs text-ink-faint font-mono">#{rank}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <img
            src={artworkFor(r.threat.speciesId)}
            alt={r.threat.name}
            className="w-9 h-9 object-contain shrink-0"
          />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{r.threat.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              {r.threat.types.map((t) => (
                <TypeBadge key={t} type={t} size="xs" />
              ))}
            </div>
          </div>
        </div>
      </td>
      <td className="p-3 text-right font-mono tabular-nums">
        <span className="font-bold">{r.minPct.toFixed(1)}</span>
        <span className="text-ink-faint"> - </span>
        <span className="font-bold">{r.maxPct.toFixed(1)}</span>
        <span className="text-ink-faint">%</span>
      </td>
      <td className="p-3 text-right font-mono tabular-nums text-ink-soft">
        {r.worstHitsToKo}
      </td>
      <td className="p-3 text-right">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${verdict.cls}`}
        >
          {verdict.text}
        </span>
      </td>
    </tr>
  );
}
