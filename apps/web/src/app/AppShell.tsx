import { AnimatePresence, motion } from 'framer-motion';
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

export function AppShell() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  // Push-навигация из DESIGN.md: новый экран въезжает справа, старый уходит влево.
  const variants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '-25%', opacity: 0.5 } };

  return (
    // Телефон: полный экран + нижний таб-бар. ПК: боковое меню + контент на всю ширину.
    <div className="flex h-dvh w-full bg-screen">
      <Sidebar items={TABS} />
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          className="absolute inset-0"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={springs.screen}
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
