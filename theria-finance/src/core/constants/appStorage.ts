/** Centralized localStorage keys — avoids typos and eases migration. */
export const STORAGE_KEYS = {
  userSession: 'theria-user',
  theme: 'theria-theme',
  currencies: 'theria-currencies',
  simpleMode: 'theria-simple-mode',
  simpleModeHintsDismissed: 'theria-simple-mode-hints-dismissed',
  simpleModeFabGuidesDismissed: 'theria-simple-mode-fab-guides-dismissed',
  simpleDashboardLayout: 'theria-simple-dashboard-layout',
} as const;
