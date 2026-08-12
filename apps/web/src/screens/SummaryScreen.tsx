import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, ListGroup, ListRow, Pill, ProgressRing, Screen } from '../components/ui';
import { useSessionStore } from '../store/useSessionStore';

export function SummaryScreen() {
  const navigate = useNavigate();
  const { results, title, titleByParagraph, start } = useSessionStore();

  // прямой заход без сессии → назад к выбору
  useEffect(() => {
    if (results.length === 0) navigate('/tasks', { replace: true });
  }, [results.length, navigate]);

  const solved = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const accuracy = total > 0 ? Math.round((solved / total) * 100) : 0;

  // просевшие темы — параграфы с ошибками
  const weak = useMemo(() => {
    const byParagraph = new Map<number, number>();
    for (const r of results) {
      if (!r.isCorrect) {
        const pid = r.task.paragraphId;
        byParagraph.set(pid, (byParagraph.get(pid) ?? 0) + 1);
      }
    }
    return [...byParagraph.entries()]
      .map(([pid, count]) => ({ pid, count, title: titleByParagraph[pid] ?? `Параграф #${pid}` }))
      .sort((a, b) => b.count - a.count);
  }, [results, titleByParagraph]);

  const wrongTasks = results.filter((r) => !r.isCorrect).map((r) => r.task);

  function retryWrong() {
    start({ title: `${title} · работа над ошибками`, tasks: wrongTasks, titleByParagraph });
    navigate('/tasks/solve');
  }

  if (total === 0) return <Screen title="Итоги" children={null} />;

  return (
    <Screen title="Итоги">
      <div className="rounded-card bg-card p-5 shadow-ios-card">
        <div className="flex items-center gap-5">
          <ProgressRing progress={accuracy / 100} size={96} color="var(--c-success)">
            <span className="tabular text-title2 text-label">{accuracy}%</span>
          </ProgressRing>
          <div>
            <div className="tabular text-large-title text-label">
              {solved}/{total}
            </div>
            <div className="text-subhead text-label-secondary">решено верно</div>
          </div>
        </div>
      </div>

      {weak.length > 0 ? (
        <ListGroup header="Просели темы">
          {weak.map((w) => (
            <ListRow
              key={w.pid}
              icon={<Icon.PencilSquare />}
              iconBg="bg-warning"
              title={w.title}
              trailing={<Pill tone="error">{w.count} ошиб.</Pill>}
            />
          ))}
        </ListGroup>
      ) : (
        <div className="rounded-card bg-card p-6 text-center shadow-ios-card">
          <p className="text-body text-label">Без ошибок — чисто</p>
          <p className="mt-1 text-subhead text-label-secondary">Все задачи решены верно.</p>
        </div>
      )}

      <div className="space-y-2">
        {wrongTasks.length > 0 && (
          <Button variant="filled" fullWidth onClick={retryWrong}>
            Ещё раз по ошибкам
          </Button>
        )}
        <Button variant="tinted" fullWidth onClick={() => navigate('/tasks')}>
          К выбору задач
        </Button>
      </div>
    </Screen>
  );
}
