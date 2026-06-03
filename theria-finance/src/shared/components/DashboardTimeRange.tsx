import React from 'react';
import { Calendar } from 'lucide-react';
import type { TimeFilterValue } from './TimeFilter';
import { formatTimeRangeDisplay, getTimeFilterLabel } from '../lib/timeRangeDisplay';
import { cn } from './ui/utils';

interface DashboardTimeRangeProps {
  timeFilter: TimeFilterValue;
  currentDate: Date;
  className?: string;
  action?: React.ReactNode;
  onChangeClick?: () => void;
}

export const DashboardTimeRange: React.FC<DashboardTimeRangeProps> = ({
  timeFilter,
  currentDate,
  className,
  action,
  onChangeClick,
}) => (
  <div
    className={cn(
      'flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/70 px-3.5 py-2.5 shadow-sm backdrop-blur-sm',
      className,
    )}
    aria-label={`Showing data for ${getTimeFilterLabel(timeFilter)}: ${formatTimeRangeDisplay(timeFilter, currentDate)}`}
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Calendar size={15} strokeWidth={2} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {getTimeFilterLabel(timeFilter)}
      </p>
      <p className="truncate text-[13px] font-semibold text-foreground tabular-nums">
        {formatTimeRangeDisplay(timeFilter, currentDate)}
      </p>
    </div>
    {onChangeClick && (
      <button
        type="button"
        onClick={onChangeClick}
        className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors bg-primary/10 hover:bg-primary/15"
      >
        Change
      </button>
    )}
    {action}
  </div>
);
