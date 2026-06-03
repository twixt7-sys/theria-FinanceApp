import React, { useEffect } from 'react';
import { Minimize2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

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
  const Icon = enabled ? Minimize2 : Sparkles;

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
            className="relative w-full max-w-[17rem] overflow-hidden rounded-2xl border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`absolute inset-0 ${
                enabled
                  ? 'bg-gradient-to-br from-emerald-500 via-primary to-teal-600'
                  : 'bg-gradient-to-br from-violet-600 via-primary to-emerald-600'
              }`}
            />
            <motion.div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1.1, 0.95, 1.1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative px-5 pb-4 pt-5 text-white">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/30"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.35, 1.5], opacity: [0.5, 0.2, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm"
                    initial={{ rotate: -8, scale: 0.7 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.05 }}
                  >
                    <Icon size={26} strokeWidth={2} />
                  </motion.div>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.25 }}
                className="text-center text-[15px] font-semibold tracking-tight"
              >
                {enabled ? 'Simple mode on' : 'Full experience'}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.25 }}
                className="mt-1.5 text-center text-[11px] leading-relaxed text-white/80"
              >
                {enabled
                  ? 'Essentials only: balance, in & out, at a glance.'
                  : 'Charts, breakdowns, and richer navigation are back.'}
              </motion.p>

              <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full origin-left rounded-full bg-white/90"
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
