import type { TargetAndTransition, Transition } from 'framer-motion';
import { springs } from '../lib/springs';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface PressProps {
  whileTap: TargetAndTransition;
  whileHover: TargetAndTransition;
  transition: Transition;
}

/**
 * Пружинная реакция на нажатие/наведение по DESIGN.md.
 * При prefers-reduced-motion перемещения/масштаб отключаются — остаётся только
 * изменение прозрачности.
 */
export function usePress(): PressProps {
  const reduced = usePrefersReducedMotion();
  if (reduced) {
    return {
      whileTap: { opacity: 0.6 },
      whileHover: {},
      transition: springs.press,
    };
  }
  return {
    whileTap: { scale: 0.96 },
    whileHover: { scale: 1.01 },
    transition: springs.press,
  };
}
