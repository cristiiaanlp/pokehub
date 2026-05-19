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
  ClockIcon,
  BoltIcon,
  ShieldIcon,
} from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

interface Stats {
  totalUsers: number | null;
  totalTeams: number | null;
  publicTeams: number | null;
  featuredTeams: number | null;
  totalFavorites: number | null;
  activeAnnouncements: number | null;
  recentTeams: Array<{
    id: string;
    name: string;
    user_id: string;
    is_public: boolean;
    is_featured?: boolean | null;
    updated_at: string;
  }>;
  recentAudit: Array<{
    id: string;
    admin_email: string;
    action: string;
    created_at: string;
  }>;
  signupsByDay: Array<{ day: string; count: number }>;
  teamsByDay: Array<{ day: string; count: number }>;
}

async function fetchStats(): Promise<Stats> {
  const empty: Stats = {
    totalUsers: null,
    totalTeams: null,
    publicTeams: null,
    featuredTeams: null,
    totalFavorites: null,
    activeAnnouncements: null,
    recentTeams: [],
    recentAudit: [],
    signupsByDay: [],
    teamsByDay: [],
  };

  const admin = getSupabaseAdmin();
  if (!admin) return empty;

  const [
    usersRes,
    teamsTotal,
    teamsPublic,
    teamsFeatured,
    favs,
    annActive,
    recentTeamsRes,
    auditRes,
    recentTeamsForChart,
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('teams').select('*', { count: 'exact', head: true }),
    admin.from('teams').select('*', { count: 'exact', head: true }).eq('is_public', true),
    admin.from('teams').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    admin.from('favorites').select('*', { count: 'exact', head: true }),
    admin
      .from('site_announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    admin
      .from('teams')
      .select('id, name, user_id, is_public, is_featured, updated_at')
      .order('updated_at', { ascending: false })
      .limit(8),
    admin
      .from('admin_audit_log')
      .select('id, admin_email, action, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    admin
      .from('teams')
      .select('created_at')
      .gte(
        'created_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
  ]);

  const userData = usersRes.data as
    | { users: any[]; total?: number }
    | null
    | undefined;
  const allUsers = userData?.users ?? [];
  const totalUsers =
    typeof userData?.total === 'number' ? userData.total : allUsers.length;

  // 30-day signup timeline
  const signupsBuckets = bucketByDay(
    allUsers
      .map((u) => u.created_at as string | undefined)
      .filter((d): d is string => Boolean(d))
  );
  const teamsBuckets = bucketByDay(
    ((recentTeamsForChart.data ?? []) as { created_at: string }[]).map(
      (r) => r.created_at
    )
  );

  return {
    totalUsers,
    totalTeams: teamsTotal.count ?? null,
    publicTeams: teamsPublic.count ?? null,
    featuredTeams: teamsFeatured.count ?? null,
    totalFavorites: favs.count ?? null,
    activeAnnouncements: annActive.count ?? null,
    recentTeams: (recentTeamsRes.data ?? []) as Stats['recentTeams'],
    recentAudit: (auditRes.data ?? []) as Stats['recentAudit'],
    signupsByDay: signupsBuckets,
    teamsByDay: teamsBuckets,
  };
}

function bucketByDay(timestamps: string[]): Array<{ day: string; count: number }> {
  const days: Record<string, number> = {};
  const now = new Date();
  // Inicializa 30 días a cero para que la gráfica no tenga huecos.
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days[d.toISOString().slice(0, 10)] = 0;
  }
  for (const ts of timestamps) {
    const key = ts.slice(0, 10);
    if (key in days) days[key] += 1;
  }
  return Object.entries(days).map(([day, count]) => ({ day, count }));
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
      label: 'Usuarios',
      value: stats.totalUsers !== null ? stats.totalUsers.toLocaleString() : '—',
      Icon: UsersIcon,
      tone: 'text-brand-glow',
    },
    {
      label: 'Equipos',
      value: stats.totalTeams !== null ? stats.totalTeams.toLocaleString() : '—',
      Icon: GridIcon,
      tone: 'text-accent-green',
    },
    {
      label: 'Públicos',
      value: stats.publicTeams !== null ? stats.publicTeams.toLocaleString() : '—',
      Icon: SparklesIcon,
      tone: 'text-accent-green',
    },
    {
      label: 'Destacados',
      value: stats.featuredTeams !== null ? stats.featuredTeams.toLocaleString() : '—',
      Icon: TrophyIcon,
      tone: 'text-accent-yellow',
    },
    {
      label: 'Favoritos',
      value: stats.totalFavorites !== null ? stats.totalFavorites.toLocaleString() : '—',
      Icon: HeartIcon,
      tone: 'text-accent-red',
    },
    {
      label: 'Anuncios activos',
      value:
        stats.activeAnnouncements !== null
          ? stats.activeAnnouncements.toLocaleString()
          : '—',
      Icon: BoltIcon,
      tone: 'text-purple-300',
    },
  ];

  const maxSignup = Math.max(1, ...stats.signupsByDay.map((d) => d.count));
  const maxTeams = Math.max(1, ...stats.teamsByDay.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="card-base p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
                {k.label}
              </div>
              <k.Icon className={`w-4 h-4 ${k.tone}`} />
            </div>
            <div className={`font-display text-2xl font-bold mt-1 tabular-nums ${k.tone}`}>
              {k.value}
            </div>
          </div>
        ))}
      </section>

      {/* Timelines */}
      <section className="grid lg:grid-cols-2 gap-3">
        <BarChart
          title="Signups (30 días)"
          color="bg-brand-glow"
          data={stats.signupsByDay}
          max={maxSignup}
        />
        <BarChart
          title="Equipos creados (30 días)"
          color="bg-accent-green"
          data={stats.teamsByDay}
          max={maxTeams}
        />
      </section>

      {/* Quick links */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickLink
          href="/admin/users"
          Icon={UsersIcon}
          color="brand"
          title="Usuarios"
          desc="Lista, búsqueda, baja"
        />
        <QuickLink
          href="/admin/teams"
          Icon={GridIcon}
          color="green"
          title="Moderar teams"
          desc="Despublicar / eliminar"
        />
        <QuickLink
          href="/admin/announcements"
          Icon={SparklesIcon}
          color="yellow"
          title="Anuncios"
          desc="Banner site-wide"
        />
        <QuickLink
          href="/admin/cache"
          Icon={ShieldIcon}
          color="purple"
          title="Caché"
          desc="Revalidate manual"
        />
      </section>

      {/* Recent activity + audit */}
      <section className="grid lg:grid-cols-2 gap-3">
        <div className="card-base p-5">
          <h2 className="font-display text-base font-bold flex items-center gap-2 mb-3">
            <GridIcon className="w-4 h-4 text-brand-glow" />
            Últimos equipos
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
                  className="flex items-center gap-2 p-2 rounded-xl glass text-sm"
                >
                  <div className="font-semibold truncate flex-1 min-w-0">
                    {t.name}
                  </div>
                  {t.is_featured && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-yellow/15 text-accent-yellow">
                      destacado
                    </span>
                  )}
                  {t.is_public && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-green/15 text-accent-green">
                      público
                    </span>
                  )}
                  <span className="text-xs text-ink-faint shrink-0">
                    {new Date(t.updated_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-base p-5">
          <h2 className="font-display text-base font-bold flex items-center gap-2 mb-3">
            <ClockIcon className="w-4 h-4 text-accent-yellow" />
            Actividad admin reciente
          </h2>
          {stats.recentAudit.length === 0 ? (
            <div className="text-sm text-ink-dim text-center py-4">
              Sin eventos.
              <div className="text-xs mt-1">
                <Link href="/admin/audit" className="text-brand-glow">
                  Ver audit log →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                {stats.recentAudit.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 p-2 rounded-xl glass text-xs"
                  >
                    <code className="font-mono font-bold text-accent-yellow">
                      {r.action}
                    </code>
                    <span className="truncate flex-1 min-w-0 text-ink-dim">
                      {r.admin_email}
                    </span>
                    <span className="text-ink-faint shrink-0">
                      {new Date(r.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-right">
                <Link href="/admin/audit" className="text-brand-glow hover:text-brand-hover">
                  Ver todo el audit log →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="text-xs text-ink-faint">
        Las queries usan <code>service_role</code> y bypassean RLS. Solo el
        panel /admin las ejecuta (gate por email en el layout).
      </div>
    </div>
  );
}

function QuickLink({
  href,
  Icon,
  color,
  title,
  desc,
}: {
  href: string;
  Icon: any;
  color: 'brand' | 'green' | 'yellow' | 'purple';
  title: string;
  desc: string;
}) {
  const tone =
    color === 'brand'
      ? 'bg-brand/15 text-brand-glow'
      : color === 'green'
      ? 'bg-accent-green/15 text-accent-green'
      : color === 'yellow'
      ? 'bg-accent-yellow/15 text-accent-yellow'
      : 'bg-purple-500/15 text-purple-300';
  return (
    <Link
      href={href}
      className="card-base card-hover p-4 flex items-center gap-3 group"
    >
      <div className={`w-10 h-10 rounded-xl ${tone} inline-flex items-center justify-center`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-sm">{title}</div>
        <div className="text-[10px] text-ink-dim">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}

function BarChart({
  title,
  color,
  data,
  max,
}: {
  title: string;
  color: string;
  data: Array<{ day: string; count: number }>;
  max: number;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-sm">{title}</h3>
        <span className="text-xs text-ink-faint tabular-nums">
          total: <strong className="text-ink">{total}</strong>
        </span>
      </div>
      <div className="flex items-end gap-0.5 h-24">
        {data.map((d) => {
          const h = Math.max(2, Math.round((d.count / max) * 100));
          return (
            <div
              key={d.day}
              className="flex-1 group relative"
              title={`${d.day}: ${d.count}`}
            >
              <div
                className={`${color} rounded-t-sm transition-all`}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-ink-faint font-mono">
        <span>{data[0]?.day.slice(5)}</span>
        <span>{data[data.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}
