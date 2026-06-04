import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants/appStorage';
import { BACKGROUND_STYLE_MAP, type BackgroundStyleId } from '../lib/backgroundPresets';
import { applyThemeToDocument } from '../lib/applyTheme';
import {
  COLOR_THEME_MAP,
  getNextThemeMode,
  THEME_MODE_LABELS,
  type ColorThemeId,
  type ThemeMode,
} from '../lib/themePresets';
import {
  readThemePreference,
  serializeThemePreference,
  type ThemePreferences,
} from '../lib/themeStorage';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorTheme: ColorThemeId;
  backgroundStyle: BackgroundStyleId;
  isDark: boolean;
  preferences: ThemePreferences;
  cycleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (palette: ColorThemeId) => void;
  setBackgroundStyle: (background: BackgroundStyleId) => void;
  themeModeLabel: string;
  colorThemeLabel: string;
  backgroundLabel: string;
  appearanceHint: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => readThemePreference());

  useEffect(() => {
    applyThemeToDocument(preferences);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, serializeThemePreference(preferences));
    } catch {
      /* theme still applies for this session */
    }
  }, [preferences]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setPreferences((prev) => ({ ...prev, mode }));
  }, []);

  const setColorTheme = useCallback((palette: ColorThemeId) => {
    setPreferences((prev) => ({ ...prev, palette }));
  }, []);

  const setBackgroundStyle = useCallback((background: BackgroundStyleId) => {
    setPreferences((prev) => ({ ...prev, background }));
  }, []);

  const cycleThemeMode = useCallback(() => {
    setPreferences((prev) => ({ ...prev, mode: getNextThemeMode(prev.mode) }));
  }, []);

  const value = useMemo<ThemeContextType>(() => {
    const paletteMeta = COLOR_THEME_MAP[preferences.palette];
    const backgroundMeta = BACKGROUND_STYLE_MAP[preferences.background];
    const modeLabel = THEME_MODE_LABELS[preferences.mode];

    return {
      themeMode: preferences.mode,
      colorTheme: preferences.palette,
      backgroundStyle: preferences.background,
      isDark: preferences.mode === 'dark',
      preferences,
      cycleThemeMode,
      setThemeMode,
      setColorTheme,
      setBackgroundStyle,
      themeModeLabel: modeLabel,
      colorThemeLabel: paletteMeta.label,
      backgroundLabel: backgroundMeta.label,
      appearanceHint: `${modeLabel} · ${paletteMeta.label}`,
    };
  }, [preferences, cycleThemeMode, setThemeMode, setColorTheme, setBackgroundStyle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
