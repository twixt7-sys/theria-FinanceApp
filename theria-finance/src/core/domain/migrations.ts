import { COLLECTION_STORAGE_KEYS, STORAGE_KEYS } from '../constants/appStorage';
import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../lib/localStorageJson';
import { netEffectOnAccount } from './ledger';
import type { Account, Budget, LedgerRecord } from './types';

export const CURRENT_SCHEMA_VERSION = 2;

/** v1 stored a mutable `balance` on the account and a stale `spent` on the budget. */
type LegacyAccount = Omit<Account, 'initialBalance'> & {
  balance?: number;
  initialBalance?: number;
};
type LegacyBudget = Budget & { spent?: number };

/**
 * v1 → v2: balances and budget spend become derived.
 *
 * The stored `balance` already included every past record, so the anchor is
 * `balance - netEffectOfRecords` — that keeps displayed balances identical
 * across the upgrade instead of double-counting history.
 */
export function migrateAccountsToV2(
  accounts: LegacyAccount[],
  records: LedgerRecord[],
): Account[] {
  return accounts.map(({ balance, initialBalance, ...rest }) => ({
    ...rest,
    initialBalance:
      initialBalance ?? (balance ?? 0) - netEffectOnAccount(rest.id, records),
  }));
}

export function migrateBudgetsToV2(budgets: LegacyBudget[]): Budget[] {
  return budgets.map(({ spent: _spent, ...rest }) => rest);
}

/** Idempotent: runs once, then records the schema version. */
export function runLocalMigrations(): void {
  const version = readJsonFromLocalStorage<number>(STORAGE_KEYS.schemaVersion) ?? 1;
  if (version >= CURRENT_SCHEMA_VERSION) return;

  const records = readJsonFromLocalStorage<LedgerRecord[]>(COLLECTION_STORAGE_KEYS.records) ?? [];
  const accounts = readJsonFromLocalStorage<LegacyAccount[]>(COLLECTION_STORAGE_KEYS.accounts);
  const budgets = readJsonFromLocalStorage<LegacyBudget[]>(COLLECTION_STORAGE_KEYS.budgets);

  if (accounts) {
    writeJsonToLocalStorage(
      COLLECTION_STORAGE_KEYS.accounts,
      migrateAccountsToV2(accounts, records),
    );
  }
  if (budgets) {
    writeJsonToLocalStorage(COLLECTION_STORAGE_KEYS.budgets, migrateBudgetsToV2(budgets));
  }

  writeJsonToLocalStorage(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
}
