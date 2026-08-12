import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePress } from '../../hooks/usePress';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptic';

interface IconButtonProps {
  children: ReactNode;
  label: string; // обязательная a11y-подпись для иконочной кнопки
  onClick?: () => void;
  variant?: 'tinted' | 'plain';
  disabled?: boolean;
  className?: string;
}

export function IconButton({
  children,
  label,
  onClick,
  variant = 'plain',
  disabled = false,
  className,
}: IconButtonProps) {
  const press = usePress();
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      whileTap={disabled ? undefined : press.whileTap}
      whileHover={disabled ? undefined : press.whileHover}
      transition={press.transition}
      onClick={() => {
        if (disabled) return;
        haptic();
        onClick?.();
      }}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-pill text-accent',
        'select-none disabled:opacity-40',
        variant === 'tinted' && 'bg-accent-soft',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
