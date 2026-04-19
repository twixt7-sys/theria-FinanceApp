import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Mail, Lock, User, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../core/state/AuthContext';
import { useTheme } from '../../../core/state/ThemeContext';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(username, email, password);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-background">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 -top-40 h-[22rem] w-[22rem] rounded-full bg-primary/12 blur-3xl dark:bg-primary/18" />
        <div className="absolute -bottom-48 -right-28 h-[26rem] w-[26rem] rounded-full bg-emerald-400/8 blur-3xl dark:bg-emerald-500/12" />
        <div className="absolute left-1/2 top-[12%] h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-500/6 blur-3xl dark:bg-cyan-400/10" />
      </div>

      {/* Top bar — theme toggle, respects notch */}
      <header className="relative z-20 flex shrink-0 items-start justify-end px-4 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-muted active:scale-[0.98] sm:h-11 sm:w-11"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      {/* Content — scroll on short phones, centered when space allows */}
      <main className="relative z-10 mx-auto flex w-full min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:px-8 lg:max-w-6xl lg:flex-row lg:items-center lg:gap-20 lg:overflow-visible lg:px-10 lg:pb-10 lg:pt-0">
        {/* Desktop story */}
        <motion.section
          className="mb-8 hidden max-w-md flex-col justify-center lg:mb-0 lg:flex lg:pr-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/50 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            <ShieldCheck className="shrink-0 text-primary" size={14} aria-hidden />
            Private by default · demo-friendly
          </div>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.15] tracking-tight text-foreground lg:text-[2.75rem]">
            Money, organized the way you think.
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            Theria connects accounts, streams, and goals so you always know where you stand.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Accounts', 'Budgets', 'Savings', 'Insights'].map((label) => (
              <span
                key={label}
                className="rounded-full border border-border/60 bg-muted/35 px-3 py-1 text-xs font-medium text-foreground/85"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Form stack */}
        <motion.div
          className="mx-auto flex w-full max-w-sm flex-col sm:max-w-md lg:mx-0 lg:max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile-only micro brand */}
          <div className="mb-6 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md ring-4 ring-primary/12">
              <TrendingUp size={24} strokeWidth={2} aria-hidden />
            </div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary">Theria</p>
            <p className="mt-1 text-sm text-muted-foreground">Clarity for your finances</p>
          </div>

          <div className="mb-6 hidden text-left lg:block">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-lg ring-4 ring-primary/12">
              <TrendingUp size={28} strokeWidth={2} aria-hidden />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {isLogin ? 'Welcome back' : 'Create your space'}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
              {isLogin ? 'Sign in to pick up where you left off.' : 'A few details — then your dashboard is ready.'}
            </p>
          </div>

          {/* Mobile titles (no duplicate logo) */}
          <div className="mb-5 text-center lg:hidden">
            <h1 className="text-[1.35rem] font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
              {isLogin ? 'Welcome back' : 'Create your space'}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {isLogin ? 'Sign in to continue.' : 'Tell us a bit about you.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-lg shadow-primary/[0.04] backdrop-blur-xl sm:rounded-3xl sm:p-7 sm:shadow-xl sm:shadow-primary/5 dark:bg-card/75 dark:shadow-black/25">
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
                onClick={() => setIsLogin(true)}
                className={`relative z-10 flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
                  isLogin ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`relative z-10 flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
                  !isLogin ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-[0.8125rem] text-foreground/90">
                    Username
                  </Label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={17}
                      aria-hidden
                    />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Your name on Theria"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-11 border-border/70 bg-input-background pl-10"
                      required={!isLogin}
                      autoComplete="username"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[0.8125rem] text-foreground/90">
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                    aria-hidden
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-border/70 bg-input-background pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[0.8125rem] text-foreground/90">
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                    aria-hidden
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-border/70 bg-input-background pl-10"
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="mt-1 h-11 w-full rounded-xl text-[0.9375rem] font-semibold shadow-md shadow-primary/15"
              >
                {isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </form>

            <p className="mt-5 text-center">
              <span className="inline-flex max-w-full items-center justify-center rounded-full bg-muted/45 px-3 py-1.5 text-[0.6875rem] font-medium leading-snug text-muted-foreground ring-1 ring-border/45 sm:text-xs">
                Demo mode — any credentials work
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
