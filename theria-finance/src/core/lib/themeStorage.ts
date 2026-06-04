import { STORAGE_KEYS } from '../constants/appStorage';
import {
  DEFAULT_BACKGROUND,
  isBackgroundStyleId,
  type BackgroundStyleId,
} from './backgroundPresets';
import {
  DEFAULT_COLOR_THEME,
  DEFAULT_THEME_MODE,
  type ColorThemeId,
  type ThemeMode,
} from './themePresets';

export interface ThemePreferences {
  mode: ThemeMode;
  palette: ColorThemeId;
  background: BackgroundStyleId;
}

const ALLOWED_MODES: readonly ThemeMode[] = ['dark', 'light'];
const ALLOWED_PALETTES: readonly ColorThemeId[] = [
  'emerald',
  'pink',
  'ocean',
  'violet',
  'amber',
  'rose',
];

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  mode: DEFAULT_THEME_MODE,
  palette: DEFAULT_COLOR_THEME,
  background: DEFAULT_BACKGROUND,
};

function isThemeMode(value: unknown): value is ThemeMode {
  if (value === 'colored') return false;
  return typeof value === 'string' && (ALLOWED_MODES as readonly string[]).includes(value);
}

function isColorThemeId(value: unknown): value is ColorThemeId {
  return typeof value === 'string' && (ALLOWED_PALETTES as readonly string[]).includes(value);
}

function normalizeMode(value: unknown): ThemeMode {
  if (value === 'colored') return 'light';
  return isThemeMode(value) ? value : DEFAULT_THEME_MODE;
}

/** Migrates legacy storage shapes to structured preferences. */
export function parseStoredTheme(raw: string | null): ThemePreferences {
  if (!raw) return DEFAULT_THEME_PREFERENCES;

  if (raw === 'light') {
    return { ...DEFAULT_THEME_PREFERENCES, mode: 'light' };
  }
  if (raw === 'dark') {
    return { ...DEFAULT_THEME_PREFERENCES, mode: 'dark' };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
    return {
      mode: normalizeMode(parsed.mode),
      palette: isColorThemeId(parsed.palette) ? parsed.palette : DEFAULT_COLOR_THEME,
      background: isBackgroundStyleId(parsed.background)
        ? parsed.background
        : DEFAULT_BACKGROUND,
    };
  } catch {
    return DEFAULT_THEME_PREFERENCES;
  }
}

export function readThemePreference(): ThemePreferences {
  try {
    return parseStoredTheme(localStorage.getItem(STORAGE_KEYS.theme));
  } catch {
    return DEFAULT_THEME_PREFERENCES;
  }
}

export function serializeThemePreference(preferences: ThemePreferences): string {
  return JSON.stringify(preferences);
}

/** @deprecated Use ThemePreferences.mode */
export type AppTheme = ThemeMode;
