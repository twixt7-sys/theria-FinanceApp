import { COLLECTION_STORAGE_KEYS } from '../constants/appStorage';
import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../lib/localStorageJson';
import { runLocalMigrations } from '../domain/migrations';
import { COLLECTION_KEYS, emptyData } from '../domain/types';
import type { CollectionKey, TheriaData } from '../domain/types';
import type { ItemOf, TheriaRepository } from './repository';

const readCollection = <K extends CollectionKey>(key: K): TheriaData[K] | null =>
  readJsonFromLocalStorage<TheriaData[K]>(COLLECTION_STORAGE_KEYS[key]);

const writeCollection = <K extends CollectionKey>(key: K, value: TheriaData[K]): void => {
  writeJsonToLocalStorage(COLLECTION_STORAGE_KEYS[key], value);
};

/** localStorage-backed store — the guest (signed-out) experience. */
export function createLocalRepository(): TheriaRepository {
  const readAll = (): TheriaData => {
    const fallback = emptyData();
    return COLLECTION_KEYS.reduce((data, key) => {
      const stored = readCollection(key);
      // A missing key means "never saved"; an empty array is a real, saved value.
      if (stored) Object.assign(data, { [key]: stored });
      return data;
    }, fallback);
  };

  return {
    async load() {
      // Corrupt or v1 data is repaired before anything reads it.
      runLocalMigrations();
      return readAll();
    },

    async put<K extends CollectionKey>(collection: K, item: ItemOf<K>) {
      const items = (readCollection(collection) ?? []) as ItemOf<K>[];
      const index = items.findIndex((existing) => existing.id === item.id);
      if (index === -1) items.push(item);
      else items[index] = item;
      writeCollection(collection, items as TheriaData[K]);
    },

    async remove(collection, id) {
      const items = readCollection(collection) ?? [];
      writeCollection(
        collection,
        items.filter((item) => item.id !== id) as TheriaData[typeof collection],
      );
    },

    async replaceAll(data) {
      COLLECTION_KEYS.forEach((key) => writeCollection(key, data[key]));
    },
  };
}
