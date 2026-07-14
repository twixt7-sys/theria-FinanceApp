import { STORAGE_KEYS } from '../constants/appStorage';
import {
  readJsonFromLocalStorage,
  removeLocalStorageKey,
  writeJsonToLocalStorage,
} from './localStorageJson';
import type { TutorialTourId } from '../../shared/lib/tutorialSteps';

/**
 * The guided tutorial mirrors the Simple Mode FAB guides: each screen's tour
 * runs once, the first time the user lands on it after onboarding, and the
 * completed set is remembered so it never re-appears on its own. Settings can
 * clear the set to replay everything, or disable auto-start entirely.
 */

function readCompletedList(): TutorialTourId[] {
  const parsed = readJsonFromLocalStorage<unknown>(STORAGE_KEYS.tutorialCompleted);
  return Array.isArray(parsed) ? (parsed as TutorialTourId[]) : [];
}

export function isTourCompleted(tour: TutorialTourId): boolean {
  return readCompletedList().includes(tour);
}

export function markTourCompleted(tour: TutorialTourId): void {
  const completed = new Set(readCompletedList());
  completed.add(tour);
  writeJsonToLocalStorage(STORAGE_KEYS.tutorialCompleted, [...completed]);
}

/** Clears completed tours so every screen teaches itself again on next visit. */
export function resetTutorialProgress(): void {
  removeLocalStorageKey(STORAGE_KEYS.tutorialCompleted);
}

/** When disabled, tours never auto-start (they can still be launched manually). */
export function isTutorialDisabled(): boolean {
  return readJsonFromLocalStorage<boolean>(STORAGE_KEYS.tutorialDisabled) === true;
}

export function setTutorialDisabled(disabled: boolean): void {
  if (disabled) {
    writeJsonToLocalStorage(STORAGE_KEYS.tutorialDisabled, true);
  } else {
    removeLocalStorageKey(STORAGE_KEYS.tutorialDisabled);
  }
}
