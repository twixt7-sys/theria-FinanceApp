import React, { useEffect, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSimpleMode } from '../../core/state/SimpleModeContext';
import { dismissHint, isHintDismissed } from '../../core/lib/simpleModeHintStorage';
import { FEATURE_COLORS } from '../lib/featureColors';
import {
  SIMPLE_MODE_HINTS,
  SIMPLE_MODE_HINT_FEATURE,
  type SimpleModePage,
} from '../lib/simpleModeHints';
import { cn } from './ui/utils';

interface SimpleModeHintProps {
  page: SimpleModePage;
  className?: string;
}

/** Hints auto-close after this long; only the X dismisses them permanently. */
const AUTO_CLOSE_MS = 15000;

export const SimpleModeHint: React.FC<SimpleModeHintProps> = ({ page, className = '' }) => {
  const { simpleMode, hintsResetKey } = useSimpleMode();
  const [dismissed, setDismissed] = useState(() => isHintDismissed(page));
  const [autoClosed, setAutoClosed] = useState(false);

  useEffect(() => {
    if (simpleMode) {
      setDismissed(isHintDismissed(page));
      setAutoClosed(false);
    }
  }, [simpleMode, hintsResetKey, page]);

  const hint = SIMPLE_MODE_HINTS[page];
  const colors = FEATURE_COLORS[SIMPLE_MODE_HINT_FEATURE[page]];
  const showHint = simpleMode && !dismissed && !autoClosed;

  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(() => setAutoClosed(true), AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [showHint, hintsResetKey]);

  const handleDismiss = () => {
    dismissHint(page);
    setDismissed(true);
  };

  return (
    <AnimatePresence initial={false} mode="sync">
      {showHint && (
        <motion.div
          key={`${page}-${hintsResetKey}`}
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`overflow-hidden ${className}`}
        >
          <div
            className={cn(
              'relative rounded-xl border px-3.5 py-3',
              colors.hintBorder,
              colors.hintBg,
            )}
            role="note"
          >
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dismiss instructions"
            >
              <X size={14} strokeWidth={2.25} />
            </button>
            <div className="flex gap-2.5 pr-7">
              <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.06, duration: 0.2 }}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  colors.iconBg,
                  colors.iconText,
                )}
              >
                <Lightbulb size={15} />
              </motion.span>
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08, duration: 0.22 }}
                className="min-w-0"
              >
                <p className="text-xs font-semibold text-foreground">{hint.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{hint.body}</p>
                {hint.tip && (
                  <p className={cn('mt-2 text-[10px] font-medium', colors.hintTip)}>
                    {hint.tip}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Auto-close countdown */}
            <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-border/60">
              <motion.div
                key={`hint-timer-${page}-${hintsResetKey}`}
                className="h-full origin-left rounded-full"
                style={{ backgroundColor: colors.accent }}
                // keyframes so the drain runs even inside AnimatePresence initial={false}
                animate={{ scaleX: [1, 0] }}
                transition={{ duration: AUTO_CLOSE_MS / 1000, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
