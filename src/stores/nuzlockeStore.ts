'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EncounterStatus = 'team' | 'box' | 'dead' | 'released' | 'fled' | 'failed' | 'pending';

export interface NuzlockeEncounter {
  id: string;
  route: string;
  pokemonId: number | null; // null when not yet captured
  pokemonName: string | null;
  nickname?: string;
  status: EncounterStatus;
  level?: number;
  notes?: string;
  createdAt: number;
}

export interface NuzlockeRules {
  dupesClause: boolean;
  speciesClause: boolean;
  nicknameRequired: boolean;
  shinyClause: boolean;
  setMode: boolean;
  noItemsInBattle: boolean;
  levelCap: boolean;
}

export interface NuzlockeRun {
  id: string;
  name: string;
  game: string;
  rules: NuzlockeRules;
  encounters: NuzlockeEncounter[];
  startedAt: number;
  endedAt: number | null;
  endedReason?: 'completed' | 'wiped' | 'abandoned';
  badges: number;
}

interface State {
  runs: NuzlockeRun[];
  activeRunId: string | null;
  createRun: (input: { name: string; game: string; rules: NuzlockeRules }) => string;
  setActive: (id: string | null) => void;
  addEncounter: (
    runId: string,
    input: Omit<NuzlockeEncounter, 'id' | 'createdAt'>
  ) => void;
  updateEncounter: (
    runId: string,
    encounterId: string,
    patch: Partial<NuzlockeEncounter>
  ) => void;
  removeEncounter: (runId: string, encounterId: string) => void;
  setBadges: (runId: string, badges: number) => void;
  endRun: (runId: string, reason: 'completed' | 'wiped' | 'abandoned') => void;
  reviveRun: (runId: string) => void;
  deleteRun: (runId: string) => void;
}

export const DEFAULT_RULES: NuzlockeRules = {
  dupesClause: true,
  speciesClause: true,
  nicknameRequired: true,
  shinyClause: true,
  setMode: false,
  noItemsInBattle: false,
  levelCap: false,
};

export const NUZLOCKE_GAMES = [
  'Pokémon Red / Blue / Yellow',
  'Pokémon Gold / Silver / Crystal',
  'Pokémon Ruby / Sapphire / Emerald',
  'Pokémon FireRed / LeafGreen',
  'Pokémon Diamond / Pearl / Platinum',
  'Pokémon HeartGold / SoulSilver',
  'Pokémon Black / White (2)',
  'Pokémon X / Y',
  'Pokémon Sun / Moon',
  'Pokémon Ultra Sun / Ultra Moon',
  'Pokémon Sword / Shield',
  'Pokémon Brilliant Diamond / Shining Pearl',
  'Pokémon Legends: Arceus',
  'Pokémon Scarlet / Violet',
  'Pokémon Champions (Reg M-A)',
  'Otro / Romhack',
];

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useNuzlockeStore = create<State>()(
  persist(
    (set) => ({
      runs: [],
      activeRunId: null,

      createRun: (input) => {
        const id = uid('run');
        const now = Date.now();
        set((s) => ({
          runs: [
            {
              id,
              name: input.name,
              game: input.game,
              rules: input.rules,
              encounters: [],
              startedAt: now,
              endedAt: null,
              badges: 0,
            },
            ...s.runs,
          ],
          activeRunId: id,
        }));
        return id;
      },

      setActive: (id) => set({ activeRunId: id }),

      addEncounter: (runId, input) =>
        set((s) => ({
          runs: s.runs.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  encounters: [
                    ...r.encounters,
                    { ...input, id: uid('enc'), createdAt: Date.now() },
                  ],
                }
              : r
          ),
        })),

      updateEncounter: (runId, encounterId, patch) =>
        set((s) => ({
          runs: s.runs.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  encounters: r.encounters.map((e) =>
                    e.id === encounterId ? { ...e, ...patch } : e
                  ),
                }
              : r
          ),
        })),

      removeEncounter: (runId, encounterId) =>
        set((s) => ({
          runs: s.runs.map((r) =>
            r.id === runId
              ? {
                  ...r,
                  encounters: r.encounters.filter((e) => e.id !== encounterId),
                }
              : r
          ),
        })),

      setBadges: (runId, badges) =>
        set((s) => ({
          runs: s.runs.map((r) =>
            r.id === runId ? { ...r, badges: Math.max(0, Math.min(8, badges)) } : r
          ),
        })),

      endRun: (runId, reason) =>
        set((s) => ({
          runs: s.runs.map((r) =>
            r.id === runId
              ? { ...r, endedAt: Date.now(), endedReason: reason }
              : r
          ),
        })),

      reviveRun: (runId) =>
        set((s) => ({
          runs: s.runs.map((r) =>
            r.id === runId
              ? { ...r, endedAt: null, endedReason: undefined }
              : r
          ),
        })),

      deleteRun: (runId) =>
        set((s) => ({
          runs: s.runs.filter((r) => r.id !== runId),
          activeRunId: s.activeRunId === runId ? null : s.activeRunId,
        })),
    }),
    { name: 'pokehub-nuzlocke' }
  )
);
