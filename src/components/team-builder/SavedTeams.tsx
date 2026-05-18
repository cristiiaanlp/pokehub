'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SaveIcon, TrashIcon, ChevronRight } from '@/components/ui/Icon';
import { useTeamStore } from '@/stores/teamStore';
import { artworkFor } from '@/lib/pokeapi';
import { formatPokemonName } from '@/lib/utils';

export function SavedTeams() {
  const saved = useTeamStore((s) => s.saved);
  const current = useTeamStore((s) => s.current);
  const saveTeam = useTeamStore((s) => s.saveTeam);
  const loadTeam = useTeamStore((s) => s.loadTeam);
  const deleteTeam = useTeamStore((s) => s.deleteTeam);
  const clearTeam = useTeamStore((s) => s.clearTeam);
  const [name, setName] = useState('');

  const filled = current.filter(Boolean).length;

  return (
    <div className="card-base p-5 space-y-4">
      <h3 className="font-display text-base font-bold flex items-center gap-2">
        <SaveIcon className="w-4 h-4 text-brand-glow" />
        Mis equipos guardados
      </h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del equipo..."
          className="flex-1"
        />
        <Button
          variant="primary"
          size="md"
          disabled={!name.trim() || filled === 0}
          onClick={() => {
            saveTeam(name.trim());
            setName('');
          }}
        >
          <SaveIcon className="w-4 h-4" />
          Guardar
        </Button>
        <Button variant="ghost" size="md" onClick={clearTeam} disabled={filled === 0}>
          <TrashIcon className="w-4 h-4" />
          Limpiar
        </Button>
      </div>
      {saved.length === 0 ? (
        <div className="text-sm text-ink-dim text-center py-4 border border-dashed border-white/[0.06] rounded-xl">
          Aún no has guardado equipos. Los equipos quedan en tu navegador (cloud
          save vendrá con Supabase).
        </div>
      ) : (
        <div className="space-y-2">
          {saved.map((t) => (
            <div
              key={t.id}
              className="group flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex -space-x-3">
                {t.members.slice(0, 6).map((m) => (
                  <img
                    key={m.pokemonId}
                    src={artworkFor(m.pokemonId)}
                    alt={m.name}
                    className="w-9 h-9 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = m.sprite;
                    }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{t.name}</div>
                <div className="text-xs text-ink-faint">
                  {t.members.length} Pokémon ·{' '}
                  {new Date(t.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => loadTeam(t.id)}
                className="text-xs font-semibold text-brand-glow hover:text-brand-hover px-2 py-1 rounded-md"
              >
                Cargar
              </button>
              <button
                onClick={() => deleteTeam(t.id)}
                className="opacity-0 group-hover:opacity-100 text-accent-red hover:bg-accent-red/15 rounded-md p-1.5 transition-opacity"
                aria-label="Eliminar"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
