import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { COLLECTION_KEYS, emptyData } from '../domain/types';
import type { CollectionKey, TheriaData } from '../domain/types';
import type { ItemOf, TheriaRepository } from './repository';

/** Firestore caps a batch at 500 operations. */
const BATCH_LIMIT = 450;

const pathTo = (uid: string, key: CollectionKey) => `users/${uid}/${key}`;

/**
 * Documents are trusted to match the domain types. They are only ever written
 * by this app under rules that scope them to their owner, so the cast marks an
 * unvalidated boundary rather than hiding one.
 */
function setCollection<K extends CollectionKey>(
  target: TheriaData,
  key: K,
  docs: unknown[],
): void {
  target[key] = docs as TheriaData[K];
}

async function readAll(db: Firestore, uid: string): Promise<TheriaData> {
  const data = emptyData();
  await Promise.all(
    COLLECTION_KEYS.map(async (key) => {
      const snapshot = await getDocs(collection(db, pathTo(uid, key)));
      // An untouched account has no documents; keep the seeded defaults.
      if (snapshot.empty) return;
      setCollection(data, key, snapshot.docs.map((d) => d.data()));
    }),
  );
  return data;
}

/**
 * Cloud store for a signed-in user, scoped to users/{uid}. Writes are
 * fire-and-forget: the SDK's cache applies them locally at once and flushes
 * them when the network returns, and the snapshot listener echoes the result.
 */
export function createFirestoreRepository(db: Firestore, uid: string): TheriaRepository {
  return {
    async load() {
      return readAll(db, uid);
    },

    subscribe(onChange) {
      // One listener per collection, merged into a single snapshot of state.
      const latest = emptyData();
      const seen = new Set<CollectionKey>();

      const unsubscribes = COLLECTION_KEYS.map((key) =>
        onSnapshot(
          collection(db, pathTo(uid, key)),
          (snapshot) => {
            setCollection(latest, key, snapshot.docs.map((d) => d.data()));
            seen.add(key);
            // Wait for the first response from every collection so the UI never
            // renders a half-loaded account.
            if (seen.size === COLLECTION_KEYS.length) onChange({ ...latest });
          },
          (error) => {
            // Without this handler the SDK reports the rejection as uncaught.
            // A denied listener means rules are wrong or not deployed; log it
            // once rather than letting it surface as noise on every snapshot.
            console.error(`[theria] sync listener for ${key} stopped:`, error.code);
          },
        ),
      );

      return () => unsubscribes.forEach((stop) => stop());
    },

    async put<K extends CollectionKey>(key: K, item: ItemOf<K>) {
      await setDoc(doc(db, pathTo(uid, key), item.id), item);
    },

    async remove(key, id) {
      await deleteDoc(doc(db, pathTo(uid, key), id));
    },

    async replaceAll(data) {
      const existing = await readAll(db, uid);

      const operations: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
      for (const key of COLLECTION_KEYS) {
        const keeping = new Set(data[key].map((item) => item.id));
        for (const stale of existing[key]) {
          if (!keeping.has(stale.id)) {
            operations.push((batch) => batch.delete(doc(db, pathTo(uid, key), stale.id)));
          }
        }
        for (const item of data[key]) {
          operations.push((batch) => batch.set(doc(db, pathTo(uid, key), item.id), item));
        }
      }

      for (let i = 0; i < operations.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        operations.slice(i, i + BATCH_LIMIT).forEach((apply) => apply(batch));
        await batch.commit();
      }
    },
  };
}
