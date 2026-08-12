import type { ChapterWithParagraphs } from '@matem/shared';
import { create } from 'zustand';
import { api, ApiError } from '../api/client';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface TheoryStore {
  status: LoadStatus;
  error: string | null;
  chapters: ChapterWithParagraphs[];
  /** id параграфа → текст теории (или null, если пусто). */
  theoryById: Record<number, string | null>;

  load: () => Promise<void>;
  /** Локально обновляет теорию после сохранения — чтобы индикатор и поиск были свежими. */
  setTheoryLocal: (id: number, theoryMd: string) => void;
}

export const useTheoryStore = create<TheoryStore>((set) => ({
  status: 'idle',
  error: null,
  chapters: [],
  theoryById: {},

  load: async () => {
    set({ status: 'loading', error: null });
    try {
      // структура глав из плана + тексты теории из списка параграфов
      const [plan, paragraphs] = await Promise.all([api.getPlan(), api.getParagraphs()]);
      const theoryById: Record<number, string | null> = {};
      for (const p of paragraphs) theoryById[p.id] = p.theoryMd;
      set({ chapters: plan.chapters, theoryById, status: 'ready' });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Не удалось загрузить теорию.';
      set({ status: 'error', error: message });
    }
  },

  setTheoryLocal: (id, theoryMd) =>
    set((s) => ({ theoryById: { ...s.theoryById, [id]: theoryMd } })),
}));
