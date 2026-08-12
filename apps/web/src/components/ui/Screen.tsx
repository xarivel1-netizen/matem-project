import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../lib/cn';
import { NavBar } from './NavBar';

interface ScreenProps {
  title: string;
  right?: ReactNode;
  left?: ReactNode;
  children: ReactNode;
  /** Доп. класс для скролл-контейнера. */
  className?: string;
}

/**
 * Каркас экрана: стеклянный NavBar сверху + скролл-контент с Large Title,
 * который при скролле сжимается в компактный заголовок по центру.
 * Контент скроллится под навбаром и таб-баром.
 */
export function Screen({ title, right, left, children, className }: ScreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollY } = useScroll({ container: ref });

  const compactOpacity = useTransform(scrollY, [26, 52], [0, 1]);
  const hairlineOpacity = useTransform(scrollY, [4, 16], [0, 1]);
  const bigOpacity = useTransform(scrollY, [0, 40], [1, 0]);
  const bigY = useTransform(scrollY, [0, 40], [0, -6]);

  return (
    <div className="absolute inset-0">
      <NavBar
        title={title}
        right={right}
        left={left}
        compactOpacity={compactOpacity}
        hairlineOpacity={hairlineOpacity}
      />
      <div
        ref={ref}
        className={cn('h-full overflow-y-auto overscroll-contain px-4', className)}
        style={{
          paddingTop: 'calc(44px + var(--safe-top))',
          paddingBottom: 'calc(64px + var(--safe-bottom))',
        }}
      >
        {/* На десктопе контент ограничен по ширине для читаемости и центрирован */}
        <div className="mx-auto w-full max-w-2xl">
          <motion.h1
            style={reduced ? undefined : { opacity: bigOpacity, y: bigY }}
            className="pb-3 pt-2 text-large-title text-label"
          >
            {title}
          </motion.h1>
          <div className="space-y-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
