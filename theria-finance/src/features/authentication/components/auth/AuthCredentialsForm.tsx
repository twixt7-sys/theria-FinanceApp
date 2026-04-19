import React from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
import { Label } from '../../../../shared/components/ui/label';
import type { AuthMode } from '../../../../core/auth/validateAuthForm';

export type AuthCredentialsFormProps = {
  mode: AuthMode;
  email: string;
  password: string;
  username: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export const AuthCredentialsForm: React.FC<AuthCredentialsFormProps> = ({
  mode,
  email,
  password,
  username,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  formError,
  isSubmitting,
  onSubmit,
}) => {
  const isLogin = mode === 'login';

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

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
              name="username"
              placeholder="Your name on Theria"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="h-11 border-border/70 bg-input-background pl-10"
              required={!isLogin}
              autoComplete="username"
              maxLength={48}
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
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-11 border-border/70 bg-input-background pl-10"
            required
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={254}
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
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-11 border-border/70 bg-input-background pl-10"
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            maxLength={128}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-11 w-full rounded-xl text-[0.9375rem] font-semibold shadow-md shadow-primary/15"
      >
        {isSubmitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  );
};
