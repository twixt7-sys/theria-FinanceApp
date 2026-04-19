import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { AuthMode } from '../../../../core/auth/validateAuthForm';

type AuthScreenHeadlinesProps = {
  mode: AuthMode;
};

export const AuthScreenHeadlines: React.FC<AuthScreenHeadlinesProps> = ({ mode }) => {
  const isLogin = mode === 'login';

  return (
    <>
      <div className="mb-6 hidden text-left lg:block">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-lg ring-4 ring-primary/12">
          <TrendingUp size={28} strokeWidth={2} aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {/* {isLogin ? 'Welcome back' : 'Create your space'} */}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
          {isLogin ? 'Sign in to pick up where you left off.' : 'A few details — then your dashboard is ready.'}
        </p>
      </div>

      <div className="mb-5 text-center lg:hidden">
        <h1 className="text-[1.35rem] font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
          {isLogin ? 'Welcome back' : 'Create your space'}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {isLogin ? 'Sign in to continue.' : 'Tell us a bit about you.'}
        </p>
      </div>
    </>
  );
};
