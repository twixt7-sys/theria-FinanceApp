import { periodWindow } from '../../../core/domain/ledger';
import type {
  AccountView,
  BudgetView,
  LedgerRecord,
  Savings,
  Stream,
} from '../../../core/domain/types';

export interface TerrySnapshot {
  accounts: AccountView[];
  budgets: BudgetView[];
  records: LedgerRecord[];
  streams: Stream[];
  savings: Savings[];
  currency: string;
}

/** Keeps the prompt well inside free-tier token limits. */
export const MAX_SUMMARY_CHARS = 4000;

/** How many rows of each list survive trimming, longest-tail first. */
const LIMITS = { accounts: 12, topSpending: 5, budgets: 10, savings: 10 } as const;

export const TERRY_SYSTEM_INSTRUCTION = `
You are Terry, the friendly money buddy inside Theria, a personal finance app.

You will be given a JSON snapshot of the user's finances, then their question.
All amounts are in the snapshot's currency.

Voice: warm, plain-spoken, brief — two or three sentences unless more is
asked for. Wrap key figures in **double asterisks**; the app renders them bold.
Reply in the same language the user writes in.

Rules:
- Answer only from the snapshot. Never invent or estimate a number that is
  not there. If a figure is missing, say what the user could record to get it.
- Write the answer only. Never describe your own tone, plan, or instructions,
  and never mention the snapshot or that you were given data.
- You are not a licensed financial adviser. Comment on the user's own figures,
  but never recommend specific investments, products or tax positions — say so
  plainly if asked.
- Never claim to have changed anything in the app; you can only talk.
`.trim();

const round = (value: number) => Math.round(value * 100) / 100;

const inWindow = (record: LedgerRecord, start: Date, end: Date) => {
  const date = new Date(record.date);
  return !Number.isNaN(date.getTime()) && date >= start && date <= end;
};

const totalOf = (records: LedgerRecord[], type: LedgerRecord['type']) =>
  round(records.filter((r) => r.type === type).reduce((sum, r) => sum + r.amount, 0));

/**
 * A compact JSON picture of the user's finances, rebuilt for every message.
 *
 * JSON rather than prose because the model quotes labelled fields far more
 * reliably than it re-reads a paragraph, and it costs fewer tokens. It stays a
 * summary, never the raw ledger: the whole thing would not fit the context
 * window and would cost more than it is worth.
 */
export function buildFinanceSummary(snapshot: TerrySnapshot, now: Date = new Date()): string {
  const { accounts, budgets, records, streams, savings, currency } = snapshot;

  if (accounts.length === 0 && records.length === 0) {
    return JSON.stringify({
      currency,
      today: now.toISOString().slice(0, 10),
      setUp: false,
      note: 'The user has not added any accounts or recorded anything yet.',
    });
  }

  const month = periodWindow('monthly', now);
  const thisMonth = records.filter((r) => inWindow(r, month.start, month.end));

  const quarterStart = new Date(now);
  quarterStart.setMonth(quarterStart.getMonth() - 3);
  const lastQuarter = records.filter((r) => inWindow(r, quarterStart, month.end));

  const streamName = new Map(streams.map((s) => [s.id, s.name]));
  const spendByStream = new Map<string, number>();
  for (const record of thisMonth) {
    if (record.type !== 'expense') continue;
    spendByStream.set(record.streamId, (spendByStream.get(record.streamId) ?? 0) + record.amount);
  }

  const dates = records.map((r) => r.date).sort();

  const payload = {
    currency,
    today: now.toISOString().slice(0, 10),
    setUp: true,
    netWorth: round(accounts.reduce((sum, a) => sum + a.balance, 0)),
    accounts: accounts.slice(0, LIMITS.accounts).map((a) => ({
      name: a.name,
      balance: round(a.balance),
    })),
    thisMonth: {
      income: totalOf(thisMonth, 'income'),
      expenses: totalOf(thisMonth, 'expense'),
      records: thisMonth.length,
    },
    last3Months: {
      income: totalOf(lastQuarter, 'income'),
      expenses: totalOf(lastQuarter, 'expense'),
    },
    topSpendingThisMonth: [...spendByStream.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, LIMITS.topSpending)
      .map(([id, amount]) => ({ stream: streamName.get(id) ?? 'Unknown', amount: round(amount) })),
    budgets: budgets.slice(0, LIMITS.budgets).map((b) => ({
      name: b.name,
      spent: round(b.spent),
      limit: round(b.limit),
      period: b.period,
      overLimit: b.spent > b.limit,
    })),
    savingsGoals: savings
      .filter((s) => !s.resolved)
      .slice(0, LIMITS.savings)
      .map((s) => ({
        name: s.name,
        current: round(s.current),
        target: round(s.target),
        percent: s.target > 0 ? Math.round((s.current / s.target) * 100) : 0,
      })),
    ledger: {
      totalRecords: records.length,
      firstRecord: dates[0] ?? null,
      lastRecord: dates[dates.length - 1] ?? null,
    },
  };

  const json = JSON.stringify(payload);
  if (json.length <= MAX_SUMMARY_CHARS) return json;

  // Too large: drop the per-row detail but keep every total intact, so the
  // headline figures are never the thing that gets cut.
  return JSON.stringify({
    ...payload,
    accounts: payload.accounts.slice(0, 5),
    budgets: payload.budgets.slice(0, 5),
    savingsGoals: payload.savingsGoals.slice(0, 5),
    trimmed: true,
  }).slice(0, MAX_SUMMARY_CHARS);
}
