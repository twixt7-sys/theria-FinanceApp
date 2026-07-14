/** Centralized localStorage keys — avoids typos and eases migration. */
export const STORAGE_KEYS = {
  userSession: 'theria-user',
  theme: 'theria-theme',
  currencies: 'theria-currencies',
  simpleMode: 'theria-simple-mode',
  terryVisible: 'theria-terry-visible',
  simpleModeHintsDismissed: 'theria-simple-mode-hints-dismissed',
  simpleModeFabGuidesDismissed: 'theria-simple-mode-fab-guides-dismissed',
  simpleDashboardLayout: 'theria-simple-dashboard-layout',
  onboardingPending: 'theria-onboarding-pending',
  onboardingInsights: 'theria-onboarding-insights',
  reminderSchedule: 'theria-reminder-schedule',
  tutorialCompleted: 'theria-tutorial-completed',
  tutorialDisabled: 'theria-tutorial-disabled',
} as const;
