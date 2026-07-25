import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';
import type { TheriaUser } from './user';

/** Firebase's user, reduced to what the app actually shows. */
export function toTheriaUser(user: User): TheriaUser {
  const fallbackName = user.email?.split('@')[0] || 'friend';
  return {
    id: user.uid,
    username: (user.displayName?.trim() || fallbackName).slice(0, 64),
    email: user.email ?? '',
    createdAt: user.metadata.creationTime ?? new Date().toISOString(),
  };
}

const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address does not look right.',
  'auth/user-disabled': 'That account has been disabled.',
  'auth/user-not-found': 'No account found for that email.',
  'auth/wrong-password': 'That email and password do not match.',
  'auth/invalid-credential': 'That email and password do not match.',
  'auth/email-already-in-use': 'That email already has an account — try signing in.',
  'auth/weak-password': 'Pick a password with at least 6 characters.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/network-request-failed': "Can't reach Firebase. Check your connection and try again.",
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/operation-not-allowed':
    'That sign-in method is not enabled for this project yet.',
  'auth/unauthorized-domain': 'This domain is not authorised for sign-in in the Firebase console.',
};

/** Turns a Firebase error into something worth showing a person. */
export function authErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? `Sign-in failed (${error.code}).`;
  }
  return 'Something went wrong. Please try again.';
}

/** Popups are blocked in some browsers and in installed PWAs — fall back to redirect. */
export function shouldRetryWithRedirect(error: unknown): boolean {
  return (
    error instanceof FirebaseError &&
    (error.code === 'auth/popup-blocked' ||
      error.code === 'auth/operation-not-supported-in-this-environment')
  );
}
