'use client';

import { useState } from 'react';
import { TrashIcon, PlusIcon, CheckIcon } from '@/components/ui/Icon';

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  severity: 'info' | 'warning' | 'error' | 'maintenance';
  link_url: string | null;
  link_label: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  created_by: string | null;
}

type Draft = Omit<Announcement, 'id' | 'created_at' | 'created_by'>;

const EMPTY: Draft = {
  title: '',
  body: '',
  severity: 'info',
  link_url: '',
  link_label: '',
  is_active: true,
  starts_at: null,
  ends_at: null,
};

const SEVERITY_COLORS: Record<Announcement['severity'], string> = {
  info: 'bg-brand/15 text-brand-glow border-brand/30',
  warning: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  error: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  maintenance: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

export function AnnouncementsAdmin({ initial }: { initial: Announcement[] }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const create = async () => {
    if (!draft.title.trim()) {
      alert('El título es obligatorio.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      setItems((prev) => [data.announcement as Announcement, ...prev]);
      setDraft(EMPTY);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (a: Announcement) => {
    setBusyId(a.id);
    try {
      const res = await fetch(`/api/admin/announcements/${a.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ is_active: !a.is_active }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Error: ${err.error ?? res.statusText}`);
        return;
      }
      setItems((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, is_active: !a.is_active } : x))
      );
    } finally {
      setBusyId(null);
    }
  };

  const del = async (a: Announcement) => {
    if (!confirm(`¿Eliminar el anuncio "${a.title}"?`)) return;
    setBusyId(a.id);
    try {
      const res = await fetch(`/api/admin/announcements/${a.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Error: ${err.error ?? res.statusText}`);
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== a.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Crear */}
      <div className="card-base p-4 space-y-3">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <PlusIcon className="w-4 h-4 text-accent-green" /> Nuevo anuncio
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-xs">
            <span className="text-ink-dim">Título *</span>
            <input
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              className="mt-1 w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
              placeholder="Mantenimiento programado…"
            />
          </label>
          <label className="block text-xs">
            <span className="text-ink-dim">Severidad</span>
            <select
              value={draft.severity}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  severity: e.target.value as Draft['severity'],
                }))
              }
              className="mt-1 w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </label>
          <label className="block text-xs sm:col-span-2">
            <span className="text-ink-dim">Cuerpo (opcional)</span>
            <textarea
              value={draft.body ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm resize-y"
              placeholder="El sitio estará en mantenimiento de 02:00 a 03:00…"
            />
          </label>
          <label className="block text-xs">
            <span className="text-ink-dim">URL link (opcional)</span>
            <input
              value={draft.link_url ?? ''}
              onChange={(e) =>
                setDraft((d) => ({ ...d, link_url: e.target.value }))
              }
              className="mt-1 w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
              placeholder="/changelog"
            />
          </label>
          <label className="block text-xs">
            <span className="text-ink-dim">Texto link (opcional)</span>
            <input
              value={draft.link_label ?? ''}
              onChange={(e) =>
                setDraft((d) => ({ ...d, link_label: e.target.value }))
              }
              className="mt-1 w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
              placeholder="Ver detalles"
            />
          </label>
          <label className="block text-xs">
            <span className="text-ink-dim">Empieza (opcional)</span>
            <input
              type="datetime-local"
              value={draft.starts_at ?? ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  starts_at: e.target.value || null,
                }))
              }
              className="mt-1 w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="text-ink-dim">Acaba (opcional)</span>
            <input
              type="datetime-local"
              value={draft.ends_at ?? ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  ends_at: e.target.value || null,
                }))
              }
              className="mt-1 w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
            />
          </label>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) =>
                setDraft((d) => ({ ...d, is_active: e.target.checked }))
              }
            />
            <span>Activo desde ya</span>
          </label>
          <button
            onClick={create}
            disabled={creating || !draft.title.trim()}
            className="h-9 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50"
          >
            {creating ? 'Publicando…' : 'Publicar anuncio'}
          </button>
        </div>
      </div>

      {/* Lista */}
      {items.length === 0 ? (
        <div className="card-base p-8 text-center text-ink-dim text-sm">
          No hay anuncios todavía.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <div
              key={a.id}
              className={`card-base p-4 border ${SEVERITY_COLORS[a.severity]} ${
                a.is_active ? '' : 'opacity-50'
              }`}
            >
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold">{a.title}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      {a.severity}
                    </span>
                    {a.is_active ? (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-accent-green inline-flex items-center gap-0.5">
                        <CheckIcon className="w-3 h-3" /> activo
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint">
                        inactivo
                      </span>
                    )}
                  </div>
                  {a.body && (
                    <div className="text-xs text-ink-dim mt-1">{a.body}</div>
                  )}
                  <div className="text-[10px] text-ink-faint mt-1 flex items-center gap-2 flex-wrap">
                    {a.starts_at && (
                      <span>
                        desde {new Date(a.starts_at).toLocaleString()}
                      </span>
                    )}
                    {a.ends_at && (
                      <span>
                        hasta {new Date(a.ends_at).toLocaleString()}
                      </span>
                    )}
                    {a.link_url && (
                      <span>
                        → <code>{a.link_url}</code>{' '}
                        {a.link_label && `(${a.link_label})`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive(a)}
                    disabled={busyId === a.id}
                    className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-white/[0.06] text-xs font-bold uppercase tracking-widest hover:bg-white/[0.12] disabled:opacity-50"
                  >
                    {a.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => del(a)}
                    disabled={busyId === a.id}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-accent-red/15 text-accent-red hover:bg-accent-red/25 disabled:opacity-50"
                    aria-label="Eliminar"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
