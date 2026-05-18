'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  SaveIcon,
  TrashIcon,
  CheckIcon,
} from '@/components/ui/Icon';
import { useTeamStore } from '@/stores/teamStore';
import { artworkFor } from '@/lib/pokeapi';
import { useAuth } from '@/components/auth/AuthProvider';
import { makeTeamPublic } from '@/lib/sync/cloud';

export function SavedTeams() {
  const saved = useTeamStore((s) => s.saved);
  const current = useTeamStore((s) => s.current);
  const saveTeam = useTeamStore((s) => s.saveTeam);
  const loadTeam = useTeamStore((s) => s.loadTeam);
  const deleteTeam = useTeamStore((s) => s.deleteTeam);
  const patchSaved = useTeamStore((s) => s.patchSaved);
  const clearTeam = useTeamStore((s) => s.clearTeam);
  const { user, isConfigured } = useAuth();
  const [name, setName] = useState('');
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filled = current.filter(Boolean).length;

  const handleShare = async (id: string) => {
    if (!user) return;
    const team = saved.find((t) => t.id === id);
    if (!team) return;

    setSharingId(id);
    try {
      let slug = team.shareSlug;
      if (!slug || !team.isPublic) {
        const res = await makeTeamPublic(id, true);
        slug = res?.shareSlug ?? undefined;
        if (slug) patchSaved(id, { isPublic: true, shareSlug: slug });
      }
      if (slug) {
        const url = `${window.location.origin}/teams/${slug}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div className="card-base p-5 space-y-4">
      <h3 className="font-display text-base font-bold flex items-center gap-2">
        <SaveIcon className="w-4 h-4 text-brand-glow" />
        Mis equipos guardados
        {user && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-accent-green">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            Sincronizado
          </span>
        )}
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
        <Button
          variant="ghost"
          size="md"
          onClick={clearTeam}
          disabled={filled === 0}
        >
          <TrashIcon className="w-4 h-4" />
          Limpiar
        </Button>
      </div>
      {saved.length === 0 ? (
        <div className="text-sm text-ink-dim text-center py-4 border border-dashed border-white/[0.06] rounded-xl">
          Aún no has guardado equipos.{' '}
          {user
            ? 'Cuando guardes uno se sincroniza en la nube automáticamente.'
            : isConfigured
            ? 'Inicia sesión para sincronizar en la nube entre dispositivos.'
            : 'Los equipos viven en tu navegador.'}
        </div>
      ) : (
        <div className="space-y-2">
          {saved.map((t) => {
            const isShared = t.isPublic && t.shareSlug;
            return (
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
                  <div className="font-semibold truncate flex items-center gap-2">
                    {t.name}
                    {isShared && (
                      <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-accent-green/15 text-accent-green">
                        público
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-faint">
                    {t.members.length} Pokémon ·{' '}
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                {user && (
                  <button
                    onClick={() => handleShare(t.id)}
                    disabled={sharingId === t.id}
                    title={isShared ? 'Copiar enlace' : 'Hacer público y copiar enlace'}
                    className="text-xs font-semibold text-brand-glow hover:text-brand-hover px-2 py-1 rounded-md disabled:opacity-50"
                  >
                    {copiedId === t.id ? (
                      <span className="inline-flex items-center gap-1 text-accent-green">
                        <CheckIcon className="w-3 h-3" /> Copiado
                      </span>
                    ) : sharingId === t.id ? (
                      'Compartiendo…'
                    ) : (
                      '🔗 Compartir'
                    )}
                  </button>
                )}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
