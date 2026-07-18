import React from 'react';
import { motion } from 'motion/react';
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
 * modes read as large type, and the active one is marked with the dot-and-bar
 * indicator Terry uses to page through his tips.
 */
export const AuthModeSwitch: React.FC<AuthModeSwitchProps> = ({ mode, onSelectMode }) => (
  <div role="tablist" aria-label="Login or register" className="mb-8 flex items-end gap-6">
    {MODES.map(({ id, label }) => {
      const active = mode === id;
      return (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onSelectMode(id)}
          className="group relative pb-3 outline-none"
        >
          <span
            className={`text-[1.75rem] font-semibold tracking-tight transition-colors duration-300 sm:text-[2rem] ${
              active
                ? 'text-foreground'
                : 'text-muted-foreground/40 group-hover:text-muted-foreground/70'
            }`}
          >
            {label}
          </span>
          {active && (
            <motion.span
              layoutId="auth-mode-indicator"
              className="absolute bottom-0 left-0 flex w-full items-center gap-1.5"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="h-[3px] flex-1 rounded-full bg-primary/70" />
            </motion.span>
          )}
        </button>
      );
    })}
  </div>
);
