import {
  getSupabaseAdmin,
  isAdminClientConfigured,
} from '@/lib/supabase-admin';
import { SystemHealth } from '@/components/admin/SystemHealth';

export const dynamic = 'force-dynamic';

interface Probe {
  name: string;
  url: string;
  ok: boolean;
  status: number | null;
  ms: number;
  note?: string;
}

async function probe(name: string, url: string, init?: RequestInit): Promise<Probe> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...init,
      // Algunos endpoints tardan — pero no bloqueamos la página > 8s.
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    return {
      name,
      url,
      ok: res.ok,
      status: res.status,
      ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      url,
      ok: false,
      status: null,
      ms: Date.now() - start,
      note: err instanceof Error ? err.message : 'unknown',
    };
  }
}

export default async function AdminSystemPage() {
  const probes = await Promise.all([
    probe('PokéAPI', 'https://pokeapi.co/api/v2/pokemon/1'),
    probe('Pikalytics', 'https://www.pikalytics.com/'),
    probe('Smogon stats', 'https://www.smogon.com/stats/'),
    probe(
      'Anthropic API',
      'https://api.anthropic.com/v1/models',
      process.env.ANTHROPIC_API_KEY
        ? {
            headers: {
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
            },
          }
        : undefined
    ),
  ]);

  // Supabase tables stats
  let dbStats: { table: string; count: number | null }[] = [];
  let supaErr: string | null = null;
  if (isAdminClientConfigured()) {
    const admin = getSupabaseAdmin()!;
    try {
      const [teams, favs, audit, ann] = await Promise.all([
        admin.from('teams').select('*', { count: 'exact', head: true }),
        admin.from('favorites').select('*', { count: 'exact', head: true }),
        admin.from('admin_audit_log').select('*', { count: 'exact', head: true }),
        admin.from('site_announcements').select('*', { count: 'exact', head: true }),
      ]);
      dbStats = [
        { table: 'teams', count: teams.count ?? null },
        { table: 'favorites', count: favs.count ?? null },
        { table: 'admin_audit_log', count: audit.count ?? null },
        { table: 'site_announcements', count: ann.count ?? null },
      ];
    } catch (e) {
      supaErr = e instanceof Error ? e.message : 'unknown';
    }
  }

  const envFlags = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', set: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', set: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', set: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { name: 'NEXT_PUBLIC_ADMIN_EMAILS', set: Boolean(process.env.NEXT_PUBLIC_ADMIN_EMAILS) },
    { name: 'ANTHROPIC_API_KEY', set: Boolean(process.env.ANTHROPIC_API_KEY) },
    { name: 'NEXT_PUBLIC_SITE_URL', set: Boolean(process.env.NEXT_PUBLIC_SITE_URL) },
  ];

  return (
    <SystemHealth
      probes={probes}
      dbStats={dbStats}
      supaErr={supaErr}
      envFlags={envFlags}
    />
  );
}
