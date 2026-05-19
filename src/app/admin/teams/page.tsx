import {
  getSupabaseAdmin,
  isAdminClientConfigured,
} from '@/lib/supabase-admin';
import { TeamsModerationList } from '@/components/admin/TeamsModerationList';

export const dynamic = 'force-dynamic';

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

export default async function AdminTeamsPage() {
  if (!isAdminClientConfigured()) {
    return (
      <div className="card-base p-6 text-sm">
        ⚠️ Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> en el entorno.
      </div>
    );
  }
  const admin = getSupabaseAdmin();
  const { data, error } = await admin!
    .from('teams')
    .select('id, name, user_id, is_public, share_slug, format, members, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="card-base p-6 text-sm text-accent-red">
        Error: {error.message}
      </div>
    );
  }

  const teams = (data ?? []) as ModTeam[];
  const publicCount = teams.filter((t) => t.is_public).length;

  return (
    <div className="space-y-5">
      <div className="card-base p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">
            Moderar teams ({teams.length} cargados · {publicCount} públicos)
          </h2>
          <p className="text-xs text-ink-dim mt-0.5">
            Acciones: <strong className="text-ink">Despublicar</strong> oculta el
            equipo de /community/teams pero el dueño lo conserva.{' '}
            <strong className="text-ink">Eliminar</strong> lo borra para siempre.
          </p>
        </div>
      </div>

      <TeamsModerationList initialTeams={teams} />
    </div>
  );
}
