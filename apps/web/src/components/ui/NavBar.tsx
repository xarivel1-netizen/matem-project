import { motion, type MotionValue } from 'framer-motion';
import type { ReactNode } from 'react';

interface NavBarProps {
  title: string;
  right?: ReactNode;
  left?: ReactNode;
  /** Прозрачность компактного заголовка (0→1 при скролле). */
  compactOpacity: MotionValue<number>;
  /** Прозрачность нижнего хайрлайна (появляется при скролле). */
  hairlineOpacity: MotionValue<number>;
}

/** Липкая полупрозрачная навигация: компактный заголовок проявляется при скролле. */
export function NavBar({ title, right, left, compactOpacity, hairlineOpacity }: NavBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
      <div
        className="relative flex items-center justify-center bg-navbar px-4 backdrop-blur-xl"
        style={{ height: 'calc(44px + var(--safe-top))', paddingTop: 'var(--safe-top)' }}
      >
        {left && (
          <div className="pointer-events-auto absolute" style={{ left: 4, top: 'var(--safe-top)' }}>
            {left}
          </div>
        )}
        <motion.span style={{ opacity: compactOpacity }} className="text-headline text-label">
          {title}
        </motion.span>
        {right && (
          <div className="pointer-events-auto absolute" style={{ right: 12, top: 'var(--safe-top)' }}>
            {right}
          </div>
        )}
        <motion.div
          style={{ opacity: hairlineOpacity }}
          className="absolute inset-x-0 bottom-0 h-px bg-separator"
        />
      </div>
    </div>
  );
}
