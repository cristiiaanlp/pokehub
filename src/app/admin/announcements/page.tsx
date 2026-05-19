import {
  getSupabaseAdmin,
  isAdminClientConfigured,
} from '@/lib/supabase-admin';
import {
  AnnouncementsAdmin,
  type Announcement,
} from '@/components/admin/AnnouncementsAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  if (!isAdminClientConfigured()) {
    return (
      <div className="card-base p-6 text-sm">
        ⚠️ Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> en el entorno.
      </div>
    );
  }
  const admin = getSupabaseAdmin()!;
  const { data, error } = await admin
    .from('site_announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="card-base p-6 text-sm text-accent-red">
        Error: {error.message}{' '}
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
        <h2 className="font-display text-lg font-bold">
          Anuncios globales ({data?.length ?? 0})
        </h2>
        <p className="text-xs text-ink-dim mt-0.5">
          Los anuncios <strong className="text-ink">activos</strong> y dentro de
          su ventana de fechas aparecen como banner en todas las páginas.
        </p>
      </div>
      <AnnouncementsAdmin initial={(data ?? []) as Announcement[]} />
    </div>
  );
}
