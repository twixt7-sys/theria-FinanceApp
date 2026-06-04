import { STORAGE_KEYS } from '../constants/appStorage';
import type { SimpleModeFabRoute } from '../../shared/lib/simpleModeFabGuides';

function readDismissedList(): SimpleModeFabRoute[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.simpleModeFabGuidesDismissed);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFabGuideDismissed(screen: SimpleModeFabRoute): boolean {
  return readDismissedList().includes(screen);
}

export function dismissFabGuide(screen: SimpleModeFabRoute) {
  const dismissed = new Set(readDismissedList());
  dismissed.add(screen);
  try {
    localStorage.setItem(
      STORAGE_KEYS.simpleModeFabGuidesDismissed,
      JSON.stringify([...dismissed]),
    );
  } catch {
    /* session-only */
  }
}

export function clearAllDismissedFabGuides() {
  try {
    localStorage.removeItem(STORAGE_KEYS.simpleModeFabGuidesDismissed);
  } catch {
    /* session-only */
  }
}
