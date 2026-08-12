import type { DayStatus, PlanResponse, Stats } from '@matem/shared';
import { create } from 'zustand';
import { api, ApiError } from '../api/client';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface PlanStore {
  status: LoadStatus;
  error: string | null;
  plan: PlanResponse | null;
  stats: Stats | null;
  /** id дня, по которому сейчас идёт запрос отметки (для локального лоадера). */
  markingDayId: number | null;

  load: () => Promise<void>;
  markDay: (dayId: number, status: DayStatus) => Promise<void>;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  status: 'idle',
  error: null,
  plan: null,
  stats: null,
  markingDayId: null,

  load: async () => {
    set({ status: 'loading', error: null });
    try {
      const [plan, stats] = await Promise.all([api.getPlan(), api.getStats()]);
      set({ plan, stats, status: 'ready' });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Не удалось загрузить план.';
      set({ status: 'error', error: message });
    }
  },

  markDay: async (dayId, status) => {
    const { plan } = get();
    if (!plan) return;
    set({ markingDayId: dayId });
    try {
      const result = await api.setDayProgress(dayId, status);
      // локально обновляем статус дня — без перезагрузки плана
      const days = plan.days.map((d) =>
        d.id === dayId ? { ...d, status: result.status, completedAt: result.completedAt } : d,
      );
      set({ plan: { ...plan, days } });
      // кольца пересчитываются: тянем свежую статистику (сервер считает серию заново)
      const stats = await api.getStats();
      set({ stats });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Не удалось сохранить.';
      set({ error: message });
      throw e;
    } finally {
      set({ markingDayId: null });
    }
  },
}));
