import Link from 'next/link';
import {
  getSupabaseAdmin,
  isAdminClientConfigured,
} from '@/lib/supabase-admin';
import {
  GridIcon,
  HeartIcon,
  UsersIcon,
  TrophyIcon,
  ArrowRight,
  SparklesIcon,
} from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

interface Stats {
  totalUsers: number | null;
  totalTeams: number | null;
  publicTeams: number | null;
  totalFavorites: number | null;
  recentTeams: Array<{
    id: string;
    name: string;
    user_id: string;
    is_public: boolean;
    updated_at: string;
  }>;
}

async function fetchStats(): Promise<Stats> {
  const empty: Stats = {
    totalUsers: null,
    totalTeams: null,
    publicTeams: null,
    totalFavorites: null,
    recentTeams: [],
  };

  const admin = getSupabaseAdmin();
  if (!admin) return empty;

  const [usersRes, teamsTotal, teamsPublic, favs, recentRes] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('teams').select('*', { count: 'exact', head: true }),
    admin.from('teams').select('*', { count: 'exact', head: true }).eq('is_public', true),
    admin.from('favorites').select('*', { count: 'exact', head: true }),
    admin
      .from('teams')
      .select('id, name, user_id, is_public, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  // Different versions of @supabase/supabase-js expose user count differently.
  // Fall back to the returned users[] length when no explicit total is present.
  const userData = usersRes.data as
    | { users: unknown[]; total?: number }
    | null
    | undefined;
  const totalUsers =
    typeof userData?.total === 'number'
      ? userData.total
      : userData?.users?.length ?? null;

  return {
    totalUsers,
    totalTeams: teamsTotal.count ?? null,
    publicTeams: teamsPublic.count ?? null,
    totalFavorites: favs.count ?? null,
    recentTeams: (recentRes.data ?? []) as Stats['recentTeams'],
  };
}

export default async function AdminDashboardPage() {
  if (!isAdminClientConfigured()) {
    return (
      <div className="card-base p-6 text-sm">
        ⚠️ Falta <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">
          SUPABASE_SERVICE_ROLE_KEY
        </code>{' '}
        en el entorno. Sin ella el panel no puede leer estadísticas. Añádela en
        Vercel → Settings → Environment Variables (SOLO en Production, NO con
        prefijo <code>NEXT_PUBLIC_</code>).
      </div>
    );
  }

  const stats = await fetchStats();

  const kpis: { label: string; value: string; Icon: any; tone: string }[] = [
    {
      label: 'Usuarios registrados',
      value: stats.totalUsers !== null ? stats.totalUsers.toLocaleString() : '—',
      Icon: UsersIcon,
      tone: 'text-brand-glow',
    },
    {
      label: 'Equipos guardados',
      value: stats.totalTeams !== null ? stats.totalTeams.toLocaleString() : '—',
      Icon: GridIcon,
      tone: 'text-accent-green',
    },
    {
      label: 'Equipos públicos',
      value: stats.publicTeams !== null ? stats.publicTeams.toLocaleString() : '—',
      Icon: TrophyIcon,
      tone: 'text-accent-yellow',
    },
    {
      label: 'Favoritos totales',
      value: stats.totalFavorites !== null ? stats.totalFavorites.toLocaleString() : '—',
      Icon: HeartIcon,
      tone: 'text-accent-red',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="card-base p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
                {k.label}
              </div>
              <k.Icon className={`w-4 h-4 ${k.tone}`} />
            </div>
            <div className={`font-display text-3xl font-bold mt-1 tabular-nums ${k.tone}`}>
              {k.value}
            </div>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/admin/teams"
          className="card-base card-hover p-5 flex items-center gap-3 group"
        >
          <div className="w-11 h-11 rounded-xl bg-brand/15 text-brand-glow inline-flex items-center justify-center">
            <GridIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold">Moderar teams públicos</div>
            <div className="text-xs text-ink-dim">
              Despublicar o eliminar equipos compartidos
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/admin/cache"
          className="card-base card-hover p-5 flex items-center gap-3 group"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-yellow/15 text-accent-yellow inline-flex items-center justify-center">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold">Forzar refresh de caché</div>
            <div className="text-xs text-ink-dim">
              Re-fetch de Pikalytics / Smogon en vivo
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Recent activity */}
      <section className="card-base p-5">
        <h2 className="font-display text-base font-bold flex items-center gap-2 mb-3">
          <GridIcon className="w-4 h-4 text-brand-glow" />
          Últimos equipos creados / modificados
        </h2>
        {stats.recentTeams.length === 0 ? (
          <div className="text-sm text-ink-dim text-center py-4">
            Sin equipos todavía.
          </div>
        ) : (
          <div className="space-y-1.5">
            {stats.recentTeams.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-2.5 rounded-xl glass text-sm"
              >
                <div className="font-semibold truncate flex-1 min-w-0">
                  {t.name}
                </div>
                {t.is_public && (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-green/15 text-accent-green">
                    público
                  </span>
                )}
                <span className="text-xs text-ink-faint shrink-0">
                  {new Date(t.updated_at).toLocaleDateString()}
                </span>
                <span className="text-[10px] font-mono text-ink-faint shrink-0">
                  {t.user_id.slice(0, 8)}…
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="text-xs text-ink-faint">
        Las queries usan <code>service_role</code> de Supabase y bypassean RLS.
        Solo el panel /admin puede ejecutarlas (gate por email en el layout).
      </div>
    </div>
  );
}
