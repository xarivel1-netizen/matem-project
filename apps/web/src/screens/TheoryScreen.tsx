import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Highlight } from '../components/Highlight';
import { Button, Icon, ListGroup, ListRow, Screen } from '../components/ui';
import { useTheoryStore } from '../store/useTheoryStore';

/** Возвращает короткий фрагмент теории вокруг совпадения — для превью в поиске. */
function snippet(text: string, query: string): string | null {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return null;
  const start = Math.max(0, idx - 24);
  return (start > 0 ? '…' : '') + text.slice(start, idx + query.length + 40).trim() + '…';
}

export function TheoryScreen() {
  const navigate = useNavigate();
  const { status, error, chapters, theoryById, load } = useTheoryStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (status === 'idle') void load();
  }, [status, load]);

  const q = query.trim().toLowerCase();

  // Отфильтрованные главы: параграф проходит, если совпал заголовок или текст теории
  const filtered = useMemo(() => {
    if (!q) return chapters;
    return chapters
      .map((ch) => ({
        ...ch,
        paragraphs: ch.paragraphs.filter((p) => {
          const inTitle = p.title.toLowerCase().includes(q);
          const inBody = (theoryById[p.id] ?? '').toLowerCase().includes(q);
          return inTitle || inBody;
        }),
      }))
      .filter((ch) => ch.paragraphs.length > 0);
  }, [chapters, theoryById, q]);

  return (
    <Screen title="Теория">
      {/* Поиск */}
      <label className="flex items-center gap-2 rounded-sm bg-black/[0.06] px-3 py-2 dark:bg-white/[0.10]">
        <Icon.Search className="h-[18px] w-[18px] text-label-secondary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по параграфам"
          className="w-full bg-transparent text-body text-label outline-none placeholder:text-label-tertiary"
        />
      </label>

      {status === 'loading' && (
        <div className="animate-pulse space-y-3">
          <div className="h-32 rounded-card bg-card" />
          <div className="h-32 rounded-card bg-card" />
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-card bg-card p-5 text-center shadow-ios-card">
          <p className="text-body text-label">Не получилось загрузить теорию</p>
          <p className="mt-1 text-subhead text-label-secondary">{error}</p>
          <div className="mt-4 flex justify-center">
            <Button variant="tinted" onClick={() => void load()}>
              Повторить
            </Button>
          </div>
        </div>
      )}

      {status === 'ready' && filtered.length === 0 && (
        <div className="rounded-card bg-card p-6 text-center shadow-ios-card">
          <p className="text-body text-label">Ничего не нашлось</p>
          <p className="mt-1 text-subhead text-label-secondary">
            Попробуй другое слово или загляни в параграф и напиши конспект сам.
          </p>
        </div>
      )}

      {status === 'ready' &&
        filtered.map((ch) => (
          <ListGroup key={ch.id} header={`Глава ${ch.number}. ${ch.title}`}>
            {ch.paragraphs.map((p) => {
              const theory = theoryById[p.id] ?? '';
              const has = theory.trim().length > 0;
              const preview = q && has ? snippet(theory, q) : null;
              return (
                <ListRow
                  key={p.id}
                  icon={<Icon.BookOpen />}
                  iconBg={has ? 'bg-accent' : 'bg-black/20 dark:bg-white/20'}
                  title={<Highlight text={p.title} query={query} />}
                  subtitle={
                    preview ? (
                      <Highlight text={preview} query={query} />
                    ) : has ? (
                      'Есть конспект'
                    ) : (
                      'Пусто'
                    )
                  }
                  showChevron
                  onClick={() => navigate(`/theory/${p.id}`)}
                />
              );
            })}
          </ListGroup>
        ))}
    </Screen>
  );
}
