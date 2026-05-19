'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { artworkFor } from '@/lib/pokeapi';
import { TrophyIcon, CheckIcon, XIcon } from '@/components/ui/Icon';

export interface FeaturableTeam {
  id: string;
  name: string;
  user_id: string;
  members: any[];
  is_featured: boolean;
  featured_at: string | null;
  featured_note: string | null;
  is_public: boolean;
  format: string | null;
  updated_at: string;
}

export function FeaturedAdmin({
  featured: initialFeatured,
  pool: initialPool,
}: {
  featured: FeaturableTeam[];
  pool: FeaturableTeam[];
}) {
  const [featured, setFeatured] = useState(initialFeatured);
  const [pool, setPool] = useState(initialPool);
  const [busy, setBusy] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const featuredIds = useMemo(
    () => new Set(featured.map((t) => t.id)),
    [featured]
  );
  const visiblePool = useMemo(
    () => pool.filter((t) => !featuredIds.has(t.id)),
    [pool, featuredIds]
  );

  const toggle = async (t: FeaturableTeam, makeFeatured: boolean) => {
    setBusy(t.id);
    try {
      const res = await fetch(`/api/admin/teams/${t.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ is_featured: makeFeatured }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Error: ${err.error ?? res.statusText}`);
        return;
      }
      if (makeFeatured) {
        const updated: FeaturableTeam = {
          ...t,
          is_featured: true,
          featured_at: new Date().toISOString(),
        };
        setFeatured((prev) => [updated, ...prev]);
      } else {
        setFeatured((prev) => prev.filter((x) => x.id !== t.id));
      }
    } finally {
      setBusy(null);
    }
  };

  const saveNote = async (id: string, note: string | null) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/teams/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ featured_note: note }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Error: ${err.error ?? res.statusText}`);
        return;
      }
      setFeatured((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, featured_note: note } : x
        )
      );
      setNoteFor(null);
      setNoteDraft('');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured actuales */}
      <section className="space-y-2">
        <h3 className="font-display font-bold text-sm flex items-center gap-2 text-accent-yellow">
          <TrophyIcon className="w-4 h-4" /> Destacados actuales (
          {featured.length})
        </h3>
        {featured.length === 0 ? (
          <div className="card-base p-6 text-center text-sm text-ink-dim">
            Aún no hay teams destacados. Marca alguno desde el pool de abajo.
          </div>
        ) : (
          featured.map((t) => (
            <div
              key={t.id}
              className="card-base p-3 sm:p-4 border-accent-yellow/20 bg-accent-yellow/[0.04]"
            >
              <TeamRow t={t} highlight />
              <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                {noteFor === t.id ? (
                  <>
                    <input
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Nota visible para los visitantes…"
                      className="flex-1 min-w-[200px] h-8 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs"
                    />
                    <button
                      onClick={() =>
                        saveNote(t.id, noteDraft.trim() || null)
                      }
                      disabled={busy === t.id}
                      className="h-8 px-3 rounded-md bg-accent-green/20 text-accent-green text-xs font-bold uppercase tracking-widest hover:bg-accent-green/30 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setNoteFor(null);
                        setNoteDraft('');
                      }}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-white/[0.06] hover:bg-white/[0.12]"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-ink-dim flex-1">
                      <strong className="text-ink">Nota:</strong>{' '}
                      {t.featured_note ?? <em>sin nota</em>}
                    </span>
                    <button
                      onClick={() => {
                        setNoteFor(t.id);
                        setNoteDraft(t.featured_note ?? '');
                      }}
                      className="h-8 px-3 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-xs"
                    >
                      Editar nota
                    </button>
                  </>
                )}
                <button
                  onClick={() => toggle(t, false)}
                  disabled={busy === t.id}
                  className="h-8 px-3 rounded-md bg-accent-red/15 text-accent-red text-xs font-bold uppercase tracking-widest hover:bg-accent-red/25 disabled:opacity-50"
                >
                  Quitar destacado
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Pool candidato */}
      <section className="space-y-2">
        <h3 className="font-display font-bold text-sm">
          Equipos públicos recientes ({visiblePool.length})
        </h3>
        {visiblePool.length === 0 ? (
          <div className="card-base p-6 text-center text-sm text-ink-dim">
            No hay equipos públicos disponibles.
          </div>
        ) : (
          visiblePool.map((t) => (
            <div key={t.id} className="card-base p-3 sm:p-4">
              <TeamRow t={t} />
              <div className="mt-2.5 flex justify-end">
                <button
                  onClick={() => toggle(t, true)}
                  disabled={busy === t.id}
                  className="h-8 px-3 rounded-md bg-accent-yellow/15 text-accent-yellow text-xs font-bold uppercase tracking-widest hover:bg-accent-yellow/25 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <CheckIcon className="w-3 h-3" /> Destacar
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function TeamRow({
  t,
  highlight,
}: {
  t: FeaturableTeam;
  highlight?: boolean;
}) {
  return (
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
          {highlight && (
            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-yellow/15 text-accent-yellow">
              destacado
            </span>
          )}
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
        <div className="text-[11px] text-ink-faint mt-0.5">
          {(t.members ?? []).length} pokémon · user{' '}
          {t.user_id.slice(0, 8)}… ·{' '}
          {new Date(t.updated_at).toLocaleDateString()}
        </div>
      </div>
      <Link
        href={`/teams/${t.id}`}
        target="_blank"
        className="text-xs text-brand-glow hover:text-brand-hover shrink-0"
      >
        Ver ↗
      </Link>
    </div>
  );
}
