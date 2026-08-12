import type { AttemptResult, TaskPublic } from '@matem/shared';
import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Markdown } from '../components/Markdown';
import { Button, Icon, IconButton, Screen } from '../components/ui';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { cn } from '../lib/cn';
import { haptic } from '../lib/haptic';
import { springs } from '../lib/springs';
import { useSessionStore } from '../store/useSessionStore';

export function SolveScreen() {
  const navigate = useNavigate();
  const { tasks, index, title, record, advance } = useSessionStore();
  const current = tasks[index];

  // защита от прямого захода без сессии
  useEffect(() => {
    if (tasks.length === 0) navigate('/tasks', { replace: true });
  }, [tasks.length, navigate]);

  if (!current) return <Screen title="Задачи" left={<Back />} children={null} />;

  return (
    <Screen title={`${index + 1} / ${tasks.length}`} left={<Back />}>
      <TaskRunner
        key={current.id}
        task={current}
        isLast={index === tasks.length - 1}
        onDone={(r) => {
          record({
            task: current,
            given: r.given,
            isCorrect: r.isCorrect,
            correctAnswer: r.correctAnswer,
            solutionMd: r.solutionMd,
          });
          if (index === tasks.length - 1) navigate('/tasks/summary');
          else advance();
        }}
        sessionTitle={title}
      />
    </Screen>
  );
}

function Back() {
  const navigate = useNavigate();
  return (
    <IconButton label="Назад" onClick={() => navigate('/tasks')}>
      <Icon.ChevronLeft />
    </IconButton>
  );
}

interface DoneArgs {
  given: string;
  isCorrect: boolean;
  correctAnswer?: string;
  solutionMd?: string | null;
}

function TaskRunner({
  task,
  isLast,
  onDone,
  sessionTitle,
}: {
  task: TaskPublic;
  isLast: boolean;
  onDone: (r: DoneArgs) => void;
  sessionTitle: string;
}) {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();
  const [given, setGiven] = useState('');
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const answered = result !== null;

  async function check() {
    if (!given.trim() || submitting) return;
    setSubmitting(true);
    try {
      const r = await api.submitAttempt(task.id, given.trim());
      setResult(r);
      if (r.isCorrect) {
        haptic(12);
        if (!reduced) void controls.start({ scale: [1, 1.015, 1], transition: { duration: 0.3 } });
      } else {
        haptic(30);
        // короткий горизонтальный shake
        if (!reduced)
          void controls.start({
            x: [0, -12, 10, -8, 6, -3, 0],
            transition: { duration: 0.45, ...springs.press },
          });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const borderClass = !answered
    ? 'border-separator'
    : result!.isCorrect
      ? 'border-success'
      : 'border-error';

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { x: '100%' }}
      animate={reduced ? { opacity: 1 } : { x: 0 }}
      transition={springs.screen}
      className="space-y-4"
    >
      {/* Карточка условия + вспышка обводки */}
      <motion.div
        animate={controls}
        className={cn('rounded-card border-2 bg-card p-4 shadow-ios-card transition-colors', borderClass)}
      >
        <Markdown content={task.statementMd} />
      </motion.div>

      {/* Ввод или варианты */}
      {task.kind === 'input' && (
        <input
          value={given}
          onChange={(e) => setGiven(e.target.value)}
          disabled={answered}
          inputMode="text"
          placeholder="Твой ответ"
          onKeyDown={(e) => e.key === 'Enter' && check()}
          className="w-full rounded-card border-2 border-separator bg-card px-4 py-3 text-body text-label outline-none focus:border-accent disabled:opacity-60"
        />
      )}

      {task.kind === 'choice' && task.options && (
        <div className="space-y-2">
          {task.options.map((opt) => {
            const selected = given === opt;
            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => setGiven(opt)}
                className={cn(
                  'flex min-h-[44px] w-full items-center rounded-card border-2 bg-card px-4 py-2.5 text-left text-body',
                  selected ? 'border-accent text-label' : 'border-separator text-label',
                  answered && 'opacity-70',
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Результат */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.press}
          className="space-y-2"
        >
          {result!.isCorrect ? (
            <div className="flex items-center gap-2 text-headline text-success">
              <Icon.Check className="h-5 w-5" /> Верно
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-headline text-error">
                <Icon.XMark className="h-5 w-5" /> Неверно
              </div>
              {result!.correctAnswer && (
                <p className="text-body text-label">
                  Правильный ответ: <span className="font-semibold">{result!.correctAnswer}</span>
                </p>
              )}
              {result!.solutionMd && (
                <div className="rounded-card bg-elevated p-3">
                  <div className="pb-1 text-footnote uppercase tracking-wide text-label-secondary">
                    Разбор
                  </div>
                  <Markdown content={result!.solutionMd} />
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Кнопка */}
      {!answered ? (
        <Button variant="filled" fullWidth onClick={check} disabled={!given.trim() || submitting}>
          Проверить
        </Button>
      ) : (
        <Button
          variant="filled"
          fullWidth
          onClick={() =>
            onDone({
              given,
              isCorrect: result!.isCorrect,
              correctAnswer: result!.correctAnswer,
              solutionMd: result!.solutionMd,
            })
          }
        >
          {isLast ? 'Показать итоги' : 'Дальше'}
        </Button>
      )}

      <p className="text-center text-footnote text-label-tertiary">{sessionTitle}</p>
    </motion.div>
  );
}
