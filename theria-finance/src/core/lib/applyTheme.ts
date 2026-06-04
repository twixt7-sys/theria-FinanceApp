import {
  BACKGROUND_CSS_KEYS,
  getBackgroundCssVars,
} from './backgroundPresets';
import {
  COLOR_THEME_MAP,
  CSS_TOKEN_KEYS,
  getThemeTokens,
} from './themePresets';
import type { ThemePreferences } from './themeStorage';

export function applyThemeToDocument(preferences: ThemePreferences) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'colored');
  root.classList.add(preferences.mode);
  root.dataset.colorTheme = preferences.palette;
  root.dataset.background = preferences.background;

  const paletteMeta = COLOR_THEME_MAP[preferences.palette];
  const tokens = getThemeTokens(preferences.palette, preferences.mode);
  const isDark = preferences.mode === 'dark';
  const backgroundVars = getBackgroundCssVars(
    preferences.background,
    paletteMeta.swatch,
    isDark,
  );

  CSS_TOKEN_KEYS.forEach((key) => {
    root.style.removeProperty(key);
  });
  BACKGROUND_CSS_KEYS.forEach((key) => {
    root.style.removeProperty(key);
  });

  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  Object.entries(backgroundVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
