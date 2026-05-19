'use client';

import { useState } from 'react';
import Link from 'next/link';
import { artworkFor } from '@/lib/pokeapi';
import { TrashIcon, CheckIcon } from '@/components/ui/Icon';

interface ModTeam {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  share_slug: string | null;
  format: string | null;
  members: any[];
  updated_at: string;
}

export function TeamsModerationList({
  initialTeams,
}: {
  initialTeams: ModTeam[];
}) {
  const [teams, setTeams] = useState(initialTeams);
  const [busyId, setBusyId] = useState<string | null>(null);

  const togglePublic = async (id: string, makePublic: boolean) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/teams/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ is_public: makePublic }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Error: ${err.error ?? res.statusText}`);
        return;
      }
      setTeams((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, is_public: makePublic, share_slug: makePublic ? t.share_slug : null }
            : t
        )
      );
    } finally {
      setBusyId(null);
    }
  };

  const del = async (id: string) => {
    if (!confirm('¿Eliminar este equipo permanentemente? Esta acción no se puede deshacer.')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Error: ${err.error ?? res.statusText}`);
        return;
      }
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  if (teams.length === 0) {
    return (
      <div className="card-base p-8 text-center text-ink-dim text-sm">
        No hay equipos guardados todavía.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {teams.map((t) => (
        <div
          key={t.id}
          className={`card-base p-3 sm:p-4 ${
            t.is_public ? 'border-accent-green/20 bg-accent-green/[0.03]' : ''
          }`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex -space-x-3 shrink-0">
              {(t.members ?? []).slice(0, 6).map((m: any) => (
                <img
                  key={m.pokemonId}
                  src={artworkFor(m.pokemonId)}
                  alt={m.name}
                  className="w-9 h-9 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = m.sprite ?? '';
                  }}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-display font-bold truncate">{t.name}</div>
                {t.is_public && (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-green/15 text-accent-green">
                    público
                  </span>
                )}
                {t.format && (
                  <span className="text-[10px] text-ink-faint font-mono">
                    {t.format}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-ink-faint mt-0.5 flex items-center gap-2 flex-wrap">
                <span>user: {t.user_id.slice(0, 8)}…</span>
                <span>·</span>
                <span>{(t.members ?? []).length} pokémon</span>
                <span>·</span>
                <span>{new Date(t.updated_at).toLocaleString()}</span>
                {t.share_slug && (
                  <>
                    <span>·</span>
                    <Link
                      href={`/teams/${t.share_slug}`}
                      target="_blank"
                      className="text-brand-glow hover:text-brand-hover"
                    >
                      ↗ /teams/{t.share_slug}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {t.is_public ? (
                <button
                  onClick={() => togglePublic(t.id, false)}
                  disabled={busyId === t.id}
                  className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-accent-yellow/15 text-accent-yellow text-xs font-bold uppercase tracking-widest hover:bg-accent-yellow/25 disabled:opacity-50"
                >
                  Despublicar
                </button>
              ) : (
                <button
                  onClick={() => togglePublic(t.id, true)}
                  disabled={busyId === t.id}
                  className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-accent-green/15 text-accent-green text-xs font-bold uppercase tracking-widest hover:bg-accent-green/25 disabled:opacity-50"
                >
                  <CheckIcon className="w-3 h-3" />
                  Publicar
                </button>
              )}
              <button
                onClick={() => del(t.id)}
                disabled={busyId === t.id}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-accent-red/15 text-accent-red hover:bg-accent-red/25 disabled:opacity-50"
                aria-label="Eliminar"
                title="Eliminar permanentemente"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
