import { describe, expect, it } from 'vitest';
import { endOfDay, startOfDay } from 'date-fns';
import { accountLedger } from '../../../core/domain/ledger';
import type { Account, LedgerRecord, Savings } from '../../../core/domain/types';
import {
  balanceSeries,
  groupByMonth,
  linkedSavingsFor,
  rangeStartKey,
  summarizeFlow,
  streamBreakdown,
} from './accountInsights';

const account: Account = {
  id: 'a',
  name: 'Wallet',
  initialBalance: 100,
  categoryId: 'c1',
  iconName: 'Wallet',
  color: '#000',
  createdAt: '2026-01-01T12:00:00.000Z',
};

const record = (r: Partial<LedgerRecord> & { id: string; type: LedgerRecord['type'] }): LedgerRecord => ({
  amount: 0,
  streamId: 's1',
  date: '2026-01-10',
  createdAt: '2026-01-10T00:00:00.000Z',
  ...r,
});

const records = [
  record({ id: 'jan-in', type: 'income', amount: 50, toAccountId: 'a', streamId: 'salary', date: '2026-01-05' }),
  record({ id: 'feb-out', type: 'expense', amount: 20, fromAccountId: 'a', streamId: 'food', date: '2026-02-03' }),
  record({ id: 'feb-out-2', type: 'expense', amount: 10, fromAccountId: 'a', streamId: 'fuel', date: '2026-02-03' }),
  record({ id: 'feb-xfer', type: 'transfer', amount: 15, fromAccountId: 'a', toAccountId: 'b', date: '2026-02-10' }),
  record({ id: 'feb-fix', type: 'alter', amount: 200, toAccountId: 'a', date: '2026-02-20' }),
  record({ id: 'feb-out-3', type: 'expense', amount: 30, fromAccountId: 'a', streamId: 'food', date: '2026-02-21' }),
];
const entries = accountLedger(account, records);
const FEB = '2026-02-01';

describe('rangeStartKey', () => {
  const now = new Date(2026, 4, 20);

  it('aligns each range to the calendar', () => {
    expect(rangeStartKey('month', now)).toBe('2026-05-01');
    expect(rangeStartKey('quarter', now)).toBe('2026-04-01');
    expect(rangeStartKey('year', now)).toBe('2026-01-01');
  });

  it('has no start for all time', () => {
    expect(rangeStartKey('all', now)).toBeNull();
  });
});

describe('summarizeFlow', () => {
  it('opens on the balance carried in from before the range', () => {
    const summary = summarizeFlow(entries, account.initialBalance, FEB);
    expect(summary.opening).toBe(150);
    expect(summary.closing).toBe(170);
    expect(summary.count).toBe(5);
  });

  it('counts transfers as money moving, and corrections separately', () => {
    const summary = summarizeFlow(entries, account.initialBalance, FEB);
    expect(summary.inflow).toBe(0);
    expect(summary.outflow).toBe(75);
    expect(summary.adjustments).toBe(95);
    expect(summary.net).toBe(summary.closing - summary.opening);
  });

  it('starts from the initial balance over all time', () => {
    const summary = summarizeFlow(entries, account.initialBalance, null);
    expect(summary.opening).toBe(100);
    expect(summary.inflow).toBe(50);
    expect(summary.net).toBe(70);
  });

  it('holds the balance steady over an empty range', () => {
    const summary = summarizeFlow(entries, account.initialBalance, '2026-03-01');
    expect(summary).toMatchObject({ opening: 170, closing: 170, net: 0, count: 0 });
  });
});

describe('streamBreakdown', () => {
  it('totals each stream and ranks the biggest first', () => {
    const shares = streamBreakdown(entries, 'expense');
    expect(shares.map((s) => s.streamId)).toEqual(['food', 'fuel']);
    expect(shares[0]).toMatchObject({ amount: 50, count: 2, share: 50 / 60 });
  });

  it('ignores transfers and other kinds', () => {
    expect(streamBreakdown(entries, 'income').map((s) => s.streamId)).toEqual(['salary']);
  });
});

describe('balanceSeries', () => {
  const now = new Date(2026, 1, 25);

  it('opens at the start of the range and closes each active day', () => {
    const points = balanceSeries(entries, account.initialBalance, FEB, '2026-01-01', now);
    expect(points[0]).toEqual({ time: startOfDay(new Date(2026, 1, 1)).getTime(), balance: 150 });
    // Two expenses on Feb 3 collapse into that day's close.
    expect(points[1]).toEqual({ time: endOfDay(new Date(2026, 1, 3)).getTime(), balance: 120 });
    expect(points.map((p) => p.balance)).toEqual([150, 120, 105, 200, 170, 170]);
  });

  it('runs flat to today after the last record', () => {
    const points = balanceSeries(entries, account.initialBalance, FEB, '2026-01-01', now);
    expect(points.at(-1)).toEqual({ time: endOfDay(now).getTime(), balance: 170 });
  });

  it('starts all time at the earlier of opening day and the first record', () => {
    const backdated = accountLedger(account, [
      record({ id: 'old', type: 'income', amount: 5, toAccountId: 'a', date: '2025-12-01' }),
    ]);
    const points = balanceSeries(backdated, account.initialBalance, null, '2026-01-01', now);
    expect(points[0].time).toBe(startOfDay(new Date(2025, 11, 1)).getTime());
    expect(points[0].balance).toBe(100);
  });

  it('draws a flat line for an account with no records', () => {
    const points = balanceSeries([], account.initialBalance, null, '2026-02-25', now);
    expect(points.map((p) => p.balance)).toEqual([100, 100]);
  });
});

describe('groupByMonth', () => {
  it('splits a newest-first statement into months with their own in/out', () => {
    const groups = groupByMonth([...entries].reverse());
    expect(groups.map((g) => g.key)).toEqual(['2026-02', '2026-01']);
    expect(groups[0].label).toBe('February 2026');
    expect(groups[0]).toMatchObject({ inflow: 0, outflow: 75 });
    expect(groups[1]).toMatchObject({ inflow: 50, outflow: 0 });
  });
});

describe('linkedSavingsFor', () => {
  const saving = (id: string, accountId: string, resolved?: boolean) =>
    ({ id, accountId, resolved }) as Savings;

  it('keeps only open savings held in the account', () => {
    const savings = [saving('s1', 'a'), saving('s2', 'b'), saving('s3', 'a', true)];
    expect(linkedSavingsFor(savings, 'a').map((s) => s.id)).toEqual(['s1']);
  });
});
