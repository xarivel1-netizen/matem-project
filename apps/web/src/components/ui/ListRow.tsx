import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePress } from '../../hooks/usePress';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptic';
import { ChevronRight } from './Icons';

interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Иконка в цветном скруглённом квадрате слева. */
  icon?: ReactNode;
  iconBg?: string; // tailwind-класс фона квадрата (по умолчанию акцент)
  /** Правый слот: значение, пилюля, переключатель и т.п. */
  trailing?: ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  iconBg = 'bg-accent',
  trailing,
  showChevron,
  onClick,
  className,
}: ListRowProps) {
  const press = usePress();
  const interactive = Boolean(onClick);

  return (
    <motion.div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      whileTap={interactive ? press.whileTap : undefined}
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
        'flex min-h-[44px] items-center gap-3 bg-card px-4 py-2.5',
        interactive && 'cursor-pointer active:bg-black/[0.03] dark:active:bg-white/[0.05]',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-white [&>svg]:h-[18px] [&>svg]:w-[18px]',
            iconBg,
          )}
        >
          {icon}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate text-body text-label">{title}</div>
        {subtitle && <div className="truncate text-subhead text-label-secondary">{subtitle}</div>}
      </div>

      {trailing && <div className="shrink-0 text-subhead text-label-secondary">{trailing}</div>}
      {showChevron && <ChevronRight className="h-[18px] w-[18px] shrink-0 text-label-tertiary" />}
    </motion.div>
  );
}
