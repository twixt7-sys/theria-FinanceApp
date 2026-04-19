import { STORAGE_KEYS } from '../constants/appStorage';

export type AppTheme = 'light' | 'dark';

const ALLOWED: readonly AppTheme[] = ['light', 'dark'];

export function parseStoredTheme(raw: string | null): AppTheme {
  if (raw && (ALLOWED as readonly string[]).includes(raw)) {
    return raw as AppTheme;
  }
  return 'light';
}

export function readThemePreference(): AppTheme {
  try {
    return parseStoredTheme(localStorage.getItem(STORAGE_KEYS.theme));
  } catch {
    return 'light';
  }
}
