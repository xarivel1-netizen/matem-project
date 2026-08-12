import { motion } from 'framer-motion';
import { usePress } from '../hooks/usePress';
import { haptic } from '../lib/haptic';
import { springs } from '../lib/springs';

interface BehindBannerProps {
  count: number;
  onView: () => void;
}

// Склонение «день/дня/дней»
function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня';
  return 'дней';
}

/**
 * Мягкая оранжевая плашка отставания. Без нотаций — просто факт и кнопка.
 */
export function BehindBanner({ count, onView }: BehindBannerProps) {
  const press = usePress();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.press}
      className="rounded-card border border-warning/30 bg-[color:var(--c-warning)]/10 p-4"
    >
      <div className="text-headline text-label">Немного позади плана</div>
      <div className="mt-0.5 text-subhead text-label-secondary">
        Осталось наверстать {count} {plural(count)}. Спокойно — просто вернись к ним, когда будет
        время.
      </div>
      <motion.button
        type="button"
        whileTap={press.whileTap}
        transition={press.transition}
        onClick={() => {
          haptic();
          onView();
        }}
        className="mt-3 inline-flex min-h-[36px] items-center rounded-pill bg-[color:var(--c-warning)]/15 px-4 text-subhead font-medium text-warning"
      >
        Посмотреть, что пропустил
      </motion.button>
    </motion.div>
  );
}
