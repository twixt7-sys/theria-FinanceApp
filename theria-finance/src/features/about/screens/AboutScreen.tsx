import React from 'react';
import { BookOpen, Code2, Hammer, Heart, Map, Sparkles, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { BRAND_SLOGAN, TheriaBrandLogo } from '../../../shared/components/TheriaBrandLogo';
import { FinanceBuddy } from '../../../shared/components/FinanceBuddy';

const TEASER_ITEMS = [
  { label: 'Our story', icon: BookOpen },
  { label: 'The team', icon: Users },
  { label: 'Roadmap', icon: Map },
  { label: 'Open source', icon: Code2 },
] as const;

const TERRY_LINES = [
  "This is the app I live in! We're building it brick by brick.",
  'Theria Finance is all about knowing your money and moving with purpose.',
  "Soon this page will share the story, the team, and where we're headed.",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export const AboutScreen: React.FC = () => {
  return (
    <div className="mx-auto max-w-lg space-y-4 pb-10">
      {/* Hero — same language as the dashboard balance widget */}
      <motion.div
        {...fadeUp()}
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-slate-100 p-6 shadow-sm dark:bg-slate-800/60 sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl"
        />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.08 }}
            className="mb-4"
          >
            <TheriaBrandLogo
              size="md"
              className="h-16 w-16 rounded-[1.25rem] sm:h-[4.5rem] sm:w-[4.5rem] sm:rounded-[1.35rem]"
            />
          </motion.div>

          <motion.div {...fadeUp(0.12)} className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              About
            </p>
            <h1 className="text-3xl font-bold leading-none tracking-[-0.03em] text-foreground sm:text-4xl">
              Theria
            </h1>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary sm:text-base">
              Finance
            </p>
          </motion.div>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground"
          >
            {BRAND_SLOGAN}
          </motion.p>

          <motion.div
            {...fadeUp(0.28)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-3.5 py-1.5 text-[11px] font-medium text-foreground shadow-sm"
          >
            <motion.span
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <Hammer size={11} strokeWidth={2.25} aria-hidden />
            </motion.span>
            <span>In development</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/80 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Terry has thoughts about his home */}
      <motion.div {...fadeUp(0.16)}>
        <FinanceBuddy lines={TERRY_LINES} mood="happy" />
      </motion.div>

      <motion.div
        {...fadeUp(0.22)}
        className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={18} strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 text-left">
            <h2 className="text-sm font-semibold text-foreground">
              Something special is on the way
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This page will soon share the story behind Theria Finance, the people building it,
              and where the project is headed.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.28)} className="grid grid-cols-2 gap-2.5">
        {TEASER_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.34 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5 rounded-full border border-border bg-card p-2 pr-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                <Icon size={16} strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-xs font-semibold tracking-tight text-foreground">
                  {item.label}
                </p>
                <span className="inline-flex w-fit rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  Soon
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.p
        {...fadeUp(0.4)}
        className="flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground"
      >
        <Heart size={11} className="shrink-0 text-pink-500/80" fill="currentColor" aria-hidden />
        <span>Version 1.0 · Theria Finance App</span>
      </motion.p>
    </div>
  );
};
