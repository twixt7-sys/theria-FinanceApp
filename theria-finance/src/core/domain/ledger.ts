import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import type {
  Account,
  AccountView,
  Budget,
  BudgetView,
  LedgerRecord,
  Period,
} from './types';

/** Chronological order; `createdAt` breaks ties so same-day records stay stable. */
export const sortRecords = (records: LedgerRecord[]): LedgerRecord[] =>
  [...records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  );

/**
 * Replays every record over each account's `initialBalance`.
 *
 * Because balances are a pure function of records, editing or deleting a record
 * automatically reverses its effect — no compensating writes needed.
 */
export function computeBalances(
  accounts: Account[],
  records: LedgerRecord[],
): Map<string, number> {
  const balances = new Map(accounts.map((a) => [a.id, a.initialBalance]));

  // Records may reference deleted accounts; those are ignored rather than resurrected.
  const apply = (id: string | undefined, delta: number) => {
    if (id === undefined) return;
    const current = balances.get(id);
    if (current === undefined) return;
    balances.set(id, current + delta);
  };

  for (const record of sortRecords(records)) {
    switch (record.type) {
      case 'income':
        apply(record.toAccountId, record.amount);
        break;
      case 'expense':
        apply(record.fromAccountId, -record.amount);
        break;
      case 'transfer':
        apply(record.fromAccountId, -record.amount);
        apply(record.toAccountId, record.amount);
        break;
      case 'alter': {
        // An absolute correction: "this account is actually worth `amount` now."
        const id = record.toAccountId ?? record.fromAccountId;
        if (id !== undefined && balances.has(id)) balances.set(id, record.amount);
        break;
      }
    }
  }

  return balances;
}

/** Net effect of every record on one account — used to back-fill `initialBalance`. */
export function netEffectOnAccount(accountId: string, records: LedgerRecord[]): number {
  let net = 0;
  for (const record of records) {
    if (record.type === 'income' && record.toAccountId === accountId) net += record.amount;
    else if (record.type === 'expense' && record.fromAccountId === accountId) net -= record.amount;
    else if (record.type === 'transfer') {
      if (record.fromAccountId === accountId) net -= record.amount;
      if (record.toAccountId === accountId) net += record.amount;
    }
  }
  return net;
}

export const withBalances = (
  accounts: Account[],
  records: LedgerRecord[],
): AccountView[] => {
  const balances = computeBalances(accounts, records);
  return accounts.map((account) => ({ ...account, balance: balances.get(account.id) ?? 0 }));
};

/* ------------------------------- budgets -------------------------------- */

/** The calendar window a budget is currently tracking, so budgets self-refresh. */
export function periodWindow(period: Period, now: Date): { start: Date; end: Date } {
  switch (period) {
    case 'daily':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'weekly':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'monthly':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'quarterly':
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case 'yearly':
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}

/** Expenses on the budget's stream inside the current period. */
export function computeBudgetSpent(
  budget: Budget,
  records: LedgerRecord[],
  now: Date = new Date(),
): number {
  if (!budget.streamId) return 0;
  const { start, end } = periodWindow(budget.period, now);

  return records.reduce((total, record) => {
    if (record.type !== 'expense' || record.streamId !== budget.streamId) return total;
    const date = new Date(record.date);
    if (Number.isNaN(date.getTime()) || date < start || date > end) return total;
    return total + record.amount;
  }, 0);
}

export const withSpent = (
  budgets: Budget[],
  records: LedgerRecord[],
  now: Date = new Date(),
): BudgetView[] =>
  budgets.map((budget) => ({ ...budget, spent: computeBudgetSpent(budget, records, now) }));
