import { STORAGE_KEYS } from '../constants/appStorage';
import type { SimpleModePage } from '../../shared/lib/simpleModeHints';

function readDismissedList(): SimpleModePage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.simpleModeHintsDismissed);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isHintDismissed(page: SimpleModePage): boolean {
  return readDismissedList().includes(page);
}

export function dismissHint(page: SimpleModePage) {
  const dismissed = new Set(readDismissedList());
  dismissed.add(page);
  try {
    localStorage.setItem(
      STORAGE_KEYS.simpleModeHintsDismissed,
      JSON.stringify([...dismissed])
    );
  } catch {
    /* session-only */
  }
}

export function clearAllDismissedHints() {
  try {
    localStorage.removeItem(STORAGE_KEYS.simpleModeHintsDismissed);
  } catch {
    /* session-only */
  }
}
