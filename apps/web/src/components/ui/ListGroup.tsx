import { Children, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ListGroupProps {
  children: ReactNode;
  header?: string;
  footer?: string;
  className?: string;
}

/**
 * Сгруппированный список iOS: карточка со скруглением 14px, строки внутри без
 * собственных скруглений, между ними inset-разделители (слева 16px).
 */
export function ListGroup({ children, header, footer, className }: ListGroupProps) {
  const rows = Children.toArray(children);
  return (
    <section className={cn('w-full', className)}>
      {header && (
        <div className="px-4 pb-1.5 pt-1 text-footnote uppercase tracking-wide text-label-secondary">
          {header}
        </div>
      )}
      <div className="overflow-hidden rounded-card bg-card shadow-ios-card">
        {rows.map((row, i) => (
          <div key={i}>
            {row}
            {i < rows.length - 1 && <div className="ml-4 h-px bg-separator" />}
          </div>
        ))}
      </div>
      {footer && <div className="px-4 pt-1.5 text-footnote text-label-secondary">{footer}</div>}
    </section>
  );
}
