import { STORAGE_KEYS } from '../constants/appStorage';

export function readSimpleMode(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.simpleMode);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
  }
}

export function writeSimpleMode(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.simpleMode, enabled ? 'true' : 'false');
  } catch {
    /* session-only */
  }
}
