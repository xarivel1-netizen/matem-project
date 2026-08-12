import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { usePress } from '../../hooks/usePress';
import { cn } from '../../lib/cn';
import { haptic } from '../../lib/haptic';

export interface TabItem {
  to: string;
  label: string;
  icon: ReactNode;
}

interface TabBarProps {
  items: TabItem[];
}

/** Нижний таб-бар со стеклянным фоном; контент скроллится под ним. */
export function TabBar({ items }: TabBarProps) {
  const press = usePress();
  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-30 flex items-stretch bg-navbar backdrop-blur-xl"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-separator" />
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => haptic()}
          className="flex flex-1 justify-center"
        >
          {({ isActive }) => (
            <motion.span
              whileTap={press.whileTap}
              transition={press.transition}
              className={cn(
                'flex min-h-[49px] select-none flex-col items-center justify-center gap-0.5 pt-1.5',
                isActive ? 'text-accent' : 'text-label-secondary',
              )}
            >
              <span className="[&>svg]:h-6 [&>svg]:w-6">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </motion.span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
