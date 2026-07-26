import React from 'react';
import type { AuthMode } from '../../../../core/auth/validateAuthForm';

type AuthModeSwitchProps = {
  mode: AuthMode;
  onSelectMode: (mode: AuthMode) => void;
};

const MODES: { id: AuthMode; label: string }[] = [
  { id: 'login', label: 'Login' },
  { id: 'register', label: 'Register' },
];

/**
 * Doubles as the screen's title now that the headline copy is gone: the two
 * modes read as large type and the active one carries the weight, with no
 * underline or marker under it. Centred on the same axis as everything else.
 */
export const AuthModeSwitch: React.FC<AuthModeSwitchProps> = ({ mode, onSelectMode }) => (
  <div
    role="tablist"
    aria-label="Login or register"
    className="mb-6 flex items-baseline justify-center gap-8"
  >
    {MODES.map(({ id, label }) => {
      const active = mode === id;
      return (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onSelectMode(id)}
          className={`text-[1.5rem] font-semibold tracking-tight outline-none transition-colors duration-300 sm:text-[1.625rem] ${
            active
              ? 'text-foreground'
              : 'text-muted-foreground/40 hover:text-muted-foreground/70'
          }`}
        >
          {label}
        </button>
      );
    })}
  </div>
);
