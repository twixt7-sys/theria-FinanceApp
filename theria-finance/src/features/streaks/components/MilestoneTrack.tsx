import React from 'react';
import { motion } from 'motion/react';
import { Flame, Lock, Check } from '@/shared/icons';
import { cn } from '../../../shared/components/ui/utils';
import { MILESTONES } from '../lib/streakEngine';
import { STREAK_ACCENT } from '../lib/streakTheme';
import type { UseStreakResult } from '../lib/useStreak';

/**
 * The milestone ladder — a horizontal rail the current streak climbs, rung by
 * rung. Cleared milestones fill in, the next one pulses with the days left, and
 * locked rungs stay ahead as the goal. A different lens on the same run than the
 * hero ring: progress across a journey rather than around a circle.
 */
export const MilestoneTrack: React.FC<{ streak: UseStreakResult }> = ({ streak }) => {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Milestones</h3>
        <span className="text-[11px] font-medium text-muted-foreground">
          {streak.reachedMilestones.length}/{MILESTONES.length} unlocked
        </span>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max items-start">
          {MILESTONES.map((m, i) => {
            const reached = streak.current >= m.days;
            const isNext = !reached && streak.nextMilestone?.days === m.days;
            const prevDays = i === 0 ? 0 : MILESTONES[i - 1].days;
            // Fill of the connector leading INTO this node.
            const segFill =
              i === 0
                ? 1
                : Math.max(0, Math.min(1, (streak.current - prevDays) / (m.days - prevDays)));

            return (
              <div key={m.days} className="flex items-start">
                {i > 0 && (
                  <div className="mt-5 h-1 w-8 overflow-hidden rounded-full bg-muted sm:w-10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${segFill * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 * i }}
                      className={cn('h-full rounded-full', STREAK_ACCENT.solid)}
                    />
                  </div>
                )}

                <div className="flex w-16 flex-col items-center gap-1.5 text-center">
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.06 * i, type: 'spring', stiffness: 280, damping: 20 }}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full border-2',
                      reached
                        ? cn('border-transparent text-white shadow-sm', STREAK_ACCENT.solid)
                        : isNext
                          ? cn('bg-card', STREAK_ACCENT.softBorder, STREAK_ACCENT.text)
                          : 'border-dashed border-border bg-muted/40 text-muted-foreground/50',
                    )}
                  >
                    {reached ? (
                      <Check size={18} strokeWidth={3} />
                    ) : isNext ? (
                      <motion.span
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Flame size={18} strokeWidth={2.25} />
                      </motion.span>
                    ) : (
                      <Lock size={15} strokeWidth={2.25} />
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'text-xs font-bold leading-none tabular-nums',
                      reached || isNext ? 'text-foreground' : 'text-muted-foreground/60',
                    )}
                  >
                    {m.days}
                  </span>
                  <span className="text-[9px] font-medium leading-tight text-muted-foreground/80">
                    {isNext ? `${streak.daysToNextMilestone} to go` : m.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
