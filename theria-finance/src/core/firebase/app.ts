import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  ReCaptchaV3Provider,
  initializeAppCheck,
} from 'firebase/app-check';
import {
  appCheckDebugToken,
  firebaseConfig,
  isFirebaseConfigured,
  recaptchaSiteKey,
} from './config';

let app: FirebaseApp | null = null;
let appCheckStarted = false;

/** Null when the project is not configured — callers fall back to guest mode. */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
    startAppCheck(app);
  }
  return app;
}

/**
 * App Check attests that requests come from this app. With no backend of our
 * own it is the only thing protecting the Gemini quota, so it is worth having
 * even before enforcement is switched on in the console.
 */
function startAppCheck(instance: FirebaseApp): void {
  if (appCheckStarted || !recaptchaSiteKey) return;
  appCheckStarted = true;

  if (import.meta.env.DEV && appCheckDebugToken) {
    // Registered under App Check → your app → Manage debug tokens.
    (globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      appCheckDebugToken;
  }

  try {
    initializeAppCheck(instance, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    // A bad site key must not take the whole app down.
    console.warn('App Check failed to start; continuing without it.', error);
  }
}
