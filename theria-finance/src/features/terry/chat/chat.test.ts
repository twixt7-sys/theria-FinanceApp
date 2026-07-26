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

describe('buildFinanceSummary', () => {
  it('reports balances and the month totals', () => {
    const summary = buildFinanceSummary(snapshot(), NOW);
    expect(summary).toContain('PHP 6200.00'); // 1200 + 5000
    expect(summary).toContain('income PHP 800.00');
    expect(summary).toContain('expenses PHP 300.00');
  });

  it('names the top spending streams rather than dumping records', () => {
    const summary = buildFinanceSummary(snapshot(), NOW);
    expect(summary).toContain('Groceries: PHP 300.00');
    expect(summary).not.toContain('r2');
  });

  it('excludes records outside the current month from month totals', () => {
    const summary = buildFinanceSummary(
      snapshot({
        records: [record({ id: 'old', type: 'expense', amount: 999, streamId: 's1', date: '2026-01-04' })],
      }),
      NOW,
    );
    expect(summary).toContain('expenses PHP 0.00');
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
    expect(buildFinanceSummary(snapshot({ budgets: [budget] }), NOW)).toContain('OVER');
  });

  it('says so plainly when there is nothing to talk about', () => {
    const summary = buildFinanceSummary(snapshot({ accounts: [], records: [] }), NOW);
    expect(summary).toContain('not set up any accounts');
  });

  it('stays within the prompt budget even with a large ledger', () => {
    const many = Array.from({ length: 5000 }, (_, i) =>
      record({ id: `r${i}`, type: 'expense', amount: 1, streamId: 's1' }),
    );
    const summary = buildFinanceSummary(snapshot({ records: many }), NOW);
    expect(summary.length).toBeLessThanOrEqual(MAX_SUMMARY_CHARS + 20);
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
