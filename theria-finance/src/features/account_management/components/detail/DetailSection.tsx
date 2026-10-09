import React from 'react';
import { cn } from '../../../../shared/components/ui/utils';

interface DetailSectionProps {
  title: string;
  subtitle?: string;
  /** Sits at the header's right edge — a toggle or a small control. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * One titled card on the account details page. Same surface recipe as the
 * analysis ChartCard, so the page reads as part of the same family.
 */
export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}) => (
  <section
    className={cn(
      'overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/15 shadow-sm',
      className,
    )}
  >
    <header className="flex items-center justify-between gap-3 border-b border-border/40 px-4 pb-3 pt-3.5">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
    <div className={cn('p-3 sm:p-4', bodyClassName)}>{children}</div>
  </section>
);
