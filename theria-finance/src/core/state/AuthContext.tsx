import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthActionResult } from '../auth/authResult';
import { normalizeTheriaUser } from '../auth/sessionUser';
import type { TheriaUser } from '../auth/user';
import { validateAuthForm } from '../auth/validateAuthForm';
import { STORAGE_KEYS } from '../constants/appStorage';
import { readJsonFromLocalStorage, removeLocalStorageKey, writeJsonToLocalStorage } from '../lib/localStorageJson';

interface AuthContextType {
  user: TheriaUser | null;
  login: (email: string, password: string, username?: string) => Promise<AuthActionResult>;
  register: (username: string, email: string, password: string) => Promise<AuthActionResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistUser(user: TheriaUser): AuthActionResult {
  const ok = writeJsonToLocalStorage(STORAGE_KEYS.userSession, user);
  if (!ok) {
    return {
      success: false,
      error: 'Could not save your session. Check browser storage permissions and try again.',
    };
  }
  return { success: true };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TheriaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = readJsonFromLocalStorage<unknown>(STORAGE_KEYS.userSession);
    const restored = normalizeTheriaUser(raw);
    if (raw != null && !restored) {
      removeLocalStorageKey(STORAGE_KEYS.userSession);
    }
    setUser(restored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, username?: string): Promise<AuthActionResult> => {
    const formError = validateAuthForm('login', {
      email,
      password,
      username: username ?? '',
    });
    if (formError) {
      return { success: false, error: formError };
    }

    const trimmedEmail = email.trim();
    const nextUser: TheriaUser = {
      id: '1',
      username: (username?.trim() || trimmedEmail.split('@')[0] || 'user').slice(0, 64),
      email: trimmedEmail.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    const persisted = persistUser(nextUser);
    if (!persisted.success) return persisted;

    setUser(nextUser);
    return { success: true };
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string): Promise<AuthActionResult> => {
      const formError = validateAuthForm('register', { email, password, username });
      if (formError) {
        return { success: false, error: formError };
      }

      const nextUser: TheriaUser = {
        id: '1',
        username: username.trim(),
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      };

      const persisted = persistUser(nextUser);
      if (!persisted.success) return persisted;

      setUser(nextUser);
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    removeLocalStorageKey(STORAGE_KEYS.userSession);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
