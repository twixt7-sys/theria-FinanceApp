import React from 'react';
import { Hammer, Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { BRAND_SLOGAN, TheriaBrandLogo } from '../../../shared/components/TheriaBrandLogo';

const DOT_PATTERN = {
  backgroundImage:
    'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
  backgroundSize: '24px 24px',
} as const;

const TEASER_ITEMS = ['Our story', 'The team', 'Roadmap', 'Open source'] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export const AboutScreen: React.FC = () => {
  return (
    <div className="mx-auto max-w-lg space-y-5 pb-10">
      <motion.div
        {...fadeUp()}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-emerald-600 via-primary to-teal-700 p-6 text-white shadow-xl shadow-primary/25 sm:p-8"
      >
        <motion.div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-teal-300/20 blur-3xl"
          animate={{ opacity: [0.3, 0.55, 0.3], x: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={DOT_PATTERN} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5" />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.08 }}
            className="relative mb-5"
          >
            <motion.div
              className="absolute -inset-4 rounded-[1.6rem] bg-white/20 blur-2xl"
              animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.04, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <TheriaBrandLogo size="md" className="relative h-16 w-16 rounded-[1.25rem] shadow-lg shadow-black/20 sm:h-[4.5rem] sm:w-[4.5rem] sm:rounded-[1.35rem]" />
          </motion.div>

          <motion.div {...fadeUp(0.12)} className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">About</p>
            <h1 className="text-3xl font-bold leading-none tracking-[-0.03em] sm:text-4xl">Theria</h1>
            <p className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-sm font-semibold uppercase tracking-[0.22em] text-transparent sm:text-base">
              Finance
            </p>
          </motion.div>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-4 max-w-xs text-sm leading-relaxed text-white/85"
          >
            {BRAND_SLOGAN}
          </motion.p>

          <motion.div
            {...fadeUp(0.28)}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm"
          >
            <motion.span
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15"
            >
              <Hammer size={11} strokeWidth={2.25} aria-hidden />
            </motion.span>
            <span>In development</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/80 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
            </span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.18)} className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/8 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={18} strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 text-left">
            <h2 className="text-sm font-semibold text-foreground">Something special is on the way</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This page will soon share the story behind Theria Finance, the people building it, and where the project is headed.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.26)} className="grid grid-cols-2 gap-2.5">
        {TEASER_ITEMS.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-xl border border-dashed border-border/70 bg-muted/20 px-3 py-3.5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <p className="text-xs font-medium text-muted-foreground/90">{item}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/60">Coming soon</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        {...fadeUp(0.38)}
        className="flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground"
      >
        <Heart size={11} className="shrink-0 text-pink-500/80" fill="currentColor" aria-hidden />
        <span>Version 1.0 · Theria Finance App</span>
      </motion.p>
    </div>
  );
};
