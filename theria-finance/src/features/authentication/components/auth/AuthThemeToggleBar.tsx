import React from 'react';
import { Moon, Sun } from 'lucide-react';
import type { AppTheme } from '../../../../core/lib/themeStorage';

type AuthThemeToggleBarProps = {
  theme: AppTheme;
  onToggleTheme: () => void;
};

export const AuthThemeToggleBar: React.FC<AuthThemeToggleBarProps> = ({ theme, onToggleTheme }) => (
  <header className="relative z-20 flex shrink-0 items-start justify-end px-4 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6">
    <button
      type="button"
      onClick={onToggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-muted active:scale-[0.98] sm:h-11 sm:w-11"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  </header>
);
