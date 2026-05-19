import {
  getSupabaseAdmin,
  isAdminClientConfigured,
} from '@/lib/supabase-admin';
import {
  FeaturedAdmin,
  type FeaturableTeam,
} from '@/components/admin/FeaturedAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminFeaturedPage() {
  if (!isAdminClientConfigured()) {
    return (
      <div className="card-base p-6 text-sm">
        ⚠️ Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> en el entorno.
      </div>
    );
  }
  const admin = getSupabaseAdmin()!;
  // Featured + recent public teams (so el admin pueda elegir cuáles destacar).
  const [{ data: featured, error: errF }, { data: pool, error: errP }] =
    await Promise.all([
      admin
        .from('teams')
        .select(
          'id, name, user_id, members, is_featured, featured_at, featured_note, is_public, format, updated_at'
        )
        .eq('is_featured', true)
        .order('featured_at', { ascending: false }),
      admin
        .from('teams')
        .select(
          'id, name, user_id, members, is_featured, featured_at, featured_note, is_public, format, updated_at'
        )
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(40),
    ]);

  const err = errF ?? errP;
  if (err) {
    return (
      <div className="card-base p-6 text-sm text-accent-red">
        Error: {err.message}
        <span className="block mt-2 text-xs text-ink-faint">
          ¿Has ejecutado la migración{' '}
          <code>003_admin_extras.sql</code> en Supabase?
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-base p-4">
        <h2 className="font-display text-lg font-bold">Teams destacados</h2>
        <p className="text-xs text-ink-dim mt-0.5">
          Los teams destacados aparecen en la landing y en una sección{' '}
          <em>Destacados por el equipo</em> de /community. Pueden ser públicos o
          privados (al marcarlos como destacados se vuelven legibles para todos
          a través de la política RLS).
        </p>
      </div>
      <FeaturedAdmin
        featured={(featured ?? []) as FeaturableTeam[]}
        pool={(pool ?? []) as FeaturableTeam[]}
      />
    </div>
  );
}
