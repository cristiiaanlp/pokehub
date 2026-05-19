'use client';

import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { SavedTeam } from '@/stores/teamStore';

interface PublicTeamRow {
  id: string;
  user_id: string;
  name: string;
  format: string | null;
  members: SavedTeam['members'];
  is_public: boolean;
  share_slug: string | null;
  created_at: string;
  updated_at: string;
}

function rowToTeam(row: PublicTeamRow): SavedTeam {
  return {
    id: row.id,
    name: row.name,
    members: row.members,
    format: row.format ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    isPublic: row.is_public,
    shareSlug: row.share_slug ?? undefined,
  };
}

export interface PublicTeamsQuery {
  limit?: number;
  offset?: number;
  format?: string | null;
  sort?: 'recent' | 'oldest';
}

export async function fetchPublicTeams(
  q: PublicTeamsQuery = {}
): Promise<SavedTeam[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];
  let query = sb.from('teams').select('*').eq('is_public', true);
  if (q.format) query = query.eq('format', q.format);
  query = query.order('updated_at', { ascending: q.sort === 'oldest' });
  query = query.range(q.offset ?? 0, (q.offset ?? 0) + (q.limit ?? 30) - 1);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as PublicTeamRow[]).map(rowToTeam);
}

export async function fetchPublicTeamsCount(format?: string | null): Promise<number> {
  const sb = getSupabaseBrowser();
  if (!sb) return 0;
  let query = sb.from('teams').select('*', { count: 'exact', head: true }).eq('is_public', true);
  if (format) query = query.eq('format', format);
  const { count } = await query;
  return count ?? 0;
}
