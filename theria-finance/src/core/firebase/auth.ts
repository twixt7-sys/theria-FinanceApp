import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirebaseApp } from './app';

let auth: Auth | null = null;

/** Null when Firebase is not configured. */
export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const app = getFirebaseApp();
  if (!app) return null;

  auth = getAuth(app);
  // Keeps the session across reloads and offline launches of the installed PWA.
  void setPersistence(auth, browserLocalPersistence).catch(() => {
    /* falls back to the default persistence */
  });
  return auth;
}
