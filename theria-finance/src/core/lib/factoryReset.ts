import { markOnboardingPending } from './onboardingStorage';

/**
 * Wipes every trace of local app state and returns Theria to a true first-run:
 * all data and preferences cleared, the user signed out, and the next sign-in
 * routed back through Terry's guided setup. The tutorial keys are cleared by the
 * wipe too, so every screen's spotlight tour auto-starts again once onboarding
 * finishes. A full page reload guarantees no in-memory React state survives.
 */
export function performFactoryReset(): void {
  try {
    localStorage.clear();
  } catch {
    /* storage may be unavailable in private mode */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }

  // Re-arm onboarding after the wipe so the next sign-in (login or register)
  // runs the guided setup, not just a brand-new registration.
  markOnboardingPending();

  window.location.reload();
}
