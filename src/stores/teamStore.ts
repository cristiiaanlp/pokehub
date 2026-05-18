'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamMember } from '@/types/pokemon';

export interface SavedTeam {
  id: string;
  name: string;
  members: TeamMember[];
  format?: string;
  createdAt: number;
  updatedAt: number;
  // Cloud sync extras (filled when user is authenticated)
  isPublic?: boolean;
  shareSlug?: string;
}

interface TeamState {
  current: (TeamMember | null)[]; // exactly 6 slots
  saved: SavedTeam[];
  setSlot: (index: number, member: TeamMember | null) => void;
  updateSlot: (index: number, patch: Partial<TeamMember>) => void;
  clearTeam: () => void;
  saveTeam: (name: string) => SavedTeam;
  loadTeam: (id: string) => void;
  deleteTeam: (id: string) => void;
  /** Replace the saved list wholesale (used by SyncManager). */
  setSaved: (teams: SavedTeam[]) => void;
  /** Update a single saved team's fields (used after cloud upsert returns slug). */
  patchSaved: (id: string, patch: Partial<SavedTeam>) => void;
}

const emptyTeam = (): (TeamMember | null)[] => [null, null, null, null, null, null];

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      current: emptyTeam(),
      saved: [],
      setSlot: (index, member) =>
        set((s) => {
          const copy = [...s.current];
          copy[index] = member;
          return { current: copy };
        }),
      updateSlot: (index, patch) =>
        set((s) => {
          const copy = [...s.current];
          const existing = copy[index];
          if (!existing) return s;
          copy[index] = { ...existing, ...patch };
          return { current: copy };
        }),
      clearTeam: () => set({ current: emptyTeam() }),
      saveTeam: (name) => {
        const current = get().current.filter(Boolean) as TeamMember[];
        const now = Date.now();
        const team: SavedTeam = {
          id: `t_${now}_${Math.random().toString(36).slice(2, 7)}`,
          name,
          members: current,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ saved: [team, ...s.saved] }));
        return team;
      },
      loadTeam: (id) => {
        const t = get().saved.find((x) => x.id === id);
        if (!t) return;
        const slots = emptyTeam();
        t.members.slice(0, 6).forEach((m, i) => (slots[i] = m));
        set({ current: slots });
      },
      deleteTeam: (id) =>
        set((s) => ({ saved: s.saved.filter((t) => t.id !== id) })),
      setSaved: (teams) => set({ saved: teams }),
      patchSaved: (id, patch) =>
        set((s) => ({
          saved: s.saved.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
    }),
    { name: 'pokehub-teams' }
  )
);
