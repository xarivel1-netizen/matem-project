import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { usePress } from '../../hooks/usePress';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptic';
import type { TabItem } from './TabBar';

interface SidebarProps {
  items: TabItem[];
}

/** Боковая навигация для десктопа (на мобиле скрыта — там нижний таб-бар). */
export function Sidebar({ items }: SidebarProps) {
  const press = usePress();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-separator bg-card md:flex">
      <div className="px-5 pb-5 pt-7">
        <div className="text-title2 text-label">Алгебра 10</div>
        <div className="text-subhead text-label-secondary">Мерзляк · 30 дней</div>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={() => haptic()} className="block">
            {({ isActive }) => (
              <motion.span
                whileTap={press.whileTap}
                whileHover={press.whileHover}
                transition={press.transition}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-body',
                  isActive
                    ? 'bg-accent-soft font-medium text-accent'
                    : 'text-label hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                )}
              >
                <span className="[&>svg]:h-[22px] [&>svg]:w-[22px]">{item.icon}</span>
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
