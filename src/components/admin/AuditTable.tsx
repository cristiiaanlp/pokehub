'use client';

import { useMemo, useState } from 'react';
import { FilterIcon, SaveIcon } from '@/components/ui/Icon';
import { toCsv, downloadCsv } from '@/lib/csv';

export interface AuditRow {
  id: string;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  delete: 'text-accent-red',
  unpublish: 'text-accent-yellow',
  publish: 'text-accent-green',
  feature: 'text-accent-yellow',
  unfeature: 'text-ink-faint',
  create: 'text-accent-green',
  update: 'text-brand-glow',
};

function colorFor(action: string): string {
  const suffix = action.split('.').pop() ?? '';
  for (const k of Object.keys(ACTION_COLORS)) {
    if (suffix === k) return ACTION_COLORS[k];
  }
  return 'text-ink';
}

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  const [actionFilter, setActionFilter] = useState<string>('');
  const [adminFilter, setAdminFilter] = useState<string>('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const actions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.action))).sort(),
    [rows]
  );
  const admins = useMemo(
    () => Array.from(new Set(rows.map((r) => r.admin_email))).sort(),
    [rows]
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!actionFilter || r.action === actionFilter) &&
          (!adminFilter || r.admin_email === adminFilter)
      ),
    [rows, actionFilter, adminFilter]
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="card-base p-3 flex items-center gap-3 flex-wrap text-xs">
        <FilterIcon className="w-4 h-4 text-ink-faint" />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-8 px-2 rounded-md bg-white/[0.04] border border-white/[0.06]"
        >
          <option value="">Todas las acciones</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={adminFilter}
          onChange={(e) => setAdminFilter(e.target.value)}
          className="h-8 px-2 rounded-md bg-white/[0.04] border border-white/[0.06]"
        >
          <option value="">Todos los admins</option>
          {admins.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {(actionFilter || adminFilter) && (
          <button
            onClick={() => {
              setActionFilter('');
              setAdminFilter('');
            }}
            className="text-ink-faint hover:text-ink"
          >
            limpiar filtros
          </button>
        )}
        <span className="ml-auto text-ink-faint">
          {filtered.length} / {rows.length}
        </span>
        <button
          onClick={() => exportAuditCsv(filtered)}
          disabled={filtered.length === 0}
          className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-accent-green/15 text-accent-green text-xs font-bold uppercase tracking-widest hover:bg-accent-green/25 disabled:opacity-50"
          title={`Exportar ${filtered.length} eventos a CSV`}
        >
          <SaveIcon className="w-3.5 h-3.5" />
          CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card-base p-8 text-center text-ink-dim text-sm">
          Sin eventos.
        </div>
      ) : (
        <div className="card-base divide-y divide-white/[0.04]">
          {filtered.map((r) => {
            const isOpen = expanded.has(r.id);
            return (
              <div key={r.id} className="px-3 py-2.5">
                <button
                  onClick={() => toggle(r.id)}
                  className="w-full text-left flex items-center gap-3 flex-wrap text-xs"
                >
                  <span className="text-ink-faint shrink-0">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                  <span className={`font-mono font-bold ${colorFor(r.action)}`}>
                    {r.action}
                  </span>
                  <span className="text-ink-dim truncate flex-1 min-w-0">
                    {r.admin_email}
                  </span>
                  {r.target_id && (
                    <span className="text-[10px] font-mono text-ink-faint shrink-0">
                      {r.target_type}/{r.target_id.slice(0, 8)}…
                    </span>
                  )}
                  <span className="text-[10px] text-ink-faint">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <pre className="mt-2 text-[10px] font-mono bg-black/30 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                    {JSON.stringify(r.details, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function exportAuditCsv(rows: AuditRow[]) {
  const csv = toCsv(rows, [
    { header: 'event_id', get: (r) => r.id },
    { header: 'created_at', get: (r) => r.created_at },
    { header: 'admin_email', get: (r) => r.admin_email },
    { header: 'action', get: (r) => r.action },
    { header: 'target_type', get: (r) => r.target_type },
    { header: 'target_id', get: (r) => r.target_id },
    {
      header: 'details_json',
      get: (r) => (r.details ? JSON.stringify(r.details) : ''),
    },
  ]);
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`pokehub-audit-${date}.csv`, csv);
}
