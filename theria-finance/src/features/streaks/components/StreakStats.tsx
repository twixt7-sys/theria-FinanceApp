import React from 'react';
import { motion } from 'motion/react';
import { Trophy, CalendarCheck, Snowflake } from '@/shared/icons';
import { cn } from '../../../shared/components/ui/utils';
import type { UseStreakResult } from '../lib/useStreak';

/** Three at-a-glance tallies: best run, lifetime active days, banked freezes. */
export const StreakStats: React.FC<{ streak: UseStreakResult }> = ({ streak }) => {
  const stats = [
    {
      icon: Trophy,
      label: 'Longest',
      value: String(streak.longest),
      sub: streak.longest === 1 ? 'day' : 'days',
      accent: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: CalendarCheck,
      label: 'Days logged',
      value: String(streak.totalDaysLogged),
      sub: 'lifetime',
      accent: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Snowflake,
      label: 'Freezes',
      value: `${streak.freezesRemaining}/${streak.freezesMax}`,
      sub: 'banked',
      accent: 'text-sky-500',
      bg: 'bg-sky-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * index, duration: 0.25 }}
            className="flex flex-col items-center rounded-2xl border border-border bg-card p-3 text-center shadow-sm"
          >
            <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', stat.bg)}>
              <Icon size={16} className={stat.accent} />
            </div>
            <p className="text-lg font-bold leading-none tabular-nums text-foreground">{stat.value}</p>
            <p className="mt-1 text-[10px] font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-[9px] text-muted-foreground/80">{stat.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
};
