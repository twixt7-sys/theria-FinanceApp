import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BACKGROUND_STYLES,
  getBackgroundPreviewStyle,
  type BackgroundStyleId,
} from '../../core/lib/backgroundPresets';
import {
  COLOR_THEMES,
  COLOR_THEME_MAP,
  THEME_MODE_LABELS,
  type ColorThemeId,
  type ThemeMode,
} from '../../core/lib/themePresets';
import { cn } from './ui/utils';

type ColorThemePickerProps = {
  colorTheme: ColorThemeId;
  themeMode: ThemeMode;
  backgroundStyle: BackgroundStyleId;
  onColorThemeChange: (palette: ColorThemeId) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onBackgroundChange: (background: BackgroundStyleId) => void;
};

const MODE_OPTIONS: ThemeMode[] = ['light', 'dark'];

export const ColorThemePicker: React.FC<ColorThemePickerProps> = ({
  colorTheme,
  themeMode,
  backgroundStyle,
  onColorThemeChange,
  onThemeModeChange,
  onBackgroundChange,
}) => {
  const isDark = themeMode === 'dark';
  const activeSwatch = COLOR_THEME_MAP[colorTheme].swatch;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Display mode
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/20 p-1">
          {MODE_OPTIONS.map((mode) => {
            const active = themeMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onThemeModeChange(mode)}
                className={cn(
                  'rounded-lg px-2 py-2 text-[11px] font-medium transition-all',
                  active
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-primary/25'
                    : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
                )}
              >
                {THEME_MODE_LABELS[mode]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Color theme
        </p>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_THEMES.map((theme) => {
            const active = colorTheme === theme.id;

            return (
              <motion.button
                key={theme.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onColorThemeChange(theme.id)}
                className={cn(
                  'relative overflow-hidden rounded-xl border p-3 text-left transition-all',
                  active
                    ? 'border-primary/40 bg-card shadow-sm ring-1 ring-primary/20'
                    : 'border-border/60 bg-card/50 hover:border-border hover:bg-card',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.swatch }}
                        aria-hidden
                      />
                      <p className="truncate text-[12px] font-semibold text-foreground">
                        {theme.label}
                      </p>
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                      {theme.tagline}
                    </p>
                  </div>
                  {active && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-1">
                  {MODE_OPTIONS.map((mode) => (
                    <span
                      key={mode}
                      className="h-1.5 flex-1 rounded-full opacity-90"
                      style={{ backgroundColor: theme.modes[mode]['--primary'] }}
                      title={THEME_MODE_LABELS[mode]}
                      aria-hidden
                    />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Background
        </p>
        <p className="mb-2.5 px-0.5 text-[10px] leading-relaxed text-muted-foreground">
          Patterns adapt to your color theme and display mode.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BACKGROUND_STYLES.map((style) => {
            const active = backgroundStyle === style.id;

            return (
              <motion.button
                key={style.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onBackgroundChange(style.id)}
                className={cn(
                  'relative overflow-hidden rounded-xl border p-2 text-left transition-all',
                  active
                    ? 'border-primary/40 ring-1 ring-primary/20'
                    : 'border-border/60 hover:border-border',
                )}
              >
                <div
                  className="mb-2 h-12 w-full rounded-lg border border-border/40"
                  style={getBackgroundPreviewStyle(style.id, activeSwatch, isDark)}
                  aria-hidden
                />
                <p className="truncate text-[11px] font-semibold text-foreground">{style.label}</p>
                <p className="truncate text-[9px] text-muted-foreground">{style.tagline}</p>
                {active && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check size={9} strokeWidth={3} />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
