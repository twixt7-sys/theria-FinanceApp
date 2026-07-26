import { beforeEach, describe, expect, it } from 'vitest';
import type { AccountView, BudgetView, LedgerRecord } from '../../../core/domain/types';
import { MAX_SUMMARY_CHARS, buildFinanceSummary, type TerrySnapshot } from './terryContext';
import { DAILY_MESSAGE_LIMIT, canSend, messagesSentToday, recordMessageSent } from './quota';

const NOW = new Date(2026, 6, 15); // 15 July 2026

const account = (id: string, name: string, balance: number): AccountView => ({
  id,
  name,
  initialBalance: balance,
  balance,
  categoryId: 'c1',
  iconName: 'Wallet',
  color: '#0f0',
  createdAt: '2026-01-01T00:00:00.000Z',
});

const record = (r: Partial<LedgerRecord> & { id: string; type: LedgerRecord['type'] }): LedgerRecord => ({
  amount: 0,
  streamId: 's1',
  date: '2026-07-05',
  createdAt: '2026-07-05T00:00:00.000Z',
  ...r,
});

const snapshot = (over: Partial<TerrySnapshot> = {}): TerrySnapshot => ({
  currency: 'PHP',
  accounts: [account('a1', 'Wallet', 1200), account('a2', 'Savings', 5000)],
  streams: [
    { id: 's1', name: 'Groceries', type: 'expense', iconName: 'Cart', color: '#fa0', createdAt: 'x' },
    { id: 's2', name: 'Salary', type: 'income', iconName: 'Bag', color: '#0f0', createdAt: 'x' },
  ],
  records: [
    record({ id: 'r1', type: 'income', amount: 800, toAccountId: 'a1', streamId: 's2' }),
    record({ id: 'r2', type: 'expense', amount: 300, fromAccountId: 'a1', streamId: 's1' }),
  ],
  budgets: [],
  savings: [],
  ...over,
});

const parse = (input: TerrySnapshot, now = NOW) => JSON.parse(buildFinanceSummary(input, now));

describe('buildFinanceSummary', () => {
  it('emits parseable JSON so the model reads fields, not prose', () => {
    expect(() => parse(snapshot())).not.toThrow();
  });

  it('reports net worth and the month totals as numbers', () => {
    const data = parse(snapshot());
    expect(data.currency).toBe('PHP');
    expect(data.netWorth).toBe(6200); // 1200 + 5000
    expect(data.thisMonth).toEqual({ income: 800, expenses: 300, records: 2 });
  });

  it('names the top spending streams rather than dumping records', () => {
    const data = parse(snapshot());
    expect(data.topSpendingThisMonth).toEqual([{ stream: 'Groceries', amount: 300 }]);
    expect(JSON.stringify(data)).not.toContain('"r2"');
  });

  it('excludes records outside the current month from month totals', () => {
    const data = parse(
      snapshot({
        records: [record({ id: 'old', type: 'expense', amount: 999, streamId: 's1', date: '2026-01-04' })],
      }),
    );
    expect(data.thisMonth.expenses).toBe(0);
  });

  it('flags a budget that is over its limit', () => {
    const budget: BudgetView = {
      id: 'b1',
      name: 'Groceries',
      streamId: 's1',
      limit: 200,
      spent: 300,
      period: 'monthly',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      createdAt: 'x',
    };
    expect(parse(snapshot({ budgets: [budget] })).budgets[0].overLimit).toBe(true);
  });

  it('rounds to cents so the model is never handed float noise', () => {
    const data = parse(snapshot({ accounts: [account('a1', 'Wallet', 0.1 + 0.2)] }));
    expect(data.netWorth).toBe(0.3);
  });

  it('marks an untouched app rather than reporting empty totals', () => {
    const data = parse(snapshot({ accounts: [], records: [] }));
    expect(data.setUp).toBe(false);
    expect(data.note).toMatch(/not added any accounts/);
  });

  it('keeps headline totals when a large ledger forces trimming', () => {
    const many = Array.from({ length: 5000 }, (_, i) =>
      record({ id: `r${i}`, type: 'expense', amount: 1, streamId: 's1' }),
    );
    const summary = buildFinanceSummary(snapshot({ records: many }), NOW);
    expect(summary.length).toBeLessThanOrEqual(MAX_SUMMARY_CHARS);
    // Trimming drops rows, never the aggregates.
    expect(summary).toContain('"netWorth"');
    expect(summary).toContain('"thisMonth"');
  });
});

describe('canSend', () => {
  beforeEach(() => localStorage.clear());

  it('allows a first message', () => {
    expect(canSend({ now: NOW, lastSentAt: null, online: true }).allowed).toBe(true);
  });

  it('refuses while offline, and says the app still works', () => {
    const verdict = canSend({ now: NOW, lastSentAt: null, online: false });
    expect(verdict.allowed).toBe(false);
    if (!verdict.allowed) {
      expect(verdict.reason).toBe('offline');
      expect(verdict.message).toMatch(/offline/i);
    }
  });

  it('refuses a burst inside the minimum gap', () => {
    const verdict = canSend({ now: NOW, lastSentAt: NOW.getTime() - 500, online: true });
    expect(verdict.allowed).toBe(false);
    if (!verdict.allowed) expect(verdict.reason).toBe('too-fast');
  });

  it('allows again once the gap has passed', () => {
    expect(canSend({ now: NOW, lastSentAt: NOW.getTime() - 5000, online: true }).allowed).toBe(true);
  });

  it('refuses once the daily allowance is spent', () => {
    for (let i = 0; i < DAILY_MESSAGE_LIMIT; i += 1) recordMessageSent(NOW);
    const verdict = canSend({ now: NOW, lastSentAt: null, online: true });
    expect(verdict.allowed).toBe(false);
    if (!verdict.allowed) expect(verdict.reason).toBe('daily-limit');
  });

  it('counts per day, so tomorrow starts fresh', () => {
    recordMessageSent(NOW);
    expect(messagesSentToday(NOW)).toBe(1);
    expect(messagesSentToday(new Date(2026, 6, 16))).toBe(0);
  });
});
