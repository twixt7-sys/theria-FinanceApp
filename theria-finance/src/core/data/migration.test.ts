import { describe, expect, it } from 'vitest';
import { computeBalances } from '../domain/ledger';
import { UNACCOUNTED_STREAM_ID, emptyData } from '../domain/types';
import type { TheriaData } from '../domain/types';
import { isEffectivelyEmpty, mergeData, planMigration, remapIds } from './migration';

const guestData = (): TheriaData => ({
  accounts: [
    { id: '1', name: 'Wallet', initialBalance: 100, categoryId: '10', iconName: 'Wallet', color: '#0f0', createdAt: 'x' },
    { id: '2', name: 'Savings', initialBalance: 50, categoryId: '10', iconName: 'Pig', color: '#00f', createdAt: 'x' },
  ],
  categories: [
    { id: '10', name: 'Cash', scope: 'account', iconName: 'Wallet', color: '#0f0', createdAt: 'x' },
    { id: '11', name: 'Food', scope: 'stream', iconName: 'Cart', color: '#fa0', createdAt: 'x' },
  ],
  streams: [
    { id: UNACCOUNTED_STREAM_ID, name: 'Unaccounted', type: 'system', iconName: 'Alert', color: '#666', isSystem: true, createdAt: 'x' },
    { id: '20', name: 'Groceries', type: 'expense', iconName: 'Cart', color: '#fa0', categoryId: '11', createdAt: 'x' },
  ],
  records: [
    { id: '30', type: 'expense', amount: 25, fromAccountId: '1', streamId: '20', date: '2026-07-01', createdAt: 'x' },
    { id: '31', type: 'transfer', amount: 10, fromAccountId: '1', toAccountId: '2', streamId: UNACCOUNTED_STREAM_ID, date: '2026-07-02', createdAt: 'x' },
  ],
  budgets: [
    { id: '40', name: 'Food', streamId: '20', categoryId: '11', limit: 200, period: 'monthly', startDate: '2026-07-01', endDate: '2026-07-31', createdAt: 'x' },
  ],
  savings: [
    { id: '50', name: 'Trip', accountId: '2', target: 500, current: 50, note: '', color: '#0f0', photoUrl: '', iconName: 'Plane', period: 'yearly', startDate: 'x', endDate: 'y', createdAt: 'x' },
  ],
});

describe('isEffectivelyEmpty', () => {
  it('treats a fresh store as empty despite the system stream', () => {
    expect(isEffectivelyEmpty(emptyData())).toBe(true);
  });

  it('is not empty once the user has made anything', () => {
    expect(isEffectivelyEmpty(guestData())).toBe(false);
  });

  it('counts a user-created stream as data', () => {
    const data = emptyData();
    data.streams.push({ id: 's', name: 'Pay', type: 'income', iconName: 'X', color: '#0f0', createdAt: 'x' });
    expect(isEffectivelyEmpty(data)).toBe(false);
  });
});

describe('remapIds', () => {
  it('gives every item a new id', () => {
    const remapped = remapIds(guestData());
    expect(remapped.accounts.map((a) => a.id)).not.toContain('1');
    expect(remapped.records.map((r) => r.id)).not.toContain('30');
    expect(new Set(remapped.accounts.map((a) => a.id)).size).toBe(2);
  });

  it('keeps the system stream id, which code refers to by literal', () => {
    const remapped = remapIds(guestData());
    expect(remapped.streams.some((s) => s.id === UNACCOUNTED_STREAM_ID)).toBe(true);
  });

  it('rewrites every reference so the graph still resolves', () => {
    const source = guestData();
    const out = remapIds(source);

    const accountIds = new Set(out.accounts.map((a) => a.id));
    const streamIds = new Set(out.streams.map((s) => s.id));
    const categoryIds = new Set(out.categories.map((c) => c.id));

    out.accounts.forEach((a) => expect(categoryIds.has(a.categoryId)).toBe(true));
    out.streams.forEach((s) => s.categoryId && expect(categoryIds.has(s.categoryId)).toBe(true));
    out.records.forEach((r) => {
      expect(streamIds.has(r.streamId)).toBe(true);
      if (r.fromAccountId) expect(accountIds.has(r.fromAccountId)).toBe(true);
      if (r.toAccountId) expect(accountIds.has(r.toAccountId)).toBe(true);
    });
    out.budgets.forEach((b) => b.streamId && expect(streamIds.has(b.streamId)).toBe(true));
    out.savings.forEach((s) => expect(accountIds.has(s.accountId)).toBe(true));
  });

  it('preserves the ledger, which is the point of rewriting references', () => {
    const source = guestData();
    const before = computeBalances(source.accounts, source.records);
    const out = remapIds(source);
    const after = computeBalances(out.accounts, out.records);

    expect([...before.values()].sort()).toEqual([...after.values()].sort());
    // Wallet: 100 - 25 spent - 10 transferred out.
    expect([...after.values()]).toContain(65);
  });

  it('does not mutate its input', () => {
    const source = guestData();
    remapIds(source);
    expect(source.accounts[0].id).toBe('1');
  });
});

describe('mergeData', () => {
  it('keeps both sides and only one system stream', () => {
    const cloud = emptyData();
    cloud.accounts.push({ id: 'c1', name: 'Cloud', initialBalance: 5, categoryId: 'cc', iconName: 'W', color: '#0f0', createdAt: 'x' });

    const merged = mergeData(cloud, remapIds(guestData()));

    expect(merged.accounts).toHaveLength(3);
    expect(merged.streams.filter((s) => s.id === UNACCOUNTED_STREAM_ID)).toHaveLength(1);
  });
});

describe('planMigration', () => {
  it('adopts the cloud when this device has nothing', () => {
    expect(planMigration(emptyData(), guestData()).kind).toBe('adopt-cloud');
  });

  it('uploads when the account is empty', () => {
    expect(planMigration(guestData(), emptyData()).kind).toBe('upload');
  });

  it('asks the user when both sides have data', () => {
    expect(planMigration(guestData(), guestData()).kind).toBe('conflict');
  });

  it('adopts the cloud when both are empty, so nothing is written', () => {
    expect(planMigration(emptyData(), emptyData()).kind).toBe('adopt-cloud');
  });
});
