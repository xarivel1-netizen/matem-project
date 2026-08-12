import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePress } from '../../hooks/usePress';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptic';

export type ButtonVariant = 'filled' | 'tinted' | 'plain';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

const VARIANT: Record<ButtonVariant, string> = {
  filled: 'bg-accent text-white',
  tinted: 'bg-accent-soft text-accent',
  plain: 'bg-transparent text-accent',
};

export function Button({
  children,
  variant = 'filled',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className,
}: ButtonProps) {
  const press = usePress();
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : press.whileTap}
      transition={press.transition}
      onClick={() => {
        if (disabled) return;
        haptic();
        onClick?.();
      }}
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-pill px-5 text-headline',
        'select-none disabled:opacity-40',
        VARIANT[variant],
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
