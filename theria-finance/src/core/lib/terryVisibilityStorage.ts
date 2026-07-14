import { STORAGE_KEYS } from '../constants/appStorage';

/** Terry (the finance buddy) is shown by default until the user hides him. */
export function readTerryVisible(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.terryVisible);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
  }
}

export function writeTerryVisible(visible: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.terryVisible, visible ? 'true' : 'false');
  } catch {
    /* session-only */
  }
}
