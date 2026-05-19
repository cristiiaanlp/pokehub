import {
  getSupabaseAdmin,
  isAdminClientConfigured,
} from '@/lib/supabase-admin';
import { AuditTable, type AuditRow } from '@/components/admin/AuditTable';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  if (!isAdminClientConfigured()) {
    return (
      <div className="card-base p-6 text-sm">
        ⚠️ Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> en el entorno.
      </div>
    );
  }
  const admin = getSupabaseAdmin()!;
  const { data, error } = await admin
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="card-base p-6 text-sm text-accent-red">
        Error: {error.message}
        <span className="block mt-2 text-xs text-ink-faint">
          ¿Has ejecutado la migración{' '}
          <code>003_admin_extras.sql</code> en Supabase?
        </span>
      </div>
    );
  }

  const rows = (data ?? []) as AuditRow[];

  return (
    <div className="space-y-4">
      <div className="card-base p-4">
        <h2 className="font-display text-lg font-bold">
          Audit log ({rows.length} eventos recientes)
        </h2>
        <p className="text-xs text-ink-dim mt-0.5">
          Toda acción privilegiada queda registrada con email del admin, tipo de
          acción, recurso afectado y contexto. Las entradas se conservan
          indefinidamente.
        </p>
      </div>
      <AuditTable rows={rows} />
    </div>
  );
}
