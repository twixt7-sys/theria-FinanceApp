import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../shared/components/ui/utils';
import type { UseStreakResult } from '../lib/useStreak';
import { STREAK_ACCENT } from '../lib/streakTheme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/**
 * A calendar-aligned heatmap of the last five weeks, built straight from logged
 * activity — no placeholders. Filled cells are days with a record, shielded
 * cells were saved by a freeze, today wears a ring.
 */
export const StreakHeatmap: React.FC<{ streak: UseStreakResult }> = ({ streak }) => {
  const activeCount = streak.heatmap.flat().filter((c) => c.active).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Last 5 weeks</h3>
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
          {activeCount} active {activeCount === 1 ? 'day' : 'days'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-center text-[9px] font-semibold uppercase text-muted-foreground/60">
            {d}
          </span>
        ))}

        {streak.heatmap.flat().map((cell, i) => (
          <motion.div
            key={cell.key}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: cell.isFuture ? 0.35 : 1 }}
            transition={{ delay: 0.01 * i, duration: 0.2 }}
            title={new Date(cell.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
            className={cn(
              'aspect-square rounded-md transition-colors',
              cell.frozen
                ? 'bg-sky-400/70'
                : cell.active
                  ? STREAK_ACCENT.solid
                  : cell.isFuture
                    ? 'bg-muted/40'
                    : 'bg-muted',
              cell.isToday && 'ring-2 ring-offset-1 ring-offset-card ring-foreground/40',
            )}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-sm', STREAK_ACCENT.solid)} />
          Logged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-400/70" />
          Frozen
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-muted" />
          Missed
        </span>
      </div>
    </section>
  );
};
