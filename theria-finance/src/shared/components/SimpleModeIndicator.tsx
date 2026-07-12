import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BuddyFace } from './FinanceBuddy';

const DISPLAY_MS = 2400;

export interface SimpleModeIndicatorPayload {
  enabled: boolean;
  key: number;
}

interface SimpleModeIndicatorProps {
  indicator: SimpleModeIndicatorPayload | null;
  onDismiss: () => void;
}

export const SimpleModeIndicator: React.FC<SimpleModeIndicatorProps> = ({
  indicator,
  onDismiss,
}) => {
  useEffect(() => {
    if (!indicator) return;
    const timer = window.setTimeout(onDismiss, DISPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [indicator, onDismiss]);

  const enabled = indicator?.enabled ?? false;

  return (
    <AnimatePresence mode="wait">
      {indicator && (
        <motion.div
          key={indicator.key}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          aria-live="polite"
          role="status"
        >
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-black/25 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.85 }}
            className="relative w-full max-w-[17rem] overflow-hidden rounded-3xl border border-border/50 bg-slate-100 shadow-2xl dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-14 -right-10 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl"
            />

            <div className="relative px-5 pb-4 pt-5">
              {/* Terry tumbles in, then settles into his idle bob */}
              <div className="mb-3 flex flex-col items-center">
                <motion.div
                  initial={{ y: 48, scale: 0.5, rotate: -14, opacity: 0 }}
                  animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 15, delay: 0.05 }}
                  className="h-20 w-20"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    className="h-full w-full"
                  >
                    <BuddyFace mood={enabled ? 'happy' : 'neutral'} />
                  </motion.div>
                </motion.div>
                <motion.div
                  aria-hidden
                  initial={{ opacity: 0, scaleX: 0.5 }}
                  animate={{ opacity: 0.4, scaleX: [1, 0.78, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  className="mt-1 h-1.5 w-12 rounded-full bg-foreground/20 blur-[1px]"
                />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.25 }}
                className="text-center text-[9px] font-bold uppercase tracking-widest text-primary"
              >
                Terry · Your money buddy
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.25 }}
                className="mt-1 text-center text-[15px] font-semibold tracking-tight text-foreground"
              >
                {enabled ? 'Simple mode on' : 'Full experience'}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.25 }}
                className="mt-1 text-center text-[11px] leading-relaxed text-muted-foreground"
              >
                {enabled
                  ? "Essentials only — I'll keep things nice and easy."
                  : 'Charts, breakdowns, and richer navigation are back.'}
              </motion.p>

              <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full origin-left rounded-full bg-primary"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: DISPLAY_MS / 1000, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
