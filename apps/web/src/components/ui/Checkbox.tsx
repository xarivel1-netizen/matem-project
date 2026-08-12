import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptic';
import { springs } from '../../lib/springs';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string; // a11y-подпись
  className?: string;
}

/**
 * Чекбокс выполненного дня: галочка рисуется анимацией pathLength 0→1,
 * одновременно кружок заливается зелёным с пружинным scale-пульсом.
 */
export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        haptic();
        onChange(!checked);
      }}
      className={cn('relative h-7 w-7 shrink-0', className)}
    >
      {/* контур в невыбранном состоянии */}
      <span
        className={cn(
          'absolute inset-0 rounded-full border-2 transition-opacity',
          checked ? 'opacity-0' : 'border-label-tertiary opacity-100',
        )}
      />
      {/* зелёная заливка */}
      <motion.span
        className="absolute inset-0 rounded-full bg-success"
        initial={false}
        animate={{ scale: checked ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : springs.ring}
      />
      {/* галочка */}
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 h-full w-full p-1.5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M5 13l4 4L19 7"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
        />
      </svg>
    </button>
  );
}
