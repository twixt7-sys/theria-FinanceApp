import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import type { AuthActionResult } from '../auth/authResult';
import { authErrorMessage, shouldRetryWithRedirect, toTheriaUser } from '../auth/firebaseUser';
import type { TheriaUser } from '../auth/user';
import { validateAuthForm } from '../auth/validateAuthForm';
import { isFirebaseConfigured } from '../firebase/config';
import { getFirebaseAuth } from '../firebase/auth';

/**
 * `guest` is a full, supported state: Theria works signed-out with data in
 * localStorage. Signing in is an upgrade, not a gate.
 */
export type AuthStatus = 'initializing' | 'guest' | 'signedIn';

interface AuthContextType {
  status: AuthStatus;
  /** Null while a guest. */
  user: TheriaUser | null;
  /** True until the first auth state resolves; splash waits on this. */
  isLoading: boolean;
  /** False when no Firebase project is configured — sign-in is then unavailable. */
  canSignIn: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (username: string, email: string, password: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const notConfigured: AuthActionResult = {
  success: false,
  error: 'Sign-in is not set up yet. Add your Firebase config to .env.local.',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TheriaUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    isFirebaseConfigured ? 'initializing' : 'guest',
  );

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    // Completes a redirect sign-in started before the page reloaded.
    void getRedirectResult(auth).catch(() => {
      /* reported through onAuthStateChanged instead */
    });

    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toTheriaUser(firebaseUser) : null);
      setStatus(firebaseUser ? 'signedIn' : 'guest');
    });
  }, []);

  const login = useCallback(async (
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    const auth = getFirebaseAuth();
    if (!auth) return notConfigured;

    const formError = validateAuthForm('login', { email, password, username: '' });
    if (formError) return { success: false, error: formError };

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true };
    } catch (error) {
      return { success: false, error: authErrorMessage(error) };
    }
  }, []);

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
    ): Promise<AuthActionResult> => {
      const auth = getFirebaseAuth();
      if (!auth) return notConfigured;

      const formError = validateAuthForm('register', { email, password, username });
      if (formError) return { success: false, error: formError };

      try {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credential.user, { displayName: username.trim() });
        // onAuthStateChanged already fired with the pre-update profile.
        setUser(toTheriaUser(credential.user));
        return { success: true };
      } catch (error) {
        return { success: false, error: authErrorMessage(error) };
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    const auth = getFirebaseAuth();
    if (!auth) return notConfigured;

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error) {
      if (shouldRetryWithRedirect(error)) {
        // Resolves after the page comes back; nothing more to report here.
        await signInWithRedirect(auth, provider);
        return { success: true };
      }
      return { success: false, error: authErrorMessage(error) };
    }
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    setStatus('guest');
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      status,
      user,
      isLoading: status === 'initializing',
      canSignIn: isFirebaseConfigured,
      login,
      register,
      signInWithGoogle,
      logout,
    }),
    [status, user, login, register, signInWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
