import type { DayListItem, DayStatus } from '@matem/shared';
import { useEffect, useState } from 'react';
import { ActivityRings } from '../components/ActivityRings';
import { BehindBanner } from '../components/BehindBanner';
import { DaySheet } from '../components/DaySheet';
import { DayStrip } from '../components/DayStrip';
import { Button, ListGroup, ListRow, Pill, Screen, Sheet, type PillTone } from '../components/ui';
import { behindInfo, currentDayNumber, groupByChapter } from '../lib/planDerive';
import { usePlanStore } from '../store/usePlanStore';

// Цель по задачам для среднего кольца — величина для отображения, в плане её нет.
const TASKS_GOAL = 100;

const STATUS: Record<DayStatus, { label: string; tone: PillTone }> = {
  done: { label: 'Готово', tone: 'success' },
  pending: { label: 'В плане', tone: 'neutral' },
  skipped: { label: 'Пропущен', tone: 'warning' },
};

export function PlanScreen() {
  const { status, error, plan, stats, load } = usePlanStore();
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [missedOpen, setMissedOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') void load();
  }, [status, load]);

  return (
    <Screen title="План">
      {status === 'loading' && <PlanSkeleton />}

      {status === 'error' && (
        <div className="rounded-card bg-card p-5 text-center shadow-ios-card">
          <p className="text-body text-label">Не получилось загрузить план</p>
          <p className="mt-1 text-subhead text-label-secondary">{error}</p>
          <div className="mt-4 flex justify-center">
            <Button variant="tinted" onClick={() => void load()}>
              Повторить
            </Button>
          </div>
        </div>
      )}

      {status === 'ready' && plan && stats && (
        <PlanContent
          onSelectDay={setSelectedDayId}
          onOpenMissed={() => setMissedOpen(true)}
        />
      )}

      <DaySheet dayId={selectedDayId} onClose={() => setSelectedDayId(null)} />

      {plan && (
        <Sheet open={missedOpen} onClose={() => setMissedOpen(false)} title="Что пропустил">
          <ListGroup>
            {behindInfo(plan).days.map((d) => (
              <ListRow
                key={d.id}
                title={`День ${d.dayNumber}`}
                subtitle={d.title}
                trailing={<Pill tone={STATUS[d.status].tone}>{STATUS[d.status].label}</Pill>}
                showChevron
                onClick={() => {
                  setMissedOpen(false);
                  setSelectedDayId(d.id);
                }}
              />
            ))}
          </ListGroup>
        </Sheet>
      )}
    </Screen>
  );
}

function PlanContent({
  onSelectDay,
  onOpenMissed,
}: {
  onSelectDay: (id: number) => void;
  onOpenMissed: () => void;
}) {
  const plan = usePlanStore((s) => s.plan)!;
  const stats = usePlanStore((s) => s.stats)!;

  const current = currentDayNumber(plan);
  const behind = behindInfo(plan);
  const groups = groupByChapter(plan);

  const daysFrac = stats.totalDays > 0 ? stats.daysDone / stats.totalDays : 0;
  const tasksFrac = Math.min(1, stats.tasksSolved / TASKS_GOAL);
  const streakFrac = stats.bestStreak > 0 ? Math.min(1, stats.currentStreak / stats.bestStreak) : 0;

  return (
    <>
      {/* Три кольца + числа */}
      <div className="rounded-card bg-card p-5 shadow-ios-card">
        <div className="flex justify-center">
          <ActivityRings
            days={{ frac: daysFrac, color: 'var(--c-accent)' }}
            tasks={{ frac: tasksFrac, color: 'var(--c-success)' }}
            streak={{ frac: streakFrac, color: 'var(--c-warning)' }}
          />
        </div>
        <div className="mt-4 flex justify-around text-center">
          <Stat value={`${stats.daysDone}/${stats.totalDays}`} label="дней" color="text-accent" />
          <Stat value={String(stats.tasksSolved)} label="задач" color="text-success" />
          <Stat value={String(stats.currentStreak)} label="серия" color="text-warning" />
        </div>
      </div>

      {behind.count > 0 && <BehindBanner count={behind.count} onView={onOpenMissed} />}

      {/* Лента дней */}
      <DayStrip days={plan.days} currentDayNumber={current} onSelect={(d) => onSelectDay(d.id)} />

      {/* Главы → дни */}
      {groups.map((g) => {
        const locked = g.days.some((d) => d.isLocked);
        return (
          <ChapterBlock
            key={g.chapter.id}
            title={`Глава ${g.chapter.number}. ${g.chapter.title}`}
            days={g.days}
            locked={locked}
            current={current}
            onSelectDay={onSelectDay}
          />
        );
      })}
    </>
  );
}

function ChapterBlock({
  title,
  days,
  locked,
  current,
  onSelectDay,
}: {
  title: string;
  days: DayListItem[];
  locked: boolean;
  current: number;
  onSelectDay: (id: number) => void;
}) {
  const rows = days.map((d) => (
    <ListRow
      key={d.id}
      title={`День ${d.dayNumber}${d.dayNumber === current ? ' · сейчас' : ''}`}
      subtitle={d.title}
      trailing={<Pill tone={STATUS[d.status].tone}>{STATUS[d.status].label}</Pill>}
      showChevron
      onClick={() => onSelectDay(d.id)}
    />
  ));

  if (!locked) {
    return <ListGroup header={title}>{rows}</ListGroup>;
  }

  // Заблокированный блок производных — непрерывная акцентная подложка + подпись.
  return (
    <section>
      <div className="px-4 pb-1.5 pt-1 text-footnote uppercase tracking-wide text-accent">{title}</div>
      <div className="overflow-hidden rounded-card border border-accent/25 bg-accent-soft">
        {rows.map((row, i) => (
          <div key={i}>
            {row}
            {i < rows.length - 1 && <div className="ml-4 h-px bg-separator" />}
          </div>
        ))}
        <div className="border-t border-accent/25 px-4 py-3 text-footnote text-accent">
          Ключевой блок курса — производная и исследование функции. Его нельзя сжимать: держи эти
          дни целиком, даже если пришлось отнять день у других глав.
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div className={`tabular text-title2 ${color}`}>{value}</div>
      <div className="text-footnote text-label-secondary">{label}</div>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-56 rounded-card bg-card shadow-ios-card" />
      <div className="flex gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-10 shrink-0 rounded-pill bg-card" />
        ))}
      </div>
      <div className="h-40 rounded-card bg-card shadow-ios-card" />
    </div>
  );
}
