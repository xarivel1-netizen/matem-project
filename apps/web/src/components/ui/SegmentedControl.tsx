import { motion } from 'framer-motion';
import { useId } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptic';
import { springs } from '../../lib/springs';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const layoutId = useId();
  const reduced = usePrefersReducedMotion();

  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex w-full rounded-sm bg-black/[0.06] p-0.5 dark:bg-white/[0.10]',
        className,
      )}
    >
      {segments.map((seg) => {
        const selected = seg.value === value;
        return (
          <button
            key={seg.value}
            role="tab"
            aria-selected={selected}
            onClick={() => {
              if (!selected) {
                haptic();
                onChange(seg.value);
              }
            }}
            className="relative flex-1 select-none rounded-[8px] px-3 py-1.5 text-subhead"
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                transition={reduced ? { duration: 0 } : springs.press}
                className="absolute inset-0 rounded-[8px] bg-card shadow-ios-sm"
              />
            )}
            <span
              className={cn(
                'relative z-10 font-medium',
                selected ? 'text-label' : 'text-label-secondary',
              )}
            >
              {seg.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
