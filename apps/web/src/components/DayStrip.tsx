import type { DayListItem, DayStatus } from '@matem/shared';
import { motion } from 'framer-motion';
import { usePress } from '../hooks/usePress';
import { cn } from '../lib/cn';
import { haptic } from '../lib/haptic';

interface DayStripProps {
  days: DayListItem[];
  currentDayNumber: number;
  onSelect: (day: DayListItem) => void;
}

// Цвет пилюли по статусу. Цвет-статус — смысл, не украшение.
const STATUS_BG: Record<DayStatus, string> = {
  done: 'bg-success text-white',
  skipped: 'bg-warning text-white',
  pending: 'bg-black/[0.06] text-label-secondary dark:bg-white/[0.12]',
};

/** Горизонтальная лента 30 дней со snap-скроллом. Текущий день крупнее и акцентный. */
export function DayStrip({ days, currentDayNumber, onSelect }: DayStripProps) {
  const press = usePress();
  const sorted = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ scrollSnapType: 'x mandatory' }}>
      <div className="flex items-center gap-2 pb-1">
        {sorted.map((d) => {
          const isCurrent = d.dayNumber === currentDayNumber;
          return (
            <motion.button
              key={d.id}
              type="button"
              aria-label={`День ${d.dayNumber}`}
              whileTap={press.whileTap}
              transition={press.transition}
              onClick={() => {
                haptic();
                onSelect(d);
              }}
              style={{ scrollSnapAlign: 'center' }}
              className={cn(
                'tabular flex shrink-0 items-center justify-center rounded-pill font-semibold',
                isCurrent
                  ? 'h-12 w-12 bg-accent text-[17px] text-white shadow-ios-lift ring-2 ring-accent/40'
                  : cn('h-10 w-10 text-[15px]', STATUS_BG[d.status]),
              )}
            >
              {d.dayNumber}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
