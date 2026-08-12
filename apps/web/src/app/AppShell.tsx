import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Icon, Sidebar, TabBar, type TabItem } from '../components/ui';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { springs } from '../lib/springs';
import { NewTaskScreen } from '../screens/NewTaskScreen';
import { ParagraphScreen } from '../screens/ParagraphScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SolveScreen } from '../screens/SolveScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { TheoryScreen } from '../screens/TheoryScreen';
import { UiScreen } from '../screens/UiScreen';

const TABS: TabItem[] = [
  { to: '/plan', label: 'План', icon: <Icon.ListBullet /> },
  { to: '/theory', label: 'Теория', icon: <Icon.BookOpen /> },
  { to: '/tasks', label: 'Задачи', icon: <Icon.PencilSquare /> },
  { to: '/progress', label: 'Прогресс', icon: <Icon.ChartBar /> },
];

/** Тип перехода: смена вкладок — кроссфейд; заход/выход вглубь — слайд. */
type NavKind = 'tab' | 'push' | 'pop';

/** Глубина маршрута по числу сегментов: /plan → 1, /theory/5 → 2. */
const depth = (path: string): number => path.split('/').filter(Boolean).length;

// Кроссфейд (вкладки) и слайд (push/pop) в одном наборе. Направление берётся из
// custom (kind), поэтому и уходящий экран анимируется в нужную сторону — «назад»
// уезжает вправо, а не влево. animate общий: приходим в нейтраль.
const variants: Variants = {
  initial: (k: NavKind) =>
    k === 'tab' ? { opacity: 0 } : k === 'pop' ? { x: '-25%', opacity: 0.5 } : { x: '100%' },
  animate: { x: 0, opacity: 1 },
  exit: (k: NavKind) =>
    k === 'tab' ? { opacity: 0 } : k === 'pop' ? { x: '100%' } : { x: '-25%', opacity: 0.5 },
};

export function AppShell() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  // Определяем тип перехода по прошлому и текущему маршруту.
  const prevPath = useRef(location.pathname);
  const from = prevPath.current;
  const to = location.pathname;
  const df = depth(from);
  const dt = depth(to);
  let kind: NavKind;
  if (reduced || (df <= 1 && dt <= 1)) kind = 'tab'; // между вкладками (или reduced-motion) — кроссфейд
  else if (dt > df) kind = 'push'; // вглубь — въезд справа
  else if (dt < df) kind = 'pop'; // назад — уезд вправо
  else kind = 'push'; // одинаковая глубина >1 — как push
  useEffect(() => {
    prevPath.current = location.pathname;
  }, [location.pathname]);

  // Кроссфейд — короткий tween; слайд — пружина из DESIGN.md.
  const transition =
    kind === 'tab' ? { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } : springs.screen;

  return (
    // Телефон: полный экран + нижний таб-бар. ПК: боковое меню + контент на всю ширину.
    <div className="flex h-dvh w-full bg-screen">
      <Sidebar items={TABS} />
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={kind}>
        <motion.div
          key={location.pathname}
          custom={kind}
          // bg-screen — непрозрачный слой: въезжающий экран полностью перекрывает
          //   уходящий, без просвечивания по бокам (было «наслоение»).
          // transform-gpu + willChange — свой композиторный слой: анимация едет на GPU
          //   как дешёвая композиция, а не пере-растеризация тяжёлого дерева каждый кадр.
          className="absolute inset-0 bg-screen transform-gpu"
          style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/plan" replace />} />
            <Route path="/plan" element={<PlanScreen />} />
            <Route path="/theory" element={<TheoryScreen />} />
            <Route path="/theory/:paragraphId" element={<ParagraphScreen />} />
            <Route path="/tasks" element={<TasksScreen />} />
            <Route path="/tasks/new" element={<NewTaskScreen />} />
            <Route path="/tasks/solve" element={<SolveScreen />} />
            <Route path="/tasks/summary" element={<SummaryScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/ui" element={<UiScreen />} />
            <Route path="*" element={<Navigate to="/plan" replace />} />
          </Routes>
        </motion.div>
        </AnimatePresence>

        <div className="md:hidden">
          <TabBar items={TABS} />
        </div>
      </div>
    </div>
  );
}
