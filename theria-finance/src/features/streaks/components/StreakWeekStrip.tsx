import React from 'react';
import { motion } from 'motion/react';
import { Check, Snowflake } from '@/shared/icons';
import { cn } from '../../../shared/components/ui/utils';
import type { UseStreakResult } from '../lib/useStreak';
import { STREAK_ACCENT } from '../lib/streakTheme';

/**
 * This week at a glance — seven Mon→Sun nodes, the way habit apps frame the
 * "don't break the chain" week. Logged days fill in, frozen days wear a shield,
 * today gets a ring, future days stay ghosted.
 */
export const StreakWeekStrip: React.FC<{ streak: UseStreakResult }> = ({ streak }) => {
  const loggedThisWeek = streak.week.filter((d) => d.active).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">This week</h3>
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
          {loggedThisWeek}/7 days
        </span>
      </div>

      <div className="flex items-stretch justify-between gap-1">
        {streak.week.map((day, i) => {
          const fill = day.active || day.frozen;
          return (
            <div key={day.key} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase',
                  day.isToday ? STREAK_ACCENT.text : 'text-muted-foreground/70',
                )}
              >
                {day.label}
              </span>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: day.isFuture ? 0.5 : 1 }}
                transition={{ delay: 0.03 * i, type: 'spring', stiffness: 300, damping: 20 }}
                title={new Date(day.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
                className={cn(
                  'flex aspect-square w-full max-w-9 items-center justify-center rounded-xl border transition-colors',
                  day.frozen
                    ? 'border-sky-400/40 bg-sky-400/15 text-sky-500'
                    : day.active
                      ? cn('border-transparent text-white shadow-sm', STREAK_ACCENT.solid)
                      : 'border-dashed border-border bg-muted/40 text-muted-foreground/50',
                  day.isToday && !fill && cn('border-solid', STREAK_ACCENT.softBorder),
                  day.isToday && 'ring-2 ring-offset-2 ring-offset-card',
                  day.isToday && (fill ? 'ring-current' : 'ring-border'),
                )}
              >
                {day.frozen ? (
                  <Snowflake size={13} strokeWidth={2.5} />
                ) : day.active ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span className="text-[10px] font-semibold tabular-nums">
                    {new Date(day.date).getUTCDate()}
                  </span>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
