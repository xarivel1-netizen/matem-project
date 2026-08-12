// МОК-данные только для каркаса (этап 3). Реальные данные подключаются с API на этапе 4.
import type { DayStatus } from '@matem/shared';

export interface MockDay {
  dayNumber: number;
  title: string;
  status: DayStatus;
  chapter: string;
}

export const mockDays: MockDay[] = [
  { dayNumber: 1, title: 'Функции: определение, область определения', status: 'done', chapter: 'Функции' },
  { dayNumber: 2, title: 'Наибольшее/наименьшее значение. Чётность', status: 'done', chapter: 'Функции' },
  { dayNumber: 3, title: 'Построение графиков через преобразования', status: 'skipped', chapter: 'Функции' },
  { dayNumber: 4, title: 'Обратная функция', status: 'pending', chapter: 'Функции' },
  { dayNumber: 5, title: 'Степенная функция с целым показателем', status: 'pending', chapter: 'Степенная функция' },
  { dayNumber: 6, title: 'Корень n-й степени', status: 'pending', chapter: 'Степенная функция' },
];

export const mockStats = {
  daysDone: 2,
  totalDays: 30,
  tasksSolved: 14,
  tasksTarget: 40,
  currentStreak: 2,
  bestStreak: 5,
};

export const mockTasks = [
  { id: 1, statement: 'Найдите f(0), если f(x) = 2x + 1', difficulty: 1 as const },
  { id: 2, statement: 'Область определения y = √(x − 3)', difficulty: 2 as const },
  { id: 3, statement: 'Чётна ли функция y = x⁴ − x²?', difficulty: 2 as const },
];

export const mockTheory = `Функция — соответствие, при котором каждому x из области определения
отвечает ровно одно значение y. Область определения — множество допустимых x.`;
