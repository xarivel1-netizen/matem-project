import type { Transition } from 'framer-motion';

/**
 * Пружинные пресеты — единственный источник значений анимации.
 * Магических чисел в компонентах быть не должно: всё берётся отсюда.
 * Значения из DESIGN.md (раздел «Движение»).
 */
export const springs = {
  /** Нажатие на любой интерактивный элемент (whileTap / hover). */
  press: { type: 'spring', stiffness: 400, damping: 30 } satisfies Transition,
  /** Модалки и шторки: выезд снизу. */
  sheet: { type: 'spring', stiffness: 300, damping: 32 } satisfies Transition,
  /** Прогресс-кольца: плавное заполнение без скачка. */
  ring: { type: 'spring', stiffness: 120, damping: 18 } satisfies Transition,
  /** Переходы между экранами (push-навигация). */
  screen: { type: 'spring', stiffness: 320, damping: 34 } satisfies Transition,
} as const;
