import { newId } from '../domain/ids';
import { COLLECTION_KEYS, UNACCOUNTED_STREAM_ID } from '../domain/types';
import type { TheriaData } from '../domain/types';

/**
 * True when the store holds nothing the user made. A fresh install still has
 * the system stream, so its presence alone does not count as data.
 */
export function isEffectivelyEmpty(data: TheriaData): boolean {
  const madeSomething =
    data.accounts.length > 0 ||
    data.categories.length > 0 ||
    data.records.length > 0 ||
    data.budgets.length > 0 ||
    data.savings.length > 0 ||
    data.streams.some((stream) => stream.id !== UNACCOUNTED_STREAM_ID);
  return !madeSomething;
}

/**
 * Gives every item a fresh id and rewrites the references that point at it.
 *
 * Guest ids came from Date.now() and would collide with anything already in
 * the cloud, so uploading without re-identifying risks silently overwriting
 * another device's data. The system stream keeps its id — code refers to it
 * by that literal.
 */
export function remapIds(data: TheriaData): TheriaData {
  const idMap = new Map<string, string>();
  for (const key of COLLECTION_KEYS) {
    for (const item of data[key]) {
      idMap.set(item.id, item.id === UNACCOUNTED_STREAM_ID ? item.id : newId());
    }
  }

  // Only rewrite ids we actually know; a dangling reference stays dangling
  // rather than being pointed at something unrelated.
  const ref = (id: string | undefined) => (id === undefined ? undefined : idMap.get(id) ?? id);

  return {
    accounts: data.accounts.map((account) => ({
      ...account,
      id: idMap.get(account.id)!,
      categoryId: ref(account.categoryId)!,
    })),
    streams: data.streams.map((stream) => ({
      ...stream,
      id: idMap.get(stream.id)!,
      categoryId: ref(stream.categoryId),
    })),
    categories: data.categories.map((category) => ({
      ...category,
      id: idMap.get(category.id)!,
    })),
    records: data.records.map((record) => ({
      ...record,
      id: idMap.get(record.id)!,
      fromAccountId: ref(record.fromAccountId),
      toAccountId: ref(record.toAccountId),
      streamId: ref(record.streamId)!,
    })),
    budgets: data.budgets.map((budget) => ({
      ...budget,
      id: idMap.get(budget.id)!,
      streamId: ref(budget.streamId),
      categoryId: ref(budget.categoryId),
    })),
    savings: data.savings.map((saving) => ({
      ...saving,
      id: idMap.get(saving.id)!,
      accountId: ref(saving.accountId)!,
    })),
  };
}

/** Union of both stores. Ids are disjoint after remapping, so this is safe. */
export function mergeData(cloud: TheriaData, incoming: TheriaData): TheriaData {
  const cloudHasSystemStream = cloud.streams.some((s) => s.id === UNACCOUNTED_STREAM_ID);
  return {
    accounts: [...cloud.accounts, ...incoming.accounts],
    categories: [...cloud.categories, ...incoming.categories],
    records: [...cloud.records, ...incoming.records],
    budgets: [...cloud.budgets, ...incoming.budgets],
    savings: [...cloud.savings, ...incoming.savings],
    // The system stream is a singleton, so never add a second copy.
    streams: [
      ...cloud.streams,
      ...incoming.streams.filter(
        (stream) => !(cloudHasSystemStream && stream.id === UNACCOUNTED_STREAM_ID),
      ),
    ],
  };
}

export type MigrationPlan =
  /** Nothing local worth keeping — just use the account's data. */
  | { kind: 'adopt-cloud' }
  /** Account is empty, so this device's data becomes its starting point. */
  | { kind: 'upload' }
  /** Both sides have data; only the user can say what they meant. */
  | { kind: 'conflict' };

export function planMigration(local: TheriaData, cloud: TheriaData): MigrationPlan {
  if (isEffectivelyEmpty(local)) return { kind: 'adopt-cloud' };
  if (isEffectivelyEmpty(cloud)) return { kind: 'upload' };
  return { kind: 'conflict' };
}
