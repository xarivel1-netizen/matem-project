import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { haptic } from '../../lib/haptic';
import { springs } from '../../lib/springs';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

// Пороги закрытия свайпом вниз
const CLOSE_OFFSET = 120;
const CLOSE_VELOCITY = 500;

/** Модальная шторка снизу: выезжает снизу, затемняет фон, закрывается свайпом вниз. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const reduced = usePrefersReducedMotion();

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.y > CLOSE_OFFSET || info.velocity.y > CLOSE_VELOCITY) {
      haptic();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* затемнение фона — сигнал, что фон закрыт (blur/scrim) */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 rounded-t-sheet bg-elevated pb-[calc(16px+var(--safe-bottom))] shadow-sheet"
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={springs.sheet}
            drag={reduced ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* «грабер» — подсказка, что можно тянуть */}
            <div className="flex justify-center pt-2.5">
              <div className="h-1 w-9 rounded-pill bg-label-tertiary" />
            </div>
            {title && <h2 className="px-4 pb-2 pt-3 text-title2 text-label">{title}</h2>}
            <div className="max-h-[70vh] overflow-y-auto px-4 pt-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
