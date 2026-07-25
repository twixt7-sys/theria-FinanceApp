import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useTheme } from '../../../core/state/ThemeContext';
import { useAuth } from '../../../core/state/AuthContext';
import { useAuthScreenForm } from '../hooks/useAuthScreenForm';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { AuthAmbientBackground } from '../components/auth/AuthAmbientBackground';
import { AuthThemeToggleBar } from '../components/auth/AuthThemeToggleBar';
import { AuthBrandHeader } from '../components/auth/AuthBrandHeader';
import { AuthModeSwitch } from '../components/auth/AuthModeSwitch';
import { AuthCredentialsForm } from '../components/auth/AuthCredentialsForm';
import type { AuthMode } from '../../../core/auth/validateAuthForm';

export const AuthScreen: React.FC = () => {
  const { themeMode, cycleThemeMode } = useTheme();
  const { status } = useAuth();
  const navigate = useNavigate();

  // Signing in is an upgrade, not a gate — land back in the app once it lands.
  useEffect(() => {
    if (status === 'signedIn') navigate('/', { replace: true });
  }, [status, navigate]);

  const {
    canSignIn,
    onGoogleSignIn,
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

          {!canSignIn && (
            <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-700 dark:text-amber-300">
              Sign-in isn't configured yet. You can keep using Theria on this device.
            </p>
          )}

          <div className="mb-4">
            <GoogleSignInButton onClick={onGoogleSignIn} disabled={!canSignIn || isSubmitting} />
          </div>

          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[0.6875rem] uppercase tracking-wide text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

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

          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="mt-6 text-center text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Continue without an account
          </button>

          <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-muted-foreground/80">
            Signing in backs your data up and syncs it across devices. Without an
            account everything stays on this device.
          </p>
        </motion.div>
      </main>
    </div>
  );
};
