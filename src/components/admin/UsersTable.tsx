'use client';

import { useMemo, useState } from 'react';
import { TrashIcon, SearchIcon, CheckIcon, SaveIcon } from '@/components/ui/Icon';
import { toCsv, downloadCsv } from '@/lib/csv';

export interface AdminUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  teams_count: number;
  favorites_count: number;
  confirmed: boolean;
}

export function UsersTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        (u.email ?? '').toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term)
    );
  }, [users, q]);

  const del = async (u: AdminUser) => {
    const label = u.email ?? u.id;
    if (
      !confirm(
        `¿Eliminar al usuario ${label} y todos sus equipos (${u.teams_count}) + favoritos (${u.favorites_count})?\n\nEsta acción NO se puede deshacer.`
      )
    )
      return;
    setBusyId(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Error: ${err.error ?? res.statusText}`);
        return;
      }
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="card-base p-3 flex items-center gap-2">
        <SearchIcon className="w-4 h-4 text-ink-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por email o user id…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="text-xs text-ink-faint hover:text-ink"
          >
            limpiar
          </button>
        )}
        <button
          onClick={() => exportUsersCsv(filtered)}
          disabled={filtered.length === 0}
          className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-accent-green/15 text-accent-green text-xs font-bold uppercase tracking-widest hover:bg-accent-green/25 disabled:opacity-50"
          title={`Exportar ${filtered.length} usuarios a CSV`}
        >
          <SaveIcon className="w-3.5 h-3.5" />
          CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card-base p-8 text-center text-ink-dim text-sm">
          {users.length === 0
            ? 'No hay usuarios registrados.'
            : 'Ningún usuario coincide con la búsqueda.'}
        </div>
      ) : (
        <div className="card-base overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-[10px] uppercase tracking-widest text-ink-faint border-b border-white/[0.06]">
              <tr>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2 hidden md:table-cell">Creado</th>
                <th className="text-left px-3 py-2 hidden md:table-cell">
                  Último login
                </th>
                <th className="text-right px-3 py-2">Equipos</th>
                <th className="text-right px-3 py-2">Favs</th>
                <th className="text-right px-3 py-2"> </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs">
                        {u.email ?? '—'}
                      </span>
                      {u.confirmed && (
                        <span className="inline-flex items-center text-[9px] text-accent-green">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-ink-faint font-mono mt-0.5">
                      {u.id}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell text-xs text-ink-dim">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell text-xs text-ink-dim">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {u.teams_count}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {u.favorites_count}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => del(u)}
                      disabled={busyId === u.id}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-accent-red/10 text-accent-red hover:bg-accent-red/25 disabled:opacity-50"
                      aria-label="Eliminar usuario"
                      title="Eliminar usuario y datos asociados"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function exportUsersCsv(users: AdminUser[]) {
  const csv = toCsv(users, [
    { header: 'user_id', get: (u) => u.id },
    { header: 'email', get: (u) => u.email },
    { header: 'confirmed', get: (u) => u.confirmed },
    { header: 'created_at', get: (u) => u.created_at },
    { header: 'last_sign_in_at', get: (u) => u.last_sign_in_at },
    { header: 'teams_count', get: (u) => u.teams_count },
    { header: 'favorites_count', get: (u) => u.favorites_count },
  ]);
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`pokehub-users-${date}.csv`, csv);
}
