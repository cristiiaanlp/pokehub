'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShinyHunt {
  id: string;
  pokemonId: number;
  pokemonName: string;
  methodId: string;
  shinyCharm: boolean;
  encounters: number;
  startedAt: number;
  updatedAt: number;
  foundAt: number | null;
  nickname?: string;
  notes?: string;
}

interface State {
  hunts: ShinyHunt[];
  totalShiniesFound: number;
  createHunt: (input: Omit<ShinyHunt, 'id' | 'encounters' | 'startedAt' | 'updatedAt' | 'foundAt'>) => string;
  increment: (id: string, by?: number) => void;
  decrement: (id: string, by?: number) => void;
  setMethod: (id: string, methodId: string) => void;
  setCharm: (id: string, on: boolean) => void;
  setNotes: (id: string, notes: string) => void;
  markFound: (id: string, nickname?: string) => void;
  deleteHunt: (id: string) => void;
  resetEncounters: (id: string) => void;
}

export const useShinyStore = create<State>()(
  persist(
    (set) => ({
      hunts: [],
      totalShiniesFound: 0,

      createHunt: (input) => {
        const id = `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const now = Date.now();
        set((s) => ({
          hunts: [
            {
              ...input,
              id,
              encounters: 0,
              startedAt: now,
              updatedAt: now,
              foundAt: null,
            },
            ...s.hunts,
          ],
        }));
        return id;
      },

      increment: (id, by = 1) =>
        set((s) => ({
          hunts: s.hunts.map((h) =>
            h.id === id && !h.foundAt
              ? {
                  ...h,
                  encounters: h.encounters + by,
                  updatedAt: Date.now(),
                }
              : h
          ),
        })),

      decrement: (id, by = 1) =>
        set((s) => ({
          hunts: s.hunts.map((h) =>
            h.id === id && !h.foundAt
              ? {
                  ...h,
                  encounters: Math.max(0, h.encounters - by),
                  updatedAt: Date.now(),
                }
              : h
          ),
        })),

      setMethod: (id, methodId) =>
        set((s) => ({
          hunts: s.hunts.map((h) =>
            h.id === id ? { ...h, methodId, updatedAt: Date.now() } : h
          ),
        })),

      setCharm: (id, on) =>
        set((s) => ({
          hunts: s.hunts.map((h) =>
            h.id === id ? { ...h, shinyCharm: on, updatedAt: Date.now() } : h
          ),
        })),

      setNotes: (id, notes) =>
        set((s) => ({
          hunts: s.hunts.map((h) =>
            h.id === id ? { ...h, notes, updatedAt: Date.now() } : h
          ),
        })),

      markFound: (id, nickname) =>
        set((s) => {
          const target = s.hunts.find((h) => h.id === id);
          if (!target || target.foundAt) return s;
          return {
            hunts: s.hunts.map((h) =>
              h.id === id
                ? {
                    ...h,
                    foundAt: Date.now(),
                    nickname: nickname?.trim() || h.nickname,
                  }
                : h
            ),
            totalShiniesFound: s.totalShiniesFound + 1,
          };
        }),

      deleteHunt: (id) =>
        set((s) => ({
          hunts: s.hunts.filter((h) => h.id !== id),
        })),

      resetEncounters: (id) =>
        set((s) => ({
          hunts: s.hunts.map((h) =>
            h.id === id ? { ...h, encounters: 0, updatedAt: Date.now() } : h
          ),
        })),
    }),
    { name: 'pokehub-shiny' }
  )
);
