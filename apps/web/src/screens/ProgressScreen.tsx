import { Icon, ListGroup, ListRow, ProgressRing, Screen } from '../components/ui';
import { ThemeToggle } from '../theme/ThemeToggle';
import { mockStats } from '../lib/mock';

/** Фирменный элемент: три концентрических кольца в стиле Apple Fitness. */
function ActivityRings() {
  const days = mockStats.daysDone / mockStats.totalDays;
  const tasks = mockStats.tasksSolved / mockStats.tasksTarget;
  const streak = mockStats.currentStreak / (mockStats.bestStreak || 1);

  return (
    <div className="relative mx-auto h-[152px] w-[152px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing progress={days} size={152} stroke={13} color="var(--c-accent)" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing progress={tasks} size={116} stroke={13} color="var(--c-success)" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing progress={streak} size={80} stroke={13} color="var(--c-warning)" />
      </div>
    </div>
  );
}

export function ProgressScreen() {
  return (
    <Screen title="Прогресс">
      <div className="rounded-card bg-card p-5 shadow-ios-card">
        <ActivityRings />
        <div className="mt-4 flex justify-around text-center">
          <div>
            <div className="tabular text-title2 text-accent">
              {mockStats.daysDone}/{mockStats.totalDays}
            </div>
            <div className="text-footnote text-label-secondary">дней</div>
          </div>
          <div>
            <div className="tabular text-title2 text-success">{mockStats.tasksSolved}</div>
            <div className="text-footnote text-label-secondary">задач</div>
          </div>
          <div>
            <div className="tabular text-title2 text-warning">{mockStats.currentStreak}</div>
            <div className="text-footnote text-label-secondary">серия</div>
          </div>
        </div>
      </div>

      <ListGroup header="Статистика">
        <ListRow icon={<Icon.Flame />} iconBg="bg-warning" title="Лучшая серия" trailing={<span className="tabular">{mockStats.bestStreak} дн.</span>} />
        <ListRow icon={<Icon.ChartBar />} iconBg="bg-success" title="Точность ответов" trailing={<span className="tabular">78%</span>} />
      </ListGroup>

      <ListGroup header="Оформление">
        <div className="px-4 py-3">
          <ThemeToggle />
        </div>
      </ListGroup>
    </Screen>
  );
}
