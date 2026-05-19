'use client';

import { useState } from 'react';
import { CheckIcon, ArrowRight } from '@/components/ui/Icon';

const PATHS: { path: string; label: string; description: string }[] = [
  {
    path: '/meta',
    label: 'Meta Hub (Smogon stats)',
    description: 'Top usage SV OU / VGC / Doubles. Smogon publica una vez al mes.',
  },
  {
    path: '/meta/champions',
    label: 'Pokémon Champions',
    description: 'Pikalytics scrape — top usage, partners, equipos del ladder.',
  },
  {
    path: '/community/teams',
    label: 'Comunidad · equipos públicos',
    description: 'Para que aparezcan equipos recién publicados antes del refresh natural.',
  },
  {
    path: '/typemaster/meta-daily',
    label: 'Meta Daily Quiz',
    description: 'Refresca las preguntas que usan datos vivos.',
  },
  {
    path: '/',
    label: 'Landing (home)',
    description: 'Para que aparezca cambios en el daily Pokémon o el banner.',
  },
  {
    path: '/pokedex',
    label: 'Pokédex (grid)',
    description: 'Raro que cambie pero por si acaso.',
  },
];

export function CachePanel() {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const revalidate = async (path: string) => {
    setBusy(path);
    setErrors((prev) => ({ ...prev, [path]: '' }));
    try {
      const res = await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors((prev) => ({ ...prev, [path]: data.error ?? res.statusText }));
        return;
      }
      setDone((prev) => ({ ...prev, [path]: data.revalidatedAt ?? new Date().toISOString() }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-2">
      {PATHS.map((p) => {
        const isBusy = busy === p.path;
        const doneAt = done[p.path];
        const err = errors[p.path];
        return (
          <div
            key={p.path}
            className="card-base p-4 flex items-center gap-3 flex-wrap"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.05] text-ink">
                  {p.path}
                </code>
                <span className="font-semibold text-sm">{p.label}</span>
              </div>
              <div className="text-xs text-ink-dim mt-1">{p.description}</div>
              {doneAt && (
                <div className="text-[10px] text-accent-green mt-1 inline-flex items-center gap-1">
                  <CheckIcon className="w-3 h-3" />
                  Revalidado {new Date(doneAt).toLocaleTimeString()}
                </div>
              )}
              {err && (
                <div className="text-[10px] text-accent-red mt-1">Error: {err}</div>
              )}
            </div>
            <button
              onClick={() => revalidate(p.path)}
              disabled={isBusy}
              className="h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Refrescando…
                </>
              ) : (
                <>
                  Forzar refresh
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
