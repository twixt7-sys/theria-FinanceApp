import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Hand, X } from 'lucide-react';
import { useTutorial } from '../../core/state/TutorialContext';
import { BuddyFace } from './FinanceBuddy';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;
const BUBBLE_MAX_WIDTH = 340;
const VIEWPORT_MARGIN = 16;

/** Renders Terry's line, turning **double asterisks** into green highlights. */
const renderLine = (line: string) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <span key={i} className="font-semibold text-emerald-600 dark:text-emerald-400">
        {part.slice(2, -2)}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

export const TutorialOverlay: React.FC = () => {
  const { activeTour, stepIndex, currentStep, isFirstStep, isLastStep, next, prev, close, skipAll } =
    useTutorial();

  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  // Interactive steps hand off to a real add-sheet; while the user fills it in
  // the overlay steps aside so the sheet is usable, then resumes on success.
  const [waiting, setWaiting] = useState(false);
  const rafRef = useRef<number | null>(null);

  const target = currentStep?.target;
  const interactive = Boolean(currentStep?.interactive && target);

  // Reset the hand-off state whenever the step changes.
  useEffect(() => {
    setWaiting(false);
  }, [stepIndex, activeTour]);

  // Track the target's rect on a rAF loop so the spotlight stays glued to it.
  useLayoutEffect(() => {
    if (!activeTour || !target || waiting) {
      setRect(null);
      return;
    }

    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });

    const measure = () => {
      const found = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
      if (found) {
        const r = found.getBoundingClientRect();
        setRect((prevRect) => {
          if (
            prevRect &&
            Math.abs(prevRect.top - r.top) < 0.5 &&
            Math.abs(prevRect.left - r.left) < 0.5 &&
            Math.abs(prevRect.width - r.width) < 0.5 &&
            Math.abs(prevRect.height - r.height) < 0.5
          ) {
            return prevRect;
          }
          return { top: r.top, left: r.left, width: r.width, height: r.height };
        });
      } else {
        setRect(null);
      }
      rafRef.current = requestAnimationFrame(measure);
    };
    rafRef.current = requestAnimationFrame(measure);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [activeTour, stepIndex, target, waiting]);

  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // While waiting on a hands-on step, resume once the matching item is added.
  useEffect(() => {
    if (!waiting) return;
    const kind = currentStep?.awaitAdd;
    if (!kind) return;
    const onAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind?: string } | undefined;
      if (detail?.kind === kind) {
        setWaiting(false);
        next();
      }
    };
    window.addEventListener('theria:item-added', onAdded as EventListener);
    return () => window.removeEventListener('theria:item-added', onAdded as EventListener);
  }, [waiting, currentStep, next]);

  // Keyboard: Escape dismisses; arrows step (but never auto-skip a hands-on step).
  useEffect(() => {
    if (!activeTour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (!waiting && !interactive && (e.key === 'ArrowRight' || e.key === 'Enter')) {
        e.preventDefault();
        next();
      } else if (!waiting && e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTour, waiting, interactive, next, prev, close]);

  if (!activeTour || !currentStep) return null;

  // Forward the real click to the spotlighted control (e.g. open the add sheet).
  // The anchor may be a wrapper (the FAB tags a div), so click the button inside.
  const activateInteractive = () => {
    const host = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    const clickable =
      host && host.tagName === 'BUTTON'
        ? host
        : host?.querySelector<HTMLElement>('button') ?? host;
    clickable?.click();
    if (currentStep.awaitAdd) {
      setWaiting(true);
    } else {
      next();
    }
  };

  // Hand-off mode: keep only a tiny, always-on-top control so the add sheet is
  // fully usable underneath. Sits above every modal (z-index caps at 180).
  if (waiting) {
    return (
      <div className="fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[190] flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary/90 px-3 py-1.5 text-white shadow-xl backdrop-blur-sm">
        <Hand size={13} className="shrink-0" />
        <span className="text-[11px] font-medium">Add it and Terry will continue…</span>
        <button
          type="button"
          onClick={skipAll}
          className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold transition-colors hover:bg-white/30"
        >
          Skip
        </button>
      </div>
    );
  }

  const padded: Rect | null = rect
    ? {
        top: rect.top - SPOTLIGHT_PADDING,
        left: rect.left - SPOTLIGHT_PADDING,
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  // Position the bubble via top/bottom anchoring — never a CSS transform, which
  // Framer Motion overwrites with its animated transform (that bug pushed the
  // bottom-nav bubble off-screen so Next couldn't be reached).
  const bubbleWidth = Math.min(BUBBLE_MAX_WIDTH, viewport.width - VIEWPORT_MARGIN * 2);
  let bubbleLeft: number;
  let placeBelow = true;
  const vertical: React.CSSProperties = {};

  if (padded) {
    const spotlightCenterY = padded.top + padded.height / 2;
    placeBelow = spotlightCenterY < viewport.height * 0.5;
    bubbleLeft = padded.left + padded.width / 2 - bubbleWidth / 2;
    bubbleLeft = Math.max(
      VIEWPORT_MARGIN,
      Math.min(bubbleLeft, viewport.width - bubbleWidth - VIEWPORT_MARGIN),
    );
    if (placeBelow) {
      vertical.top = padded.top + padded.height + 16;
    } else {
      vertical.bottom = viewport.height - padded.top + 16;
    }
  } else {
    bubbleLeft = viewport.width / 2 - bubbleWidth / 2;
    vertical.top = Math.round(viewport.height * 0.4);
  }

  const totalSteps = activeTour.steps.length;

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label="Guided tutorial"
    >
      {/* Spotlight cutout — one big box-shadow dims everything but the target.
          When there's no target we fade in a plain scrim instead. */}
      {padded ? (
        <motion.div
          key="spotlight"
          className={`pointer-events-none absolute rounded-2xl ring-2 ${
            interactive ? 'ring-primary' : 'ring-primary/70'
          }`}
          initial={false}
          animate={{
            top: padded.top,
            left: padded.left,
            width: padded.width,
            height: padded.height,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          style={{ boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.72)' }}
        />
      ) : (
        <motion.div
          key="scrim"
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ backgroundColor: 'rgba(2, 6, 23, 0.72)' }}
        />
      )}

      {/* Interactive: a transparent catcher over the target forwards the tap. */}
      {interactive && padded && (
        <motion.button
          type="button"
          onClick={activateInteractive}
          aria-label={currentStep.title}
          className="absolute rounded-2xl"
          initial={false}
          animate={{
            top: padded.top,
            left: padded.left,
            width: padded.width,
            height: padded.height,
            boxShadow: [
              '0 0 0 0px rgba(16,185,129,0.5)',
              '0 0 0 10px rgba(16,185,129,0)',
            ],
          }}
          transition={{
            top: { type: 'spring', stiffness: 260, damping: 30 },
            left: { type: 'spring', stiffness: 260, damping: 30 },
            boxShadow: { duration: 1.4, repeat: Infinity, ease: 'easeOut' },
          }}
        />
      )}

      {/* Skip control — subtle, top-right, always reachable. */}
      <button
        type="button"
        onClick={skipAll}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
      >
        Skip tutorial
      </button>

      {/* Terry + speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: placeBelow ? 12 : -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: placeBelow ? -8 : 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="absolute"
          style={{ ...vertical, left: bubbleLeft, width: bubbleWidth }}
        >
          <div className="flex items-end gap-2.5">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="h-16 w-16 shrink-0 drop-shadow-lg"
            >
              <BuddyFace mood={currentStep.mood ?? 'happy'} />
            </motion.div>

            <div className="relative min-w-0 flex-1 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-2xl">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Terry · {currentStep.title}
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close tutorial"
                  className="-mr-1 -mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>

              <p className="mt-1.5 text-[13px] leading-snug text-foreground">
                {renderLine(currentStep.body)}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2">
                {/* Progress dots */}
                <div className="flex items-center gap-1">
                  {activeTour.steps.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full transition-all duration-200 ${
                        i === stepIndex ? 'w-3.5 bg-primary' : 'w-1 bg-border'
                      }`}
                    />
                  ))}
                </div>

                {interactive ? (
                  <button
                    type="button"
                    onClick={next}
                    className="text-[11px] font-medium text-muted-foreground/80 underline-offset-2 transition-colors hover:text-foreground hover:underline"
                  >
                    Skip this step
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {!isFirstStep && (
                      <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous tip"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <ArrowLeft size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={next}
                      className="flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      {isLastStep ? 'Got it' : 'Next'}
                      {!isLastStep && <ArrowRight size={14} />}
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-1 text-right text-[10px] text-muted-foreground/70">
                {interactive ? 'Tap the highlighted + button' : `${stepIndex + 1} of ${totalSteps}`}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
