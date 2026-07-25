import { describe, expect, it } from 'vitest';
import {
  computeBalances,
  computeBudgetSpent,
  netEffectOnAccount,
  periodWindow,
  sortRecords,
} from './ledger';
import type { Account, Budget, LedgerRecord } from './types';

const account = (id: string, initialBalance: number): Account => ({
  id,
  name: id,
  initialBalance,
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

const balanceOf = (accounts: Account[], records: LedgerRecord[], id: string) =>
  computeBalances(accounts, records).get(id);

describe('computeBalances', () => {
  const accounts = [account('a', 100), account('b', 50)];

  it('starts from initialBalance when there are no records', () => {
    expect(balanceOf(accounts, [], 'a')).toBe(100);
  });

  it('applies income to the destination account', () => {
    const records = [record({ id: 'r1', type: 'income', amount: 40, toAccountId: 'a' })];
    expect(balanceOf(accounts, records, 'a')).toBe(140);
  });

  it('applies expense to the source account', () => {
    const records = [record({ id: 'r1', type: 'expense', amount: 30, fromAccountId: 'a' })];
    expect(balanceOf(accounts, records, 'a')).toBe(70);
  });

  it('moves money on both sides of a transfer', () => {
    const records = [
      record({ id: 'r1', type: 'transfer', amount: 25, fromAccountId: 'a', toAccountId: 'b' }),
    ];
    const balances = computeBalances(accounts, records);
    expect(balances.get('a')).toBe(75);
    expect(balances.get('b')).toBe(75);
  });

  it('leaves the balance untouched when a transfer targets one account', () => {
    const records = [
      record({ id: 'r1', type: 'transfer', amount: 25, fromAccountId: 'a', toAccountId: 'a' }),
    ];
    expect(balanceOf(accounts, records, 'a')).toBe(100);
  });

  it('treats alter as an absolute correction, not a delta', () => {
    const records = [
      record({ id: 'r1', type: 'income', amount: 500, toAccountId: 'a' }),
      record({ id: 'r2', type: 'alter', amount: 42, toAccountId: 'a', date: '2026-01-11' }),
    ];
    expect(balanceOf(accounts, records, 'a')).toBe(42);
  });

  it('applies records after an alter on top of the corrected balance', () => {
    const records = [
      record({ id: 'r1', type: 'alter', amount: 42, toAccountId: 'a', date: '2026-01-11' }),
      record({ id: 'r2', type: 'expense', amount: 2, fromAccountId: 'a', date: '2026-01-12' }),
    ];
    expect(balanceOf(accounts, records, 'a')).toBe(40);
  });

  it('ignores records pointing at deleted accounts', () => {
    const records = [record({ id: 'r1', type: 'income', amount: 40, toAccountId: 'gone' })];
    expect(computeBalances(accounts, records).has('gone')).toBe(false);
    expect(balanceOf(accounts, records, 'a')).toBe(100);
  });

  // The bug this phase fixes: v1 mutated balances on add and never reversed them.
  it('restores the balance once a record is removed', () => {
    const records = [record({ id: 'r1', type: 'expense', amount: 30, fromAccountId: 'a' })];
    expect(balanceOf(accounts, records, 'a')).toBe(70);
    expect(balanceOf(accounts, [], 'a')).toBe(100);
  });

  it('reflects an edited amount without compensating writes', () => {
    const before = [record({ id: 'r1', type: 'expense', amount: 30, fromAccountId: 'a' })];
    const after = before.map((r) => ({ ...r, amount: 10 }));
    expect(balanceOf(accounts, after, 'a')).toBe(90);
  });
});

describe('sortRecords', () => {
  it('orders by date, then createdAt', () => {
    const records = [
      record({ id: 'late', type: 'income', date: '2026-02-01' }),
      record({ id: 'second', type: 'income', date: '2026-01-10', createdAt: '2026-01-10T09:00:00.000Z' }),
      record({ id: 'first', type: 'income', date: '2026-01-10', createdAt: '2026-01-10T08:00:00.000Z' }),
    ];
    expect(sortRecords(records).map((r) => r.id)).toEqual(['first', 'second', 'late']);
  });

  it('does not mutate its input', () => {
    const records = [
      record({ id: 'b', type: 'income', date: '2026-02-01' }),
      record({ id: 'a', type: 'income', date: '2026-01-01' }),
    ];
    sortRecords(records);
    expect(records.map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('netEffectOnAccount', () => {
  it('nets income, expense and both transfer legs', () => {
    const records = [
      record({ id: 'r1', type: 'income', amount: 100, toAccountId: 'a' }),
      record({ id: 'r2', type: 'expense', amount: 30, fromAccountId: 'a' }),
      record({ id: 'r3', type: 'transfer', amount: 20, fromAccountId: 'a', toAccountId: 'b' }),
      record({ id: 'r4', type: 'transfer', amount: 5, fromAccountId: 'b', toAccountId: 'a' }),
    ];
    expect(netEffectOnAccount('a', records)).toBe(55);
    expect(netEffectOnAccount('b', records)).toBe(15);
  });
});

describe('periodWindow', () => {
  it('bounds the month without leaking into the next one', () => {
    const { start, end } = periodWindow('monthly', new Date(2026, 0, 15));
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(0);
    expect(end.getDate()).toBe(31);
  });

  it('keeps December inside the same year', () => {
    const { start, end } = periodWindow('yearly', new Date(2026, 11, 31));
    expect(start.getFullYear()).toBe(2026);
    expect(end.getFullYear()).toBe(2026);
  });

  it('bounds a quarter to three months', () => {
    const { start, end } = periodWindow('quarterly', new Date(2026, 4, 20));
    expect(start.getMonth()).toBe(3);
    expect(end.getMonth()).toBe(5);
  });
});

describe('computeBudgetSpent', () => {
  const budget: Budget = {
    id: 'b1',
    streamId: 'groceries',
    name: 'Groceries',
    limit: 500,
    period: 'monthly',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  const now = new Date(2026, 0, 15);

  it('sums expenses on the stream inside the current period', () => {
    const records = [
      record({ id: 'r1', type: 'expense', amount: 30, streamId: 'groceries', date: '2026-01-05' }),
      record({ id: 'r2', type: 'expense', amount: 20, streamId: 'groceries', date: '2026-01-20' }),
    ];
    expect(computeBudgetSpent(budget, records, now)).toBe(50);
  });

  it('excludes other streams, other periods, and non-expenses', () => {
    const records = [
      record({ id: 'r1', type: 'expense', amount: 99, streamId: 'fuel', date: '2026-01-05' }),
      record({ id: 'r2', type: 'expense', amount: 99, streamId: 'groceries', date: '2025-12-31' }),
      record({ id: 'r3', type: 'income', amount: 99, streamId: 'groceries', date: '2026-01-05' }),
    ];
    expect(computeBudgetSpent(budget, records, now)).toBe(0);
  });

  it('is zero for a budget with no stream', () => {
    const records = [record({ id: 'r1', type: 'expense', amount: 30, date: '2026-01-05' })];
    expect(computeBudgetSpent({ ...budget, streamId: undefined }, records, now)).toBe(0);
  });
});
