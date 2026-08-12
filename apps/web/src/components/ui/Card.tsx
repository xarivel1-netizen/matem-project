import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePress } from '../../hooks/usePress';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptic';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

// Карточка. Если задан onClick — становится интерактивной (пружина + подъём тени).
export function Card({ children, onClick, className }: CardProps) {
  const press = usePress();
  const interactive = Boolean(onClick);

  return (
    <motion.div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      whileTap={interactive ? press.whileTap : undefined}
      whileHover={interactive ? { ...press.whileHover, boxShadow: 'var(--tw-shadow)' } : undefined}
      transition={press.transition}
      onClick={
        interactive
          ? () => {
              haptic();
              onClick?.();
            }
          : undefined
      }
      className={cn(
        'rounded-card bg-card p-4 shadow-ios-card',
        interactive && 'cursor-pointer hover:shadow-ios-lift',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
