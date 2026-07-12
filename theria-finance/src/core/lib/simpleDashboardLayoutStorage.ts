import { STORAGE_KEYS } from '../constants/appStorage';

export const SIMPLE_DASHBOARD_WIDGET_IDS = [
  'buddy',
  'balance',
  'quickActions',
  'spending',
  'incomeSources',
  'activity',
  'budgets',
  'savings',
  'accounts',
] as const;

export type SimpleDashboardWidgetId = (typeof SIMPLE_DASHBOARD_WIDGET_IDS)[number];

/** Layout entries are widget ids plus any number of divider instances ("divider-<n>"). */
export type SimpleDashboardLayoutId = string;

export const isDividerId = (id: string) => /^divider(-\d+)?$/.test(id);

export const DEFAULT_SIMPLE_DASHBOARD_LAYOUT: SimpleDashboardLayoutId[] = [
  'buddy',
  'balance',
  'quickActions',
];

export function readSimpleDashboardLayout(): SimpleDashboardLayoutId[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.simpleDashboardLayout);
    if (!stored) return [...DEFAULT_SIMPLE_DASHBOARD_LAYOUT];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [...DEFAULT_SIMPLE_DASHBOARD_LAYOUT];
    const valid = parsed.filter(
      (id): id is SimpleDashboardLayoutId =>
        typeof id === 'string' &&
        ((SIMPLE_DASHBOARD_WIDGET_IDS as readonly string[]).includes(id) || isDividerId(id)),
    );
    const unique = [...new Set(valid)];
    // The balance card is the dashboard's core and can never be removed.
    if (!unique.includes('balance')) unique.unshift('balance');
    // Terry is a fixture too — dismissing him only hides him for the visit,
    // so restore him (on top) if an older layout dropped him.
    if (!unique.includes('buddy')) unique.unshift('buddy');
    return unique;
  } catch {
    return [...DEFAULT_SIMPLE_DASHBOARD_LAYOUT];
  }
}

export function writeSimpleDashboardLayout(layout: SimpleDashboardLayoutId[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.simpleDashboardLayout, JSON.stringify(layout));
  } catch {
    /* session-only */
  }
}
