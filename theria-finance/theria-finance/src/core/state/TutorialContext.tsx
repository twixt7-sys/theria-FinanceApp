import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  getTour,
  type TutorialStep,
  type TutorialTour,
  type TutorialTourId,
} from '../../shared/lib/tutorialSteps';
import {
  isTourCompleted,
  isTutorialDisabled,
  markTourCompleted,
  resetTutorialProgress,
  setTutorialDisabled,
} from '../lib/tutorialStorage';

interface TutorialContextType {
  /** The tour currently playing, or null when nothing is on screen. */
  activeTour: TutorialTour | null;
  /** Index into activeTour.steps. */
  stepIndex: number;
  /** Convenience: the step object currently shown. */
  currentStep: TutorialStep | null;
  isFirstStep: boolean;
  isLastStep: boolean;
  /**
   * Auto-start a screen's tour. Skips silently if the tutorial is disabled,
   * the tour was already completed, or another tour is already playing. Pass
   * `{ force: true }` to replay it regardless (used by Settings / manual launch).
   */
  requestTour: (id: TutorialTourId, options?: { force?: boolean }) => void;
  next: () => void;
  prev: () => void;
  /** Finish the current screen's tour (the "Got it" / dismiss action). */
  close: () => void;
  /** Skip the whole guided tutorial and stop future screens from auto-starting. */
  skipAll: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTour, setActiveTour] = useState<TutorialTour | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // A ref keeps requestTour stable (empty deps) while still reading the latest
  // active tour for its "don't interrupt what's playing" guard.
  const activeTourRef = useRef(activeTour);
  useEffect(() => {
    activeTourRef.current = activeTour;
  }, [activeTour]);

  const requestTour = useCallback<TutorialContextType['requestTour']>((id, options) => {
    const force = options?.force ?? false;
    (window as any).__tutlog?.push(`requestTour ${id} force=${force} completed=${isTourCompleted(id)} disabled=${isTutorialDisabled()} active=${activeTourRef.current?.id ?? null}`);
    if (!force && (isTutorialDisabled() || isTourCompleted(id))) return;
    if (activeTourRef.current && !force) return;
    const tour = getTour(id);
    if (!tour || tour.steps.length === 0) return;
    if (force) setTutorialDisabled(false);
    (window as any).__tutlog?.push(`STARTING ${id}`);
    setActiveTour(tour);
    setStepIndex(0);
  }, []);

  const next = useCallback(() => {
    if (!activeTour) return;
    (window as any).__tutlog?.push(`next from ${stepIndex}/${activeTour.steps.length} ${activeTour.id}`);
    if (stepIndex >= activeTour.steps.length - 1) {
      markTourCompleted(activeTour.id);
      (window as any).__tutlog?.push(`COMPLETE ${activeTour.id}`);
      setActiveTour(null);
      setStepIndex(0);
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [activeTour, stepIndex]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const close = useCallback(() => {
    if (activeTour) markTourCompleted(activeTour.id);
    setActiveTour(null);
    setStepIndex(0);
  }, [activeTour]);

  const skipAll = useCallback(() => {
    setTutorialDisabled(true);
    if (activeTour) markTourCompleted(activeTour.id);
    setActiveTour(null);
    setStepIndex(0);
  }, [activeTour]);

  const value = useMemo<TutorialContextType>(() => {
    const currentStep = activeTour ? activeTour.steps[stepIndex] ?? null : null;
    return {
      activeTour,
      stepIndex,
      currentStep,
      isFirstStep: stepIndex === 0,
      isLastStep: activeTour ? stepIndex >= activeTour.steps.length - 1 : false,
      requestTour,
      next,
      prev,
      close,
      skipAll,
    };
  }, [activeTour, stepIndex, requestTour, next, prev, close, skipAll]);

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

/** Re-exported so Settings can wipe progress without importing storage directly. */
export { resetTutorialProgress, setTutorialDisabled, isTutorialDisabled };
