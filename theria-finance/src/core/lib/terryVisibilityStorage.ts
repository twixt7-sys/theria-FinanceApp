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

/** Which edge Terry's floating bubble docks to. He mirrors the FAB by default. */
export type TerrySide = 'left' | 'right';

export function readTerrySide(): TerrySide {
  try {
    return localStorage.getItem(STORAGE_KEYS.terrySide) === 'right' ? 'right' : 'left';
  } catch {
    return 'left';
  }
}

export function writeTerrySide(side: TerrySide) {
  try {
    localStorage.setItem(STORAGE_KEYS.terrySide, side);
  } catch {
    /* session-only */
  }
}
