import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../shared/components/ui/utils';
import type { UseStreakResult } from '../lib/useStreak';
import { STREAK_THEME } from '../lib/streakTheme';

const RING_SIZE = 176;
const STROKE = 12;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The module's centerpiece: current streak inside a ring that fills toward the
 * next milestone. Tone follows status — a steady flame when today is logged, a
 * pulsing amber warning when the streak is at risk, a cooled ember at rest.
 */
export const StreakHero: React.FC<{ streak: UseStreakResult }> = ({ streak }) => {
  const theme = STREAK_THEME[streak.status];
  const StatusIcon = theme.icon;
  // Accumulated progress toward the next milestone — so a fresh milestone (e.g.
  // day 7) still shows a satisfying, filled arc rather than an empty ring. Past
  // the final milestone the ring is full.
  const ringProgress = streak.nextMilestone
    ? Math.min(1, streak.current / streak.nextMilestone.days)
    : 1;
  const ringOffset = CIRCUMFERENCE * (1 - ringProgress);

  const caption =
    streak.nextMilestone && streak.daysToNextMilestone > 0
      ? `${streak.daysToNextMilestone} to ${streak.nextMilestone.label}`
      : streak.current > 0
        ? 'Every milestone cleared'
        : 'Log today to begin';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      {/* soft themed wash, kept subtle so the card stays minimal */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full blur-3xl opacity-60', theme.softBg)}
      />
      <div
        aria-hidden
        className={cn('pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full blur-3xl opacity-40', theme.softBg)}
      />

      <div className="relative flex flex-col items-center">
        <div className="relative" style={{ height: RING_SIZE, width: RING_SIZE }}>
          {/* halo — breathes gently while the streak is alive */}
          {streak.status !== 'inactive' && (
            <motion.div
              aria-hidden
              className={cn('absolute inset-0 m-auto rounded-full', theme.softBg)}
              style={{ height: RING_SIZE - 8, width: RING_SIZE - 8 }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: streak.status === 'at-risk' ? 1.6 : 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <svg width={RING_SIZE} height={RING_SIZE} className="relative -rotate-90" aria-hidden>
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              className="stroke-muted"
              strokeWidth={STROKE}
            />
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#streakHeroRing)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
            />
            <defs>
              <linearGradient id="streakHeroRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.ringFrom} />
                <stop offset="100%" stopColor={theme.ringTo} />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={streak.status === 'inactive' ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className={cn('mb-1 flex h-9 w-9 items-center justify-center rounded-full', theme.softBg, theme.accentText)}
            >
              <StatusIcon size={20} strokeWidth={2.25} />
            </motion.div>
            <motion.span
              key={streak.current}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="text-5xl font-extrabold leading-none tracking-tight tabular-nums text-foreground"
            >
              {streak.current}
            </motion.span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Day streak
            </span>
          </div>
        </div>

        {/* status pill */}
        <div
          className={cn(
            'mt-4 flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold',
            theme.softBorder,
            theme.softBg,
            theme.accentText,
          )}
        >
          <StatusIcon size={12} strokeWidth={2.5} />
          <span>{theme.label}</span>
          <span aria-hidden className="text-muted-foreground/50">·</span>
          <span className="font-medium text-muted-foreground">{caption}</span>
        </div>
      </div>
    </motion.section>
  );
};
