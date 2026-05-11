import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storageAdapter } from '../storage/adapter';
import type { ItemType } from './validators';

export interface BankItem {
  id: string;
  type: ItemType;
  domain: string;
  topic: string;
  difficulty: number;
  source: 'bank' | 'ai-generated';
  reviewer_id?: string;
  reviewed_at?: string;
  content: Record<string, unknown>;
}

interface AdminState {
  edits: Record<string, BankItem>;       // edits to existing items, keyed by id
  newItems: Record<string, BankItem>;    // newly authored items, keyed by id
  removed: Record<string, true>;          // soft-deleted item ids

  stageEdit: (item: BankItem) => void;
  revertEdit: (id: string) => void;
  addNew: (item: BankItem) => void;
  removeNew: (id: string) => void;
  markRemoved: (id: string) => void;
  unmarkRemoved: (id: string) => void;
  discardAll: () => void;
  hasStaged: () => boolean;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      edits: {},
      newItems: {},
      removed: {},

      stageEdit: (item) =>
        set((s) => ({ edits: { ...s.edits, [item.id]: item } })),
      revertEdit: (id) =>
        set((s) => {
          const next = { ...s.edits };
          delete next[id];
          return { edits: next };
        }),
      addNew: (item) =>
        set((s) => ({ newItems: { ...s.newItems, [item.id]: item } })),
      removeNew: (id) =>
        set((s) => {
          const next = { ...s.newItems };
          delete next[id];
          return { newItems: next };
        }),
      markRemoved: (id) =>
        set((s) => ({ removed: { ...s.removed, [id]: true } })),
      unmarkRemoved: (id) =>
        set((s) => {
          const next = { ...s.removed };
          delete next[id];
          return { removed: next };
        }),
      discardAll: () => set({ edits: {}, newItems: {}, removed: {} }),
      hasStaged: () => {
        const s = get();
        return Object.keys(s.edits).length + Object.keys(s.newItems).length + Object.keys(s.removed).length > 0;
      },
    }),
    {
      name: 'az104game.v1.admin-staged',
      storage: createJSONStorage(() => storageAdapter),
    },
  ),
);
