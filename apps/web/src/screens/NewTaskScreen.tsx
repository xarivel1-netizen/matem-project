import type { CreateTaskInput, Difficulty, TaskKind } from '@matem/shared';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { Markdown } from '../components/Markdown';
import { Button, Icon, IconButton, Screen, SegmentedControl } from '../components/ui';
import { cn } from '../lib/cn';
import { haptic } from '../lib/haptic';
import { useTheoryStore } from '../store/useTheoryStore';

export function NewTaskScreen() {
  const navigate = useNavigate();
  const { status, chapters, load } = useTheoryStore();

  const [paragraphId, setParagraphId] = useState<number | null>(null);
  const [kind, setKind] = useState<TaskKind>('input');
  const [statement, setStatement] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [solution, setSolution] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'idle') void load();
  }, [status, load]);

  // первый параграф по умолчанию
  useEffect(() => {
    if (paragraphId === null && chapters[0]?.paragraphs[0]) {
      setParagraphId(chapters[0].paragraphs[0].id);
    }
  }, [chapters, paragraphId]);

  const answerValue = kind === 'choice' ? (options[correctIdx] ?? '') : answer;
  const optionsClean = options.map((o) => o.trim()).filter(Boolean);
  const valid =
    paragraphId !== null &&
    statement.trim().length > 0 &&
    answerValue.trim().length > 0 &&
    (kind === 'input' || optionsClean.length >= 2);

  async function submit() {
    if (!valid || paragraphId === null || saving) return;
    setSaving(true);
    setError(null);
    const input: CreateTaskInput = {
      paragraphId,
      kind,
      statementMd: statement.trim(),
      options: kind === 'choice' ? optionsClean : null,
      answer: answerValue.trim(),
      solutionMd: solution.trim() ? solution.trim() : null,
      difficulty,
    };
    try {
      await api.createTask(input);
      haptic(12);
      setSaved(true);
      // сброс полей под следующую задачу
      setStatement('');
      setAnswer('');
      setOptions(['', '']);
      setCorrectIdx(0);
      setSolution('');
      setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось сохранить задачу.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title="Новая задача"
      left={
        <IconButton label="Назад" onClick={() => navigate('/tasks')}>
          <Icon.ChevronLeft />
        </IconButton>
      }
    >
      {/* Параграф */}
      <Field label="Параграф">
        <select
          value={paragraphId ?? ''}
          onChange={(e) => setParagraphId(Number(e.target.value))}
          className="w-full rounded-card border-2 border-separator bg-card px-3 py-3 text-body text-label outline-none focus:border-accent"
        >
          {chapters.map((ch) => (
            <optgroup key={ch.id} label={`Глава ${ch.number}. ${ch.title}`}>
              {ch.paragraphs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      {/* Тип */}
      <Field label="Тип">
        <SegmentedControl
          segments={[
            { value: 'input', label: 'Ввод ответа' },
            { value: 'choice', label: 'Варианты' },
          ]}
          value={kind}
          onChange={setKind}
        />
      </Field>

      {/* Условие + предпросмотр */}
      <Field label="Условие (markdown + $LaTeX$)">
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder={'Найдите $f\'(x)$, если $f(x)=x^2$'}
          spellCheck={false}
          className="min-h-[90px] w-full resize-y rounded-card border-2 border-separator bg-card p-3 font-mono text-subhead text-label outline-none focus:border-accent"
        />
        {statement.trim() && (
          <div className="mt-2 rounded-card bg-elevated p-3">
            <PreviewLabel />
            <Markdown content={statement} />
          </div>
        )}
      </Field>

      {/* Ответ / варианты */}
      {kind === 'input' ? (
        <Field label="Правильный ответ">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Например: 2x"
            className="w-full rounded-card border-2 border-separator bg-card px-3 py-3 text-body text-label outline-none focus:border-accent"
          />
        </Field>
      ) : (
        <Field label="Варианты (отметь правильный)">
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Отметить правильным"
                  onClick={() => setCorrectIdx(i)}
                  className={cn(
                    'h-6 w-6 shrink-0 rounded-full border-2',
                    correctIdx === i ? 'border-success bg-success' : 'border-label-tertiary',
                  )}
                />
                <input
                  value={opt}
                  onChange={(e) =>
                    setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))
                  }
                  placeholder={`Вариант ${i + 1}`}
                  className="w-full rounded-card border-2 border-separator bg-card px-3 py-2 text-body text-label outline-none focus:border-accent"
                />
                {options.length > 2 && (
                  <IconButton
                    label="Убрать вариант"
                    onClick={() => {
                      setOptions((prev) => prev.filter((_, j) => j !== i));
                      setCorrectIdx((c) => (c >= i && c > 0 ? c - 1 : c));
                    }}
                  >
                    <Icon.XMark />
                  </IconButton>
                )}
              </div>
            ))}
            <Button variant="tinted" onClick={() => setOptions((prev) => [...prev, ''])}>
              Добавить вариант
            </Button>
          </div>
        </Field>
      )}

      {/* Разбор */}
      <Field label="Разбор (необязательно)">
        <textarea
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder={'$f\'(x)=2x$ по правилу степени.'}
          spellCheck={false}
          className="min-h-[70px] w-full resize-y rounded-card border-2 border-separator bg-card p-3 font-mono text-subhead text-label outline-none focus:border-accent"
        />
        {solution.trim() && (
          <div className="mt-2 rounded-card bg-elevated p-3">
            <PreviewLabel />
            <Markdown content={solution} />
          </div>
        )}
      </Field>

      {/* Сложность */}
      <Field label="Сложность">
        <SegmentedControl
          segments={[
            { value: '1', label: 'Лёгкая' },
            { value: '2', label: 'Средняя' },
            { value: '3', label: 'Сложная' },
          ]}
          value={String(difficulty)}
          onChange={(v) => setDifficulty(Number(v) as Difficulty)}
        />
      </Field>

      {error && <p className="text-subhead text-error">{error}</p>}
      {saved && (
        <p className="flex items-center gap-1 text-subhead text-success">
          <Icon.Check className="h-4 w-4" /> Задача добавлена
        </p>
      )}

      <Button variant="filled" fullWidth onClick={submit} disabled={!valid || saving}>
        Сохранить задачу
      </Button>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-1 pb-1.5 text-footnote uppercase tracking-wide text-label-secondary">
        {label}
      </div>
      {children}
    </div>
  );
}

function PreviewLabel() {
  return (
    <div className="pb-1 text-footnote uppercase tracking-wide text-label-secondary">
      Предпросмотр
    </div>
  );
}
