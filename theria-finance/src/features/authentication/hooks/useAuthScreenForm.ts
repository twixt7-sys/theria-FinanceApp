import { useCallback, useState } from 'react';
import { useAuth } from '../../../core/state/AuthContext';
import type { AuthMode } from '../../../core/auth/validateAuthForm';

export function useAuthScreenForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [username, setUsernameState] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setEmail = useCallback((value: string) => {
    setFormError(null);
    setEmailState(value);
  }, []);

  const setPassword = useCallback((value: string) => {
    setFormError(null);
    setPasswordState(value);
  }, []);

  const setUsername = useCallback((value: string) => {
    setFormError(null);
    setUsernameState(value);
  }, []);

  const setLoginMode = useCallback(() => {
    setMode('login');
    setFormError(null);
  }, []);

  const setRegisterMode = useCallback(() => {
    setMode('register');
    setFormError(null);
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setIsSubmitting(true);
      try {
        const result =
          mode === 'login' ? await login(email, password) : await register(username, email, password);
        if (!result.success) {
          setFormError(result.error);
        }
      } catch {
        setFormError('Something went wrong. Please try again in a moment.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, login, mode, password, register, username],
  );

  return {
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
  };
}
