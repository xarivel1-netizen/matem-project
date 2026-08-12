import type { DayDetail } from '@matem/shared';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { springs } from '../lib/springs';
import { usePlanStore } from '../store/usePlanStore';
import { Button, Icon, ListGroup, ListRow, Pill, Sheet } from './ui';

interface DaySheetProps {
  dayId: number | null;
  onClose: () => void;
}

export function DaySheet({ dayId, onClose }: DaySheetProps) {
  const reduced = usePrefersReducedMotion();
  const navigate = useNavigate();
  const markDay = usePlanStore((s) => s.markDay);

  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // грузим детали дня при открытии
  useEffect(() => {
    if (dayId === null) return;
    let alive = true;
    setDetail(null);
    setError(null);
    setConfirming(false);
    setLoading(true);
    api
      .getDay(dayId)
      .then((d) => alive && setDetail(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Ошибка загрузки дня.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [dayId]);

  async function handleMark(status: 'done' | 'skipped') {
    if (dayId === null) return;
    try {
      if (status === 'done') {
        // показываем анимацию галочки, затем закрываем
        setConfirming(true);
        await markDay(dayId, 'done');
        setTimeout(onClose, reduced ? 0 : 650);
      } else {
        await markDay(dayId, 'skipped');
        onClose();
      }
    } catch {
      setConfirming(false);
      setError('Не удалось сохранить. Попробуй ещё раз.');
    }
  }

  function openTheory(paragraphId: number) {
    onClose();
    navigate(`/theory/${paragraphId}`);
  }

  return (
    <Sheet open={dayId !== null} onClose={onClose} title={detail ? `День ${detail.dayNumber}` : 'День'}>
      {loading && <p className="py-6 text-center text-subhead text-label-secondary">Загружаю…</p>}

      {error && !loading && (
        <div className="py-4">
          <p className="text-subhead text-error">{error}</p>
        </div>
      )}

      {detail && !loading && (
        <div className="space-y-4 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-body text-label">{detail.title}</span>
            {detail.status === 'done' && <Pill tone="success">Готово</Pill>}
            {detail.status === 'skipped' && <Pill tone="warning">Пропущен</Pill>}
          </div>

          {detail.note && <p className="text-subhead text-label-secondary">{detail.note}</p>}

          {detail.paragraphs.length > 0 && (
            <>
              <ListGroup header="Параграфы">
                {detail.paragraphs.map((p) => (
                  <ListRow
                    key={p.id}
                    icon={<Icon.BookOpen />}
                    title={p.title}
                    subtitle={p.tasks.length > 0 ? `${p.tasks.length} задач` : undefined}
                    showChevron
                    onClick={() => openTheory(p.id)}
                  />
                ))}
              </ListGroup>
              <Button variant="tinted" fullWidth onClick={() => openTheory(detail.paragraphs[0]!.id)}>
                Теория
              </Button>
            </>
          )}

          {confirming ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <AnimatedCheck reduced={reduced} />
              <span className="text-headline text-success">Отмечено</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="filled" fullWidth onClick={() => handleMark('done')}>
                {detail.status === 'done' ? 'Отметить заново' : 'Отметить день'}
              </Button>
              <Button variant="tinted" onClick={() => handleMark('skipped')}>
                Пропустить
              </Button>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}

/** Крупная галочка: кружок заливается зелёным (scale-пульс) + рисуется путь pathLength. */
function AnimatedCheck({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative h-14 w-14">
      <motion.span
        className="absolute inset-0 rounded-full bg-success"
        initial={{ scale: reduced ? 1 : 0 }}
        animate={{ scale: 1 }}
        transition={reduced ? { duration: 0 } : springs.ring}
      />
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-0 h-full w-full p-3 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M5 13l4 4L19 7"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}
