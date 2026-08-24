import type { CollectionKey, TheriaData } from '../domain/types';

/** An item belonging to one collection. */
export type ItemOf<K extends CollectionKey> = TheriaData[K][number];

/**
 * The only seam between the app and where its data lives.
 *
 * Deliberately small: `put` is an upsert, so add and update share one path —
 * per-entity methods are what produced the old duplicated CRUD.
 */
export interface TheriaRepository {
  load(): Promise<TheriaData>;
  /** Live updates, when the backing store supports them (Firestore). */
  subscribe?(onChange: (data: TheriaData) => void): () => void;
  put<K extends CollectionKey>(collection: K, item: ItemOf<K>): Promise<void>;
  remove(collection: CollectionKey, id: string): Promise<void>;
  /** Wholesale replace — used by reset, populate and migration. */
  replaceAll(data: TheriaData): Promise<void>;
  /**
   * Resolves once every local write has been acknowledged by the backend.
   * Only implemented by stores that sync remotely (Firestore); a local-only
   * store has nothing to flush. Offline, the promise stays pending until the
   * connection returns — which is exactly the "is the cloud caught up?" signal
   * the sync-status layer waits on.
   */
  flush?(): Promise<void>;
}
