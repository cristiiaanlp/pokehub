'use client';

import { useEffect, useState } from 'react';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { artworkFor, getPokemon } from '@/lib/pokeapi';
import { TYPE_CHART } from '@/lib/type-effectiveness';
import { TypeBadge } from '@/components/ui/TypeBadge';
import {
  PlusIcon,
  ShieldIcon,
  SwordIcon,
  TrendingUpIcon,
} from '@/components/ui/Icon';
import type { PokemonDetail, PokemonType, PokemonListItem } from '@/types/pokemon';

interface MetaThreatLite {
  speciesId: number;
  name: string;
  types: PokemonType[];
  usagePct: number;
}

interface Matchup {
  threat: MetaThreatLite;
  /** Mejor x mult tuyo→ellos */
  outgoing: number;
  /** Peor x mult ellos→tuyo (cualquiera de sus STABs) */
  incoming: number;
  verdict: 'win' | 'lose' | 'mixed' | 'neutral';
}

function multiplier(atk: PokemonType, def: PokemonType[]): number {
  let m = 1;
  for (const d of def) {
    const x = TYPE_CHART[atk][d];
    if (x !== undefined) m *= x;
  }
  return m;
}

function calcMatchups(mine: PokemonDetail, threats: MetaThreatLite[]): Matchup[] {
  return threats.map((t) => {
    let outgoing = 0;
    for (const myType of mine.types) {
      const m = multiplier(myType, t.types);
      if (m > outgoing) outgoing = m;
    }
    let incoming = 0;
    for (const theirType of t.types) {
      const m = multiplier(theirType, mine.types);
      if (m > incoming) incoming = m;
    }
    let verdict: Matchup['verdict'] = 'neutral';
    if (outgoing >= 2 && incoming < 2) verdict = 'win';
    else if (incoming >= 2 && outgoing < 2) verdict = 'lose';
    else if (outgoing >= 2 && incoming >= 2) verdict = 'mixed';
    return { threat: t, outgoing, incoming, verdict };
  });
}

export function FavoriteVsMeta() {
  const favIds = useFavoritesStore((s) => s.ids);
  const [selectedId, setSelectedId] = useState<number | null>(favIds[0] ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [threats, setThreats] = useState<MetaThreatLite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar meta threats al montar (Champions format por defecto)
    fetch('/api/meta/threats?format=championspreview')
      .then((r) => r.json())
      .then((data) => {
        setThreats((data.entries ?? []).slice(0, 10));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setPokemon(null);
      return;
    }
    setLoading(true);
    getPokemon(String(selectedId))
      .then((p) => setPokemon(p))
      .catch(() => setPokemon(null))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const matchups = pokemon ? calcMatchups(pokemon, threats) : [];
  const wins = matchups.filter((m) => m.verdict === 'win').length;
  const losses = matchups.filter((m) => m.verdict === 'lose').length;

  return (
    <div className="space-y-5">
      {/* Selector */}
      <div className="card-base p-4">
        <h2 className="text-xs font-bold text-ink-dim mb-3 uppercase tracking-widest">
          Tu Pokémon
        </h2>
        {pokemon && !loading ? (
          <div className="flex items-center gap-4">
            <img
              src={artworkFor(pokemon.id)}
              alt={pokemon.name}
              className="w-24 h-24 object-contain shrink-0"
            />
            <div className="flex-1">
              <div className="font-display text-2xl font-bold capitalize">
                {pokemon.name.replace(/-/g, ' ')}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                {pokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </div>
            </div>
            <button
              onClick={() => setPickerOpen(true)}
              className="h-9 px-3 rounded-md glass hover:bg-white/[0.08] text-xs"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPickerOpen(true)}
            className="card-base card-hover w-full p-4 border-2 border-dashed border-white/[0.08] hover:border-brand/30 flex items-center justify-center gap-2 text-sm font-bold text-ink-dim hover:text-ink"
          >
            <PlusIcon className="w-4 h-4" />
            {favIds.length > 0
              ? `Elige uno de tus ${favIds.length} favoritos`
              : 'Selecciona un Pokémon'}
          </button>
        )}
      </div>

      {/* Resumen */}
      {pokemon && matchups.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <StatBox
            label="Ganas a"
            value={wins}
            tone="text-accent-green"
            Icon={SwordIcon}
          />
          <StatBox
            label="Pierdes contra"
            value={losses}
            tone="text-accent-red"
            Icon={ShieldIcon}
          />
          <StatBox
            label="vs top meta"
            value={matchups.length}
            tone="text-ink"
            Icon={TrendingUpIcon}
          />
        </div>
      )}

      {/* Matchups */}
      {pokemon && matchups.length > 0 && (
        <div className="space-y-2">
          {matchups.map((m, i) => (
            <MatchupRow key={m.threat.speciesId} m={m} rank={i + 1} />
          ))}
        </div>
      )}

      <PokemonSelectModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(p: PokemonListItem) => {
          setSelectedId(p.id);
          setPickerOpen(false);
        }}
        title="Selecciona tu Pokémon"
      />
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  tone: string;
  Icon: any;
}) {
  return (
    <div className="card-base p-3 text-center">
      <Icon className={`w-4 h-4 mx-auto ${tone}`} />
      <div className={`font-display text-2xl font-bold mt-1 tabular-nums ${tone}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-ink-faint mt-0.5">
        {label}
      </div>
    </div>
  );
}

function MatchupRow({ m, rank }: { m: Matchup; rank: number }) {
  const tone = {
    win: 'border-accent-green/30 bg-accent-green/[0.04]',
    lose: 'border-accent-red/30 bg-accent-red/[0.04]',
    mixed: 'border-accent-yellow/30 bg-accent-yellow/[0.04]',
    neutral: 'border-white/[0.06]',
  }[m.verdict];
  const verdictLabel = {
    win: { text: 'GANAS', cls: 'text-accent-green' },
    lose: { text: 'PIERDES', cls: 'text-accent-red' },
    mixed: { text: 'CHOQUE', cls: 'text-accent-yellow' },
    neutral: { text: 'NEUTRAL', cls: 'text-ink-faint' },
  }[m.verdict];

  return (
    <div className={`card-base p-3 sm:p-4 border ${tone}`}>
      <div className="flex items-center gap-3">
        <div className="text-xs font-mono text-ink-faint w-6 shrink-0">
          #{rank}
        </div>
        <img
          src={artworkFor(m.threat.speciesId)}
          alt={m.threat.name}
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold truncate">{m.threat.name}</div>
          <div className="flex items-center gap-1 mt-0.5">
            {m.threat.types.map((t) => (
              <TypeBadge key={t} type={t} size="xs" />
            ))}
            <span className="text-[10px] text-ink-faint font-mono ml-1">
              {m.threat.usagePct.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-[10px] font-bold uppercase tracking-widest ${verdictLabel.cls}`}>
            {verdictLabel.text}
          </div>
          <div className="text-xs font-mono text-ink-dim mt-0.5">
            <span className="text-accent-green">{m.outgoing}×</span>
            <span className="text-ink-faint"> vs </span>
            <span className="text-accent-red">{m.incoming}×</span>
          </div>
        </div>
      </div>
    </div>
  );
}
