import type { TaskPublic } from '@matem/shared';
import { create } from 'zustand';

export interface AttemptRecord {
  task: TaskPublic;
  given: string;
  isCorrect: boolean;
  correctAnswer?: string;
  solutionMd?: string | null;
}

interface SessionStore {
  title: string;
  tasks: TaskPublic[];
  index: number;
  results: AttemptRecord[];
  /** id параграфа → заголовок (для «просевших тем» в итогах). */
  titleByParagraph: Record<number, string>;

  start: (args: { title: string; tasks: TaskPublic[]; titleByParagraph: Record<number, string> }) => void;
  record: (r: AttemptRecord) => void;
  advance: () => void;
  reset: () => void;
}

// Перемешивание (для смешанной тренировки)
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export const useSessionStore = create<SessionStore>((set) => ({
  title: '',
  tasks: [],
  index: 0,
  results: [],
  titleByParagraph: {},

  start: ({ title, tasks, titleByParagraph }) =>
    set({ title, tasks, titleByParagraph, index: 0, results: [] }),
  record: (r) => set((s) => ({ results: [...s.results, r] })),
  advance: () => set((s) => ({ index: s.index + 1 })),
  reset: () => set({ title: '', tasks: [], index: 0, results: [], titleByParagraph: {} }),
}));
