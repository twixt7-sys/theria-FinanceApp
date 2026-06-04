import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { THEME_MODE_LABELS, type ThemeMode } from '../../core/lib/themePresets';
import { cn } from './ui/utils';

type ThemeModeToggleProps = {
  themeMode: ThemeMode;
  onCycle: () => void;
  size?: 'sm' | 'md';
  className?: string;
};

export const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  themeMode,
  onCycle,
  size = 'md',
  className,
}) => {
  const isDark = themeMode === 'dark';
  const Icon = isDark ? Sun : Moon;
  const dimension = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10 sm:h-11 sm:w-11';
  const iconSize = size === 'sm' ? 16 : 18;

  return (
    <button
      type="button"
      onClick={onCycle}
      className={cn(
        'flex items-center justify-center rounded-2xl border border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-muted active:scale-[0.98]',
        dimension,
        className,
      )}
      aria-label={
        isDark
          ? `${THEME_MODE_LABELS.light} theme. Tap to switch from dark.`
          : `${THEME_MODE_LABELS.dark} theme. Tap to switch from light.`
      }
      title={isDark ? 'Switch to light' : 'Switch to dark'}
    >
      <Icon size={iconSize} strokeWidth={2.25} />
    </button>
  );
};
