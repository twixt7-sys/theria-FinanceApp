import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../../core/state/ThemeContext';
import { useAuthScreenForm } from '../hooks/useAuthScreenForm';
import { AuthAmbientBackground } from '../components/auth/AuthAmbientBackground';
import { AuthThemeToggleBar } from '../components/auth/AuthThemeToggleBar';
import { AuthBrandHeader } from '../components/auth/AuthBrandHeader';
import { AuthModeSwitch } from '../components/auth/AuthModeSwitch';
import { AuthCredentialsForm } from '../components/auth/AuthCredentialsForm';
import type { AuthMode } from '../../../core/auth/validateAuthForm';

export const AuthScreen: React.FC = () => {
  const { themeMode, cycleThemeMode } = useTheme();

  const {
    mode,
    setLoginMode,
    setRegisterMode,
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    formError,
    isSubmitting,
    onSubmit,
  } = useAuthScreenForm();

  const onSelectMode = (next: AuthMode) => {
    if (next === 'login') setLoginMode();
    else setRegisterMode();
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-background">
      <AuthAmbientBackground />
      <AuthThemeToggleBar themeMode={themeMode} onCycleThemeMode={cycleThemeMode} />

      {/* One centred column floating straight on the background — no panel, no frames. */}
      <main className="relative z-10 mx-auto flex w-full min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-8">
        <motion.div
          className="mx-auto flex w-full max-w-[22rem] flex-col sm:max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <AuthBrandHeader />
          <AuthModeSwitch mode={mode} onSelectMode={onSelectMode} />
          <AuthCredentialsForm
            mode={mode}
            email={email}
            password={password}
            username={username}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onUsernameChange={setUsername}
            formError={formError}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />

          <p className="mt-7 text-center text-[0.6875rem] leading-relaxed text-muted-foreground/80">
            Demo mode — any real-looking credentials work.
          </p>
          <p className="mt-1.5 text-center text-[0.6875rem] leading-relaxed text-muted-foreground/80">
            By continuing you agree to use Theria responsibly with your own data.
          </p>
        </motion.div>
      </main>
    </div>
  );
};
