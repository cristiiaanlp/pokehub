'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useTeamStore } from '@/stores/teamStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import {
  fetchCloudTeams,
  upsertCloudTeam,
  fetchCloudFavorites,
  addCloudFavorite,
  removeCloudFavorite,
} from '@/lib/sync/cloud';

/**
 * Invisible component mounted under AuthProvider. Reacts to login/logout and:
 *
 *  - On login: fetches cloud state, merges with local (cloud wins on conflicts
 *    by updated_at), pushes back any local-only items so cloud is authoritative.
 *  - While logged in: subscribes to Zustand stores and pushes mutations to cloud
 *    (best-effort fire-and-forget; errors logged to console).
 *  - On logout: stops syncing. Local state is preserved.
 */
export function SyncManager() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const prevUserId = useRef<string | null>(null);

  // Initial merge + per-user subscriptions
  useEffect(() => {
    if (!userId) {
      prevUserId.current = null;
      return;
    }
    // Only run merge once per login session
    if (prevUserId.current === userId) return;
    prevUserId.current = userId;

    let cancelled = false;
    (async () => {
      const [cloudTeams, cloudFavs] = await Promise.all([
        fetchCloudTeams(userId),
        fetchCloudFavorites(userId),
      ]);
      if (cancelled) return;

      const localTeams = useTeamStore.getState().saved;
      const localFavs = useFavoritesStore.getState().ids;

      // ─── Merge teams ────────────────────────────────────────────────
      // Cloud is source of truth. Push any local-only teams up.
      const cloudIds = new Set(cloudTeams.map((t) => t.id));
      const localOnly = localTeams.filter((t) => !cloudIds.has(t.id));
      await Promise.all(localOnly.map((t) => upsertCloudTeam(userId, t)));

      // For ids in both: cloud has freshest (assuming we always upsert with updated_at)
      const mergedTeams = [
        ...cloudTeams,
        ...localOnly.map((t) => t),
      ].sort((a, b) => b.updatedAt - a.updatedAt);

      useTeamStore.getState().setSaved(mergedTeams);

      // ─── Merge favorites ────────────────────────────────────────────
      const cloudSet = new Set(cloudFavs);
      const localOnlyFavs = localFavs.filter((id) => !cloudSet.has(id));
      await Promise.all(
        localOnlyFavs.map((id) => addCloudFavorite(userId, id))
      );
      const mergedFavs = Array.from(new Set([...cloudFavs, ...localFavs]));
      useFavoritesStore.getState().setIds(mergedFavs);

      // Auto-sync de badges al iniciar sesión (idempotente).
      fetch('/api/badges/sync', { method: 'POST' }).catch(() => {});
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Subscribe to favorites changes → mirror to cloud
  useEffect(() => {
    if (!userId) return;
    let prevIds = useFavoritesStore.getState().ids;
    const unsub = useFavoritesStore.subscribe((state) => {
      const next = state.ids;
      const prev = prevIds;
      const added = next.filter((id) => !prev.includes(id));
      const removed = prev.filter((id) => !next.includes(id));
      prevIds = next;
      added.forEach((id) => {
        addCloudFavorite(userId, id).catch(() => {});
      });
      removed.forEach((id) => {
        removeCloudFavorite(userId, id).catch(() => {});
      });
    });
    return unsub;
  }, [userId]);

  // Subscribe to teams.saved changes → mirror to cloud (upsert on diff)
  useEffect(() => {
    if (!userId) return;
    let prevTeams = useTeamStore.getState().saved;
    const unsub = useTeamStore.subscribe((state) => {
      const next = state.saved;
      const prev = prevTeams;

      // Upsert any new or modified team
      for (const team of next) {
        const old = prev.find((p) => p.id === team.id);
        if (!old || old.updatedAt !== team.updatedAt) {
          upsertCloudTeam(userId, team).catch(() => {});
        }
      }

      prevTeams = next;
    });
    return unsub;
  }, [userId]);

  return null;
}
