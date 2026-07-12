import { STORAGE_KEYS } from '../constants/appStorage';
import {
  readJsonFromLocalStorage,
  removeLocalStorageKey,
  writeJsonToLocalStorage,
} from './localStorageJson';

/**
 * Onboarding runs once, right after registration. The pending flag is set by
 * AuthContext.register and cleared when the guided setup finishes (or is
 * skipped), so returning users never see it again.
 */
export function markOnboardingPending(): void {
  writeJsonToLocalStorage(STORAGE_KEYS.onboardingPending, true);
}

export function isOnboardingPending(): boolean {
  return readJsonFromLocalStorage<boolean>(STORAGE_KEYS.onboardingPending) === true;
}

export function clearOnboardingPending(): void {
  removeLocalStorageKey(STORAGE_KEYS.onboardingPending);
}

/** Fired on window when something (e.g. developer settings) asks for the wizard. */
export const ONBOARDING_REQUESTED_EVENT = 'theria:onboarding-requested';

/** Re-launches Terry's guided setup immediately — used by developer settings. */
export function requestGuidedSetup(): void {
  markOnboardingPending();
  window.dispatchEvent(new Event(ONBOARDING_REQUESTED_EVENT));
}

/** Anonymous, optional answers collected during setup — business intelligence only. */
export interface OnboardingInsights {
  ageRange?: string;
  gender?: string;
  work?: string;
  useCases?: string[];
  collectedAt: string;
}

export function saveOnboardingInsights(insights: Omit<OnboardingInsights, 'collectedAt'>): void {
  const hasAnything =
    insights.ageRange || insights.gender || insights.work || (insights.useCases?.length ?? 0) > 0;
  if (!hasAnything) return;
  writeJsonToLocalStorage(STORAGE_KEYS.onboardingInsights, {
    ...insights,
    collectedAt: new Date().toISOString(),
  } satisfies OnboardingInsights);
}

export type ReminderFrequency = 'daily' | 'weekdays' | 'weekly';

export interface ReminderSchedule {
  enabled: boolean;
  frequency: ReminderFrequency;
  /** 24h clock, e.g. "20:00". */
  time: string;
  /** Day of week (0 = Sunday) — only meaningful when frequency is "weekly". */
  weekday: number;
}

export const DEFAULT_REMINDER_SCHEDULE: ReminderSchedule = {
  enabled: true,
  frequency: 'daily',
  time: '20:00',
  weekday: 0,
};

export function saveReminderSchedule(schedule: ReminderSchedule): void {
  writeJsonToLocalStorage(STORAGE_KEYS.reminderSchedule, schedule);
}

export function readReminderSchedule(): ReminderSchedule | null {
  return readJsonFromLocalStorage<ReminderSchedule>(STORAGE_KEYS.reminderSchedule);
}
