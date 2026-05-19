'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, XIcon, BoltIcon } from '@/components/ui/Icon';

interface Probe {
  name: string;
  url: string;
  ok: boolean;
  status: number | null;
  ms: number;
  note?: string;
}

interface DbStat {
  table: string;
  count: number | null;
}

interface EnvFlag {
  name: string;
  set: boolean;
}

export function SystemHealth({
  probes,
  dbStats,
  supaErr,
  envFlags,
}: {
  probes: Probe[];
  dbStats: DbStat[];
  supaErr: string | null;
  envFlags: EnvFlag[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [now] = useState(() => new Date());

  return (
    <div className="space-y-5">
      <div className="card-base p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Estado del sistema</h2>
          <p className="text-xs text-ink-dim mt-0.5">
            Snapshot del {now.toLocaleString()}. Pings a APIs externas y
            estadísticas de la BD.
          </p>
        </div>
        <button
          onClick={() => startTransition(() => router.refresh())}
          disabled={pending}
          className="h-9 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50"
        >
          {pending ? 'Refrescando…' : 'Re-probar'}
        </button>
      </div>

      <section>
        <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
          <BoltIcon className="w-4 h-4 text-accent-yellow" /> Pings a APIs externas
        </h3>
        <div className="space-y-2">
          {probes.map((p) => (
            <div
              key={p.name}
              className={`card-base p-3 flex items-center gap-3 flex-wrap ${
                p.ok ? '' : 'border-accent-red/30 bg-accent-red/[0.04]'
              }`}
            >
              <span
                className={`w-6 h-6 inline-flex items-center justify-center rounded-full ${
                  p.ok
                    ? 'bg-accent-green/15 text-accent-green'
                    : 'bg-accent-red/15 text-accent-red'
                }`}
              >
                {p.ok ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <XIcon className="w-4 h-4" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-[10px] font-mono text-ink-faint truncate">
                  {p.url}
                </div>
                {p.note && (
                  <div className="text-[10px] text-accent-red mt-0.5">
                    {p.note}
                  </div>
                )}
              </div>
              <div className="text-xs text-ink-dim font-mono shrink-0">
                {p.status !== null ? `HTTP ${p.status}` : 'sin respuesta'} ·{' '}
                {p.ms}ms
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display font-bold text-sm mb-2">
          Estadísticas BD (Supabase)
        </h3>
        {supaErr && (
          <div className="card-base p-3 text-xs text-accent-red mb-2">
            {supaErr}
          </div>
        )}
        {dbStats.length === 0 ? (
          <div className="card-base p-4 text-xs text-ink-dim">
            Service role no configurada — no se pueden leer counts.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {dbStats.map((s) => (
              <div key={s.table} className="card-base p-3 text-center">
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-mono">
                  {s.table}
                </div>
                <div className="font-display text-2xl font-bold tabular-nums mt-1">
                  {s.count !== null ? s.count.toLocaleString() : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-display font-bold text-sm mb-2">
          Variables de entorno
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {envFlags.map((f) => (
            <div
              key={f.name}
              className="card-base p-2.5 flex items-center justify-between"
            >
              <code className="text-[11px] font-mono">{f.name}</code>
              {f.set ? (
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-green/15 text-accent-green">
                  set
                </span>
              ) : (
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-red/15 text-accent-red">
                  missing
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-ink-faint mt-2">
          Solo se chequea presencia (no el contenido). Para cambiarlas, edita en
          Vercel → Settings → Environment Variables y redeploy.
        </p>
      </section>
    </div>
  );
}
