// Activity events — server-only. Se ejecuta vía service_role para insert.
// Los users leen via REST (RLS lo permite); writes solo desde nuestros endpoints.

import { getSupabaseAdmin } from './supabase-admin';

export type ActivityKind =
  | 'team_published'      // hizo público un team
  | 'team_featured'       // un admin destacó su team
  | 'badge_earned'        // ganó un badge
  | 'first_team'          // creó su primer team
  | 'profile_created';    // se completó el onboarding

export interface ActivityPayload {
  // team_published / team_featured
  teamId?: string;
  teamName?: string;
  // badge_earned
  badgeId?: string;
  // contextual
  [k: string]: unknown;
}

export async function logActivity(
  userId: string,
  kind: ActivityKind,
  payload: ActivityPayload = {}
): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  try {
    await admin.from('activity_events').insert({
      user_id: userId,
      kind,
      payload,
    });
  } catch (err) {
    // Activity logging nunca debe romper el flow principal
    console.warn('[activity] failed to log', kind, err);
  }
}
