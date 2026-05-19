// Server-side audit logger. Records every privileged action with the
// admin's email, action type, target id, and arbitrary JSON details.
// Failures are silently swallowed — we never block the actual operation
// because of a logging issue, but we do log to console for debugging.

import { getSupabaseAdmin } from './supabase-admin';

export interface AuditEntry {
  admin_email: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
}

export async function logAdminAction(entry: AuditEntry): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  try {
    await sb.from('admin_audit_log').insert({
      admin_email: entry.admin_email,
      action: entry.action,
      target_type: entry.target_type ?? null,
      target_id: entry.target_id ?? null,
      details: entry.details ?? null,
    });
  } catch (err) {
    console.warn('[audit] failed to log', err);
  }
}
