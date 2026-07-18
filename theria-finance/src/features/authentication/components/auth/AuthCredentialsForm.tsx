import React from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
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

/** Boxless field: an icon, the input, and a hairline rule that lights up on focus. */
const FIELD_CLASS =
  'h-11 rounded-none border-0 border-b border-b-border/60 bg-transparent px-0 pl-7 shadow-none ' +
  'transition-colors focus-visible:border-b-primary focus-visible:ring-0 dark:bg-transparent';

const ICON_CLASS =
  'pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/70';

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
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {formError ? (
        <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      {!isLogin && (
        <div className="relative">
          <User className={ICON_CLASS} size={16} aria-hidden />
          <Input
            id="username"
            type="text"
            name="username"
            aria-label="Username"
            placeholder="Your name on Theria"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            className={FIELD_CLASS}
            required={!isLogin}
            autoComplete="username"
            maxLength={48}
          />
        </div>
      )}

      <div className="relative">
        <Mail className={ICON_CLASS} size={16} aria-hidden />
        <Input
          id="email"
          type="email"
          name="email"
          aria-label="Email"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={FIELD_CLASS}
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={254}
        />
      </div>

      <div className="relative">
        <Lock className={ICON_CLASS} size={16} aria-hidden />
        <Input
          id="password"
          type="password"
          name="password"
          aria-label="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={FIELD_CLASS}
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          maxLength={128}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 w-full rounded-full text-[0.9375rem] font-semibold shadow-lg shadow-primary/20"
      >
        {isSubmitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  );
};
