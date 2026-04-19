import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../../core/state/ThemeContext';
import { useAuthScreenForm } from '../hooks/useAuthScreenForm';
import { AuthAmbientBackground } from '../components/auth/AuthAmbientBackground';
import { AuthThemeToggleBar } from '../components/auth/AuthThemeToggleBar';
import { AuthMarketingAside } from '../components/auth/AuthMarketingAside';
import { AuthMobileBrand } from '../components/auth/AuthMobileBrand';
import { AuthScreenHeadlines } from '../components/auth/AuthScreenHeadlines';
import { AuthModeSegmentedControl } from '../components/auth/AuthModeSegmentedControl';
import { AuthCredentialsForm } from '../components/auth/AuthCredentialsForm';
import type { AuthMode } from '../../../core/auth/validateAuthForm';

export const AuthScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

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
      <AuthThemeToggleBar theme={theme} onToggleTheme={toggleTheme} />

      <main className="relative z-10 mx-auto flex w-full min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:px-8 lg:max-w-6xl lg:flex-row lg:items-center lg:gap-20 lg:overflow-visible lg:px-10 lg:pb-10 lg:pt-0">
        <AuthMarketingAside />

        <motion.div
          className="mx-auto flex w-full max-w-sm flex-col sm:max-w-md lg:mx-0 lg:max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <AuthMobileBrand />
          <AuthScreenHeadlines mode={mode} />

          <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-lg shadow-primary/[0.04] backdrop-blur-xl sm:rounded-3xl sm:p-7 sm:shadow-xl sm:shadow-primary/5 dark:bg-card/75 dark:shadow-black/25">
            <AuthModeSegmentedControl mode={mode} onSelectMode={onSelectMode} />
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
            <p className="mt-5 text-center">
              <span className="inline-flex max-w-full items-center justify-center rounded-full bg-muted/45 px-3 py-1.5 text-[0.6875rem] font-medium leading-snug text-muted-foreground ring-1 ring-border/45 sm:text-xs">
                Demo mode — validated inputs; any real-looking credentials work
              </span>
            </p>
          </div>

          <p className="mx-auto mt-5 max-w-[26rem] text-center text-[0.6875rem] leading-relaxed text-muted-foreground sm:text-xs lg:text-left">
            By continuing you agree to use Theria responsibly with your own data.
          </p>
        </motion.div>
      </main>
    </div>
  );
};
