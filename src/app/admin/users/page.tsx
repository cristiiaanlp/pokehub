import {
  getSupabaseAdmin,
  isAdminClientConfigured,
} from '@/lib/supabase-admin';
import { UsersTable, type AdminUser } from '@/components/admin/UsersTable';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  if (!isAdminClientConfigured()) {
    return (
      <div className="card-base p-6 text-sm">
        ⚠️ Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> en el entorno.
      </div>
    );
  }
  const admin = getSupabaseAdmin()!;
  const { data: usersData, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) {
    return (
      <div className="card-base p-6 text-sm text-accent-red">
        Error listando usuarios: {error.message}
      </div>
    );
  }
  const supaUsers = usersData?.users ?? [];

  // Conteo de equipos por usuario (en una sola query)
  const userIds = supaUsers.map((u) => u.id);
  let teamsByUser: Record<string, number> = {};
  let favsByUser: Record<string, number> = {};
  if (userIds.length > 0) {
    const [{ data: teamsRows }, { data: favsRows }] = await Promise.all([
      admin.from('teams').select('user_id').in('user_id', userIds),
      admin.from('favorites').select('user_id').in('user_id', userIds),
    ]);
    for (const r of (teamsRows ?? []) as { user_id: string }[]) {
      teamsByUser[r.user_id] = (teamsByUser[r.user_id] ?? 0) + 1;
    }
    for (const r of (favsRows ?? []) as { user_id: string }[]) {
      favsByUser[r.user_id] = (favsByUser[r.user_id] ?? 0) + 1;
    }
  }

  const users: AdminUser[] = supaUsers.map((u) => ({
    id: u.id,
    email: u.email ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    teams_count: teamsByUser[u.id] ?? 0,
    favorites_count: favsByUser[u.id] ?? 0,
    confirmed: Boolean(u.email_confirmed_at || (u as any).confirmed_at),
  }));

  return (
    <div className="space-y-4">
      <div className="card-base p-4">
        <h2 className="font-display text-lg font-bold">
          Usuarios registrados ({users.length})
        </h2>
        <p className="text-xs text-ink-dim mt-0.5">
          Eliminar un usuario hace <strong className="text-ink">cascade</strong>{' '}
          de sus equipos y favoritos. La acción queda registrada en el audit log.
        </p>
      </div>
      <UsersTable initialUsers={users} />
    </div>
  );
}
