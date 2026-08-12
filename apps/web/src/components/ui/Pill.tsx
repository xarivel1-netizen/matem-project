import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type PillTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error';

interface PillProps {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}

// Статусные пилюли. Цвет-статус (зелёный/красный/оранжевый) — только смысл, не декор.
const TONE: Record<PillTone, string> = {
  neutral: 'bg-black/[0.06] text-label-secondary dark:bg-white/[0.12]',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-[color:var(--c-success)]/15 text-success',
  warning: 'bg-[color:var(--c-warning)]/15 text-warning',
  error: 'bg-[color:var(--c-error)]/15 text-error',
};

export function Pill({ children, tone = 'neutral', className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-caption',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
