import type { ParagraphDetail } from '@matem/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { Markdown } from '../components/Markdown';
import { Button, Icon, IconButton, Screen, SegmentedControl } from '../components/ui';
import { useTheoryStore } from '../store/useTheoryStore';

type Mode = 'read' | 'edit';
type SaveState = 'idle' | 'saving' | 'saved';

const SAVE_DEBOUNCE_MS = 800;

export function ParagraphScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const id = Number(params.paragraphId);
  const setTheoryLocal = useTheoryStore((s) => s.setTheoryLocal);

  const [detail, setDetail] = useState<ParagraphDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('read');
  const [md, setMd] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const lastSaved = useRef('');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const savedFlash = useRef<ReturnType<typeof setTimeout>>();

  // загрузка параграфа
  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let alive = true;
    api
      .getParagraph(id)
      .then((d) => {
        if (!alive) return;
        setDetail(d);
        setMd(d.theoryMd ?? '');
        lastSaved.current = d.theoryMd ?? '';
      })
      .catch((e) => alive && setLoadError(e instanceof ApiError ? e.message : 'Ошибка загрузки.'));
    return () => {
      alive = false;
    };
  }, [id]);

  // автосохранение с дебаунсом 800мс
  useEffect(() => {
    if (!detail) return;
    if (md === lastSaved.current) return; // нет изменений — не сохраняем
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        await api.updateTheory(id, md);
        lastSaved.current = md;
        setTheoryLocal(id, md);
        setSaveState('saved');
        clearTimeout(savedFlash.current);
        savedFlash.current = setTimeout(() => setSaveState('idle'), 1600);
      } catch {
        setSaveState('idle');
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimer.current);
  }, [md, detail, id, setTheoryLocal]);

  const back = (
    <IconButton label="Назад" onClick={() => navigate(-1)}>
      <Icon.ChevronLeft />
    </IconButton>
  );

  const title = detail?.title ?? 'Параграф';
  const isEmpty = md.trim().length === 0;

  return (
    <Screen title={title} left={back}>
      {loadError && <p className="text-subhead text-error">{loadError}</p>}

      {detail && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="w-44">
              <SegmentedControl
                segments={[
                  { value: 'read', label: 'Читать' },
                  { value: 'edit', label: 'Править' },
                ]}
                value={mode}
                onChange={setMode}
              />
            </div>
            <SaveIndicator state={saveState} />
          </div>

          {mode === 'read' &&
            (isEmpty ? (
              <EmptyTheory onWrite={() => setMode('edit')} />
            ) : (
              <div className="rounded-card bg-card p-4 shadow-ios-card">
                <Markdown content={md} />
              </div>
            ))}

          {mode === 'edit' && (
            <div className="space-y-4">
              <textarea
                value={md}
                onChange={(e) => setMd(e.target.value)}
                placeholder={'Пиши конспект. Формулы: инлайн $f(x)=x^2$ и блочно $$...$$'}
                spellCheck={false}
                className="min-h-[200px] w-full resize-y rounded-card bg-card p-4 font-mono text-subhead text-label shadow-ios-card outline-none placeholder:text-label-tertiary"
              />
              <div>
                <div className="px-1 pb-1.5 text-footnote uppercase tracking-wide text-label-secondary">
                  Предпросмотр
                </div>
                <div className="rounded-card bg-card p-4 shadow-ios-card">
                  {isEmpty ? (
                    <p className="text-subhead text-label-tertiary">Здесь появится предпросмотр.</p>
                  ) : (
                    <Markdown content={md} />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Screen>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  return (
    <AnimatePresence mode="wait">
      {state !== 'idle' && (
        <motion.span
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1 text-footnote text-label-secondary"
        >
          {state === 'saving' ? (
            'Сохраняю…'
          ) : (
            <>
              <Icon.Check className="h-3.5 w-3.5 text-success" />
              Сохранено
            </>
          )}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function EmptyTheory({ onWrite }: { onWrite: () => void }) {
  return (
    <div className="rounded-card bg-card p-6 text-center shadow-ios-card">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon.PencilSquare />
      </div>
      <p className="text-headline text-label">Здесь пока пусто</p>
      <p className="mx-auto mt-1 max-w-xs text-subhead text-label-secondary">
        Напиши свой конспект по этому параграфу — формулы, определения, примеры. Это станет твоей
        шпаргалкой.
      </p>
      <div className="mt-4 flex justify-center">
        <Button variant="filled" onClick={onWrite}>
          Написать конспект
        </Button>
      </div>
    </div>
  );
}
