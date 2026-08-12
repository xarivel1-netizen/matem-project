import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Button, Icon, ListGroup, ListRow, Screen, Sheet } from '../components/ui';
import { useSessionStore } from '../store/useSessionStore';
import { useTheoryStore } from '../store/useTheoryStore';

export function TasksScreen() {
  const navigate = useNavigate();
  const { status, chapters, load } = useTheoryStore();
  const start = useSessionStore((s) => s.start);

  const [paraSheet, setParaSheet] = useState(false);
  const [chapterSheet, setChapterSheet] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === 'idle') void load();
  }, [status, load]);

  function titleMap(): Record<number, string> {
    const m: Record<number, string> = {};
    for (const ch of chapters) for (const p of ch.paragraphs) m[p.id] = p.title;
    return m;
  }

  async function begin(
    params: { paragraphId?: number; chapterId?: number; scope?: 'completed' },
    title: string,
  ) {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const tasks = await api.listTasks(params);
      if (tasks.length === 0) {
        setNotice('Здесь пока нет задач. Добавь свою — и тренируйся по ней.');
        return;
      }
      start({ title, tasks, titleByParagraph: titleMap() });
      navigate('/tasks/solve');
    } catch {
      setNotice('Не удалось загрузить задачи. Проверь сервер.');
    } finally {
      setBusy(false);
      setParaSheet(false);
      setChapterSheet(false);
    }
  }

  return (
    <Screen title="Задачи">
      <ListGroup header="Тренировка" footer="Ответы уходят на сервер, история попыток сохраняется.">
        <ListRow
          icon={<Icon.PencilSquare />}
          title="По параграфу"
          subtitle="Задачи одного параграфа"
          showChevron
          onClick={() => setParaSheet(true)}
        />
        <ListRow
          icon={<Icon.BookOpen />}
          title="По главе"
          subtitle="Все задачи главы"
          showChevron
          onClick={() => setChapterSheet(true)}
        />
        <ListRow
          icon={<Icon.ChartBar />}
          iconBg="bg-success"
          title="Смешанная тренировка"
          subtitle="Из уже пройденного"
          showChevron
          onClick={() => begin({ scope: 'completed' }, 'Смешанная тренировка')}
        />
      </ListGroup>

      <ListGroup>
        <ListRow
          icon={<Icon.Plus />}
          iconBg="bg-accent"
          title="Добавить свою задачу"
          showChevron
          onClick={() => navigate('/tasks/new')}
        />
      </ListGroup>

      {notice && (
        <div className="rounded-card border border-warning/30 bg-[color:var(--c-warning)]/10 p-4">
          <p className="text-subhead text-label">{notice}</p>
          <div className="mt-3">
            <Button variant="tinted" onClick={() => navigate('/tasks/new')}>
              Добавить задачу
            </Button>
          </div>
        </div>
      )}

      {/* Выбор параграфа */}
      <Sheet open={paraSheet} onClose={() => setParaSheet(false)} title="Выбери параграф">
        <div className="space-y-4">
          {chapters.map((ch) => (
            <ListGroup key={ch.id} header={`Глава ${ch.number}. ${ch.title}`}>
              {ch.paragraphs.map((p) => (
                <ListRow
                  key={p.id}
                  title={p.title}
                  showChevron
                  onClick={() => begin({ paragraphId: p.id }, p.title)}
                />
              ))}
            </ListGroup>
          ))}
        </div>
      </Sheet>

      {/* Выбор главы */}
      <Sheet open={chapterSheet} onClose={() => setChapterSheet(false)} title="Выбери главу">
        <ListGroup>
          {chapters.map((ch) => (
            <ListRow
              key={ch.id}
              title={`Глава ${ch.number}. ${ch.title}`}
              showChevron
              onClick={() => begin({ chapterId: ch.id }, `Глава ${ch.number}`)}
            />
          ))}
        </ListGroup>
      </Sheet>
    </Screen>
  );
}
