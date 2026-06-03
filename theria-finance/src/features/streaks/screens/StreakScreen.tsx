import React, { useMemo } from 'react';
import { Flame, Trophy, Calendar, Target, TrendingUp, Award, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';

const RING_SIZE = 168;
const STROKE = 11;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const StreakScreen: React.FC = () => {
  const currentStreak = 7;
  const longestStreak = 15;
  const totalDays = 42;
  const monthlyGoal = 20;
  const monthlyProgress = 12;

  const ringProgress = Math.min(currentStreak / monthlyGoal, 1);
  const ringOffset = CIRCUMFERENCE * (1 - ringProgress);
  const monthlyPercent = Math.round((monthlyProgress / monthlyGoal) * 100);

  const activeDaySet = useMemo(() => {
    const set = new Set<number>();
    for (let d = 0; d < currentStreak; d++) {
      set.add(29 - d);
    }
    set.add(22);
    set.add(18);
    set.add(11);
    return set;
  }, [currentStreak]);

  const stats = [
    {
      icon: Trophy,
      label: 'Longest',
      value: String(longestStreak),
      sub: 'days',
      accent: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Calendar,
      label: 'Total Days',
      value: String(totalDays),
      sub: 'tracked',
      accent: 'text-sky-500',
      bg: 'bg-sky-500/10',
    },
    {
      icon: Target,
      label: 'Monthly Goal',
      value: `${monthlyProgress}/${monthlyGoal}`,
      sub: 'days',
      accent: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-4 pb-6 max-w-4xl mx-auto">
      <SimpleModeHint page="streak" />
      {/* Hero — streak inside animated ring */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-600 p-5 text-white shadow-lg shadow-orange-500/25"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative flex flex-col items-center">
          <div className="relative mb-3">
            <motion.div
              className="absolute inset-0 m-auto h-[188px] w-[188px] rounded-full bg-white/10"
              animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              className="relative -rotate-90 drop-shadow-md"
              aria-hidden
            >
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={STROKE}
              />
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="url(#streakRingGradient)"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
              />
              <defs>
                <linearGradient id="streakRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="50%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/30"
              >
                <Flame size={20} className="text-white" fill="currentColor" fillOpacity={0.35} />
              </motion.div>
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 }}
                className="text-4xl font-extrabold leading-none tracking-tight tabular-nums"
              >
                {currentStreak}
              </motion.span>
              <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                Day Streak
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-100" />
            <span>Keep it going — you&apos;re on fire</span>
            <span aria-hidden>🔥</span>
          </div>

          <p className="mt-2 text-center text-[10px] text-white/75">
            {monthlyPercent}% of your {monthlyGoal}-day monthly goal
          </p>
        </div>
      </motion.div>

      {/* Stats — always horizontal */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.25 }}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-3 text-center shadow-sm"
            >
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <Icon size={16} className={stat.accent} />
              </div>
              <p className="text-lg font-bold leading-none tabular-nums text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-[9px] text-muted-foreground/80">{stat.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly progress */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <TrendingUp size={16} className="text-violet-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Monthly Progress</h3>
              <p className="text-[10px] text-muted-foreground">
                {monthlyProgress} of {monthlyGoal} active days
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
            {monthlyPercent}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${monthlyPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <Award size={16} className="text-orange-500" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Last 30 Days</h3>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {currentStreak} day streak active
          </span>
        </div>

        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 30 }, (_, i) => {
            const active = activeDaySet.has(i);
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.02 * i, duration: 0.2 }}
                title={`Day ${i + 1}`}
                className={`flex aspect-square items-center justify-center rounded-md transition-colors ${
                  active
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm shadow-orange-500/30'
                    : 'bg-muted/80'
                }`}
              >
                {active && <Flame size={10} className="text-white" />}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-orange-500" />
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-muted" />
            Missed
          </span>
        </div>
      </div>

      {/* Milestone teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-orange-200/60 bg-gradient-to-r from-orange-500/8 via-amber-500/5 to-transparent p-4 dark:border-orange-800/50"
      >
        <p className="text-center text-sm font-semibold text-orange-800 dark:text-orange-200">
          {monthlyGoal - monthlyProgress} more days to hit your monthly goal
        </p>
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          Consistency builds better money habits — log in tomorrow to extend your streak.
        </p>
      </motion.div>
    </div>
  );
};
