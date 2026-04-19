import React from 'react';
import { motion } from 'motion/react';
import type { AuthMode } from '../../../../core/auth/validateAuthForm';

type AuthModeSegmentedControlProps = {
  mode: AuthMode;
  onSelectMode: (mode: AuthMode) => void;
};

export const AuthModeSegmentedControl: React.FC<AuthModeSegmentedControlProps> = ({ mode, onSelectMode }) => {
  const isLogin = mode === 'login';

  return (
    <div className="relative mb-6 flex h-11 rounded-2xl bg-muted/60 p-1 ring-1 ring-border/40 dark:bg-muted/35">
      <motion.div
        className="pointer-events-none absolute top-1 bottom-1 rounded-xl bg-background shadow-sm ring-1 ring-border/50 dark:bg-card dark:ring-border/30"
        initial={false}
        animate={{
          left: isLogin ? 4 : '50%',
          width: 'calc(50% - 4px)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
      />
      <button
        type="button"
        onClick={() => onSelectMode('login')}
        className={`relative z-10 flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
          isLogin ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onSelectMode('register')}
        className={`relative z-10 flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
          !isLogin ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Register
      </button>
    </div>
  );
};
