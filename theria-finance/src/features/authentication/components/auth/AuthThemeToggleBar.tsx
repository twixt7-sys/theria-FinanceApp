import React from 'react';
import { ThemeModeToggle } from '../../../../shared/components/ThemeModeToggle';
import type { ThemeMode } from '../../../../core/lib/themePresets';

type AuthThemeToggleBarProps = {
  themeMode: ThemeMode;
  onCycleThemeMode: () => void;
};

export const AuthThemeToggleBar: React.FC<AuthThemeToggleBarProps> = ({
  themeMode,
  onCycleThemeMode,
}) => (
  <header className="relative z-20 flex shrink-0 items-start justify-end px-4 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6">
    <ThemeModeToggle themeMode={themeMode} onCycle={onCycleThemeMode} />
  </header>
);
