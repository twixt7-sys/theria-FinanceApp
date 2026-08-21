import React from 'react';
import { motion } from 'motion/react';
import { Snowflake, ShieldCheck } from '@/shared/icons';
import type { UseStreakResult } from '../lib/useStreak';

/**
 * The loss-aversion moment. When a streak breaks on a single missed day and the
 * user has a freeze banked, this card offers a one-tap rescue — the mechanic
 * that keeps people coming back in Duolingo, Snapchat and friends. It only
 * appears when there is genuinely something to save.
 */
export const StreakFreezeCard: React.FC<{ streak: UseStreakResult }> = ({ streak }) => {
  if (!streak.repairableDay) return null;

  const missedLabel = new Date(`${streak.repairableDay}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-sky-400/40 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500"
        >
          <Snowflake size={20} strokeWidth={2.25} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">Save your streak</h3>
          <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
            You missed <span className="font-medium text-foreground">{missedLabel}</span>. Spend a
            freeze to patch the gap and keep your run intact.
          </p>

          {streak.canRepair ? (
            <button
              type="button"
              onClick={streak.repairStreak}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 active:scale-[0.98]"
            >
              <ShieldCheck size={14} strokeWidth={2.5} />
              Use a freeze · {streak.freezesRemaining} left
            </button>
          ) : (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
              <Snowflake size={12} strokeWidth={2.5} />
              No freezes left — earn one every 7 days
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
};
