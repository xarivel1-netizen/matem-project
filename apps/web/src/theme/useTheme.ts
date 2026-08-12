import { useEffect } from 'react';
import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'matem-theme';

// localStorage допустим ТОЛЬКО для темы оформления (CLAUDE.md, правило 6).
function loadMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'system';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: loadMode(),
  setMode: (mode) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, mode);
    set({ mode });
  },
}));

function resolveDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Применяет выбранную тему к <html> (класс .dark) и следит за системной. */
export function useApplyTheme(): void {
  const mode = useThemeStore((s) => s.mode);
  useEffect(() => {
    const apply = () => document.documentElement.classList.toggle('dark', resolveDark(mode));
    apply();
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [mode]);
}
