import { describe, expect, it } from 'vitest';
import { computeBalances } from './ledger';
import { migrateAccountsToV2, migrateBudgetsToV2 } from './migrations';
import type { Budget, LedgerRecord } from './types';

const legacyAccount = (id: string, balance: number) => ({
  id,
  name: id,
  balance,
  categoryId: 'c1',
  iconName: 'Wallet',
  color: '#000',
  createdAt: '2026-01-01T00:00:00.000Z',
});

const record = (r: Partial<LedgerRecord> & { id: string; type: LedgerRecord['type'] }): LedgerRecord => ({
  amount: 0,
  streamId: 's1',
  date: '2026-01-10',
  createdAt: '2026-01-10T00:00:00.000Z',
  ...r,
});

describe('migrateAccountsToV2', () => {
  it('keeps the displayed balance identical across the upgrade', () => {
    // v1 showed 120: started at 100, then a +40 income and a -20 expense.
    const legacy = [legacyAccount('a', 120)];
    const records = [
      record({ id: 'r1', type: 'income', amount: 40, toAccountId: 'a' }),
      record({ id: 'r2', type: 'expense', amount: 20, fromAccountId: 'a' }),
    ];

    const migrated = migrateAccountsToV2(legacy, records);

    expect(migrated[0].initialBalance).toBe(100);
    expect(computeBalances(migrated, records).get('a')).toBe(120);
  });

  it('drops the legacy balance field', () => {
    const migrated = migrateAccountsToV2([legacyAccount('a', 10)], []);
    expect('balance' in migrated[0]).toBe(false);
  });

  it('is idempotent once initialBalance exists', () => {
    const records = [record({ id: 'r1', type: 'income', amount: 40, toAccountId: 'a' })];
    const once = migrateAccountsToV2([legacyAccount('a', 140)], records);
    const twice = migrateAccountsToV2(once, records);
    expect(twice[0].initialBalance).toBe(once[0].initialBalance);
  });

  it('treats a missing balance as zero', () => {
    const { balance: _balance, ...noBalance } = legacyAccount('a', 0);
    expect(migrateAccountsToV2([noBalance], [])[0].initialBalance).toBe(0);
  });
});

describe('migrateBudgetsToV2', () => {
  it('drops the stale stored spend', () => {
    const legacy: Budget & { spent: number } = {
      id: 'b1',
      name: 'Groceries',
      streamId: 's1',
      limit: 500,
      spent: 332,
      period: 'monthly',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    const [migrated] = migrateBudgetsToV2([legacy]);

    expect('spent' in migrated).toBe(false);
    expect(migrated.limit).toBe(500);
  });
});
