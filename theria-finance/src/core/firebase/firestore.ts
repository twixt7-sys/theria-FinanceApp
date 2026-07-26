import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getFirebaseApp } from './app';

let db: Firestore | null = null;

/** Null when Firebase is not configured. */
export function getDb(): Firestore | null {
  if (db) return db;
  const app = getFirebaseApp();
  if (!app) return null;

  db = initializeFirestore(app, {
    // IndexedDB cache: reads and writes work offline and sync on reconnect,
    // and multi-tab keeps two open tabs consistent.
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    // Optional domain fields are simply absent rather than rejected.
    ignoreUndefinedProperties: true,
  });
  return db;
}
