// =============================================================================
// 軽量状態管理（Zustand）。永続が必要な箇所のみ persist で localStorage 保存。
//   - userPersonas: ウィザードで作成したペルソナ（モックの PERSONAS に追加）
//   - feedbacks:    AI 推薦フィードバック（§8 将来の学習用データ構造）
//   - targetLists / favorites / notes / excluded / lastRunAt
// =============================================================================
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PERSONAS } from "./mock/personas";
import type { Persona, RecommendationFeedback } from "./types";

export type TargetList = {
  id: string;
  name: string;
  candidateIds: string[];
  createdAt: string;
};

type ExcludedRec = { personaId: string; candidateId: string };

type AppState = {
  userPersonas: Persona[];
  targetLists: TargetList[];
  favorites: string[];
  notes: Record<string, string>;
  feedbacks: RecommendationFeedback[];
  excluded: ExcludedRec[];
  lastRunAt: Record<string, string>;

  addPersona: (p: Persona) => void;
  createTargetList: (name: string) => string;
  addToTargetList: (listId: string, candidateId: string) => void;
  removeFromTargetList: (listId: string, candidateId: string) => void;
  toggleFavorite: (candidateId: string) => void;
  setNote: (candidateId: string, note: string) => void;
  addFeedback: (f: RecommendationFeedback) => void;
  excludeRec: (personaId: string, candidateId: string) => void;
  markRun: (personaId: string, at: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userPersonas: [],
      targetLists: [
        {
          id: "tl-default",
          name: "海外SaaS営業 候補",
          candidateIds: ["c01", "c03"],
          createdAt: "2026-06-15",
        },
      ],
      favorites: ["c14"],
      notes: {},
      feedbacks: [],
      excluded: [],
      lastRunAt: {},

      addPersona: (p) =>
        set((s) => ({ userPersonas: [...s.userPersonas, p] })),

      createTargetList: (name) => {
        const id = `tl-${Date.now()}`;
        set((s) => ({
          targetLists: [
            ...s.targetLists,
            { id, name, candidateIds: [], createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      addToTargetList: (listId, candidateId) =>
        set((s) => ({
          targetLists: s.targetLists.map((l) =>
            l.id === listId && !l.candidateIds.includes(candidateId)
              ? { ...l, candidateIds: [...l.candidateIds, candidateId] }
              : l,
          ),
        })),

      removeFromTargetList: (listId, candidateId) =>
        set((s) => ({
          targetLists: s.targetLists.map((l) =>
            l.id === listId
              ? { ...l, candidateIds: l.candidateIds.filter((c) => c !== candidateId) }
              : l,
          ),
        })),

      toggleFavorite: (candidateId) =>
        set((s) => ({
          favorites: s.favorites.includes(candidateId)
            ? s.favorites.filter((c) => c !== candidateId)
            : [...s.favorites, candidateId],
        })),

      setNote: (candidateId, note) =>
        set((s) => ({ notes: { ...s.notes, [candidateId]: note } })),

      addFeedback: (f) =>
        set((s) => ({
          // 同一候補×ペルソナは最新で上書き
          feedbacks: [
            ...s.feedbacks.filter(
              (x) => !(x.candidateId === f.candidateId && x.personaId === f.personaId),
            ),
            f,
          ],
        })),

      excludeRec: (personaId, candidateId) =>
        set((s) => ({
          excluded: s.excluded.some(
            (e) => e.personaId === personaId && e.candidateId === candidateId,
          )
            ? s.excluded
            : [...s.excluded, { personaId, candidateId }],
        })),

      markRun: (personaId, at) =>
        set((s) => ({ lastRunAt: { ...s.lastRunAt, [personaId]: at } })),
    }),
    { name: "work-bridge-scout" },
  ),
);

/** モック + ユーザー作成ペルソナを結合（ユーザー作成を後ろに） */
export function useAllPersonas(): Persona[] {
  const userPersonas = useAppStore((s) => s.userPersonas);
  return [...PERSONAS, ...userPersonas];
}
