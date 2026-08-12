import { SegmentedControl } from '../components/ui';
import { useThemeStore, type ThemeMode } from './useTheme';

const SEGMENTS = [
  { value: 'system', label: 'Система' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
] satisfies { value: ThemeMode; label: string }[];

/** Переключатель темы: система / светлая / тёмная. Выбор хранится в localStorage. */
export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  return <SegmentedControl segments={SEGMENTS} value={mode} onChange={setMode} />;
}
