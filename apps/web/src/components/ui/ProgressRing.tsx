import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { springs } from '../../lib/springs';

interface ProgressRingProps {
  /** Заполнение 0..1. */
  progress: number;
  size?: number;
  stroke?: number;
  color?: string; // CSS-цвет дуги (по умолчанию акцент)
  trackColor?: string;
  children?: ReactNode; // содержимое в центре
}

/**
 * Кольцо прогресса. Дуга анимируется от текущего значения к новому через пружину,
 * никогда не перерисовывается скачком (кроме reduced-motion).
 */
export function ProgressRing({
  progress,
  size = 88,
  stroke = 10,
  color = 'var(--c-accent)',
  trackColor = 'var(--c-separator)',
  children,
}: ProgressRingProps) {
  const reduced = usePrefersReducedMotion();
  const r = (size - stroke) / 2;
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: clamped }}
          transition={reduced ? { duration: 0 } : springs.ring}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}
