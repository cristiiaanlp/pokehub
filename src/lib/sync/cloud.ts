'use client';

import { getSupabaseBrowser } from '@/lib/supabase-browser';
import type { SavedTeam } from '@/stores/teamStore';

// ─── TEAMS ────────────────────────────────────────────────────────────────

interface CloudTeamRow {
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

function rowToTeam(row: CloudTeamRow): SavedTeam {
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

export async function fetchCloudTeams(userId: string): Promise<SavedTeam[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];
  const { data, error } = await sb
    .from('teams')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error || !data) {
    console.warn('[cloud-teams] fetch failed', error);
    return [];
  }
  return (data as CloudTeamRow[]).map(rowToTeam);
}

export async function upsertCloudTeam(
  userId: string,
  team: SavedTeam
): Promise<{ shareSlug?: string } | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return null;
  const { data, error } = await sb
    .from('teams')
    .upsert(
      {
        id: team.id,
        user_id: userId,
        name: team.name,
        format: team.format ?? null,
        members: team.members,
        is_public: team.isPublic ?? false,
        share_slug: team.shareSlug ?? null,
        updated_at: new Date(team.updatedAt).toISOString(),
        created_at: new Date(team.createdAt).toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('share_slug')
    .maybeSingle();
  if (error) {
    console.warn('[cloud-teams] upsert failed', error);
    return null;
  }
  return { shareSlug: (data as { share_slug: string | null } | null)?.share_slug ?? undefined };
}

export async function deleteCloudTeam(id: string): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  await sb.from('teams').delete().eq('id', id);
}

export async function makeTeamPublic(
  teamId: string,
  isPublic: boolean
): Promise<{ shareSlug: string | null } | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return null;
  // Generate a slug client-side if going public for the first time
  const slug = isPublic
    ? Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 5)
    : null;
  const { data, error } = await sb
    .from('teams')
    .update({
      is_public: isPublic,
      share_slug: isPublic ? slug : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId)
    .select('share_slug')
    .maybeSingle();
  if (error) {
    console.warn('[cloud-teams] makePublic failed', error);
    return null;
  }
  return { shareSlug: (data as { share_slug: string | null } | null)?.share_slug ?? null };
}

export async function fetchPublicTeamBySlug(
  slug: string
): Promise<SavedTeam | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return null;
  const { data, error } = await sb
    .from('teams')
    .select('*')
    .eq('share_slug', slug)
    .eq('is_public', true)
    .maybeSingle();
  if (error || !data) return null;
  return rowToTeam(data as CloudTeamRow);
}

// ─── FAVORITES ────────────────────────────────────────────────────────────

export async function fetchCloudFavorites(userId: string): Promise<number[]> {
  const sb = getSupabaseBrowser();
  if (!sb) return [];
  const { data, error } = await sb
    .from('favorites')
    .select('pokemon_id')
    .eq('user_id', userId);
  if (error || !data) {
    console.warn('[cloud-favs] fetch failed', error);
    return [];
  }
  return (data as { pokemon_id: number }[]).map((r) => r.pokemon_id);
}

export async function addCloudFavorite(
  userId: string,
  pokemonId: number
): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  await sb.from('favorites').upsert(
    { user_id: userId, pokemon_id: pokemonId },
    { onConflict: 'user_id,pokemon_id' }
  );
}

export async function removeCloudFavorite(
  userId: string,
  pokemonId: number
): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  await sb
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('pokemon_id', pokemonId);
}
