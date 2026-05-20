'use client';

import { useState } from 'react';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { artworkFor, getPokemon } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { ROLES, type RoleKey } from '@/lib/moveset-wizard';
import { PlusIcon, SparklesIcon, ArrowRight } from '@/components/ui/Icon';
import type { PokemonListItem, PokemonType } from '@/types/pokemon';

interface Suggestion {
  pokemonId: number;
  pokemonName: string;
  role: { id: RoleKey; label: string; emoji: string; description: string };
  moves: Array<{
    name: string;
    displayName: string;
    type: PokemonType;
    reason: string;
    score: number;
  }>;
  note?: string;
}

export function MovesetWizard() {
  const [selected, setSelected] = useState<PokemonListItem | null>(null);
  const [role, setRole] = useState<RoleKey>('physical-sweeper');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    if (!selected) return;
    setLoading(true);
    setErr(null);
    setSuggestion(null);
    try {
      // Pedimos al backend para que cachee el resultado entre peticiones
      const res = await fetch(
        `/api/moveset-wizard?id=${selected.id}&role=${role}`
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? 'Error');
        return;
      }
      setSuggestion(data.suggestion);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Selección de Pokémon + rol */}
      <div className="card-base p-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink-dim block mb-2">Pokémon</label>
          {selected ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="card-base p-3 w-full text-left flex items-center gap-3 hover:bg-white/[0.04]"
            >
              <img
                src={artworkFor(selected.id)}
                alt={selected.name}
                className="w-12 h-12 object-contain shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold capitalize">
                  {selected.name.replace(/-/g, ' ')}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {selected.types.map((t) => (
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
              Seleccionar Pokémon
            </button>
          )}
        </div>
        <div>
          <label className="text-xs text-ink-dim block mb-2">Rol</label>
          <div className="grid grid-cols-2 gap-1.5">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`text-left p-2.5 rounded-lg text-xs ${
                  role === r.id
                    ? 'bg-brand/15 border border-brand/30 text-ink'
                    : 'glass border border-transparent hover:bg-white/[0.06] text-ink-soft'
                }`}
              >
                <div className="font-display font-bold flex items-center gap-1">
                  <span>{r.emoji}</span>
                  {r.label}
                </div>
                <div className="text-[10px] text-ink-dim mt-0.5">
                  {r.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={run}
          disabled={!selected || loading}
          className="h-11 px-6 rounded-lg bg-brand text-white text-sm font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50 inline-flex items-center gap-2"
        >
          <SparklesIcon className="w-4 h-4" />
          {loading ? 'Generando…' : 'Generar moveset'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>

      {err && (
        <div className="card-base p-4 text-sm text-accent-red border-accent-red/30">
          ⚠ {err}
        </div>
      )}

      {suggestion && (
        <div className="card-base p-5 space-y-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-accent-yellow" />
            Set sugerido como {suggestion.role.emoji} {suggestion.role.label}
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {suggestion.moves.map((m, i) => (
              <div
                key={m.name}
                className="card-base p-3 flex items-start gap-3 bg-white/[0.02]"
              >
                <div className="w-7 h-7 rounded-full bg-brand/15 text-brand-glow flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold">
                      {m.displayName}
                    </span>
                    <TypeBadge type={m.type} size="xs" />
                  </div>
                  <div className="text-[11px] text-ink-dim mt-1">{m.reason}</div>
                </div>
              </div>
            ))}
          </div>
          {suggestion.note && (
            <div className="text-xs text-accent-yellow bg-accent-yellow/[0.05] p-3 rounded-lg">
              ⚠ {suggestion.note}
            </div>
          )}
          <p className="text-[10px] text-ink-faint">
            Set generado por reglas deterministas sobre el learnset del
            Pokémon. NO es competitivo "óptimo" — es un punto de partida.
            Ajusta items y EVs en el Team Builder.
          </p>
        </div>
      )}

      <PokemonSelectModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(p) => {
          setSelected(p);
          setPickerOpen(false);
          setSuggestion(null);
        }}
        title="Selecciona el Pokémon"
      />
    </div>
  );
}
