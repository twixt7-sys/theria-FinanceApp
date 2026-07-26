import React from 'react';
import { ThemeModeToggle } from '../../../../shared/components/ThemeModeToggle';
import type { ThemeMode } from '../../../../core/lib/themePresets';

type AuthThemeToggleBarProps = {
  themeMode: ThemeMode;
  onCycleThemeMode: () => void;
};

/** Floated out of the flow so the column below centres against the whole screen. */
export const AuthThemeToggleBar: React.FC<AuthThemeToggleBarProps> = ({
  themeMode,
  onCycleThemeMode,
}) => (
  <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-end px-4 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6">
    <ThemeModeToggle themeMode={themeMode} onCycle={onCycleThemeMode} />
  </header>
);
