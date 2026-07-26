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

export const TERRY_SYSTEM_INSTRUCTION = `
You are Terry, the friendly money buddy inside Theria, a personal finance app.

Voice: warm, plain-spoken and brief. Two or three sentences unless asked for
more. Wrap key figures in **double asterisks** — the app renders those in bold.

Rules:
- Only use the figures in the snapshot you are given. Never invent numbers.
- If the snapshot does not answer the question, say so and suggest what the
  user could record to find out.
- You are not a licensed financial adviser. Offer general observations about
  the user's own data. Never recommend specific investments, products, or
  tax positions, and say so plainly if asked.
- Never claim to have taken an action in the app; you can only talk.
`.trim();

const money = (amount: number, currency: string) =>
  `${currency} ${amount.toFixed(2)}`;

const inWindow = (record: LedgerRecord, start: Date, end: Date) => {
  const date = new Date(record.date);
  return !Number.isNaN(date.getTime()) && date >= start && date <= end;
};

const sumOf = (records: LedgerRecord[], type: LedgerRecord['type']) =>
  records.filter((r) => r.type === type).reduce((total, r) => total + r.amount, 0);

/**
 * A compact plain-text picture of the user's finances, rebuilt for each
 * message. Deliberately a summary rather than raw records: the whole ledger
 * would blow the context window and cost far more tokens than it is worth.
 */
export function buildFinanceSummary(snapshot: TerrySnapshot, now: Date = new Date()): string {
  const { accounts, budgets, records, streams, savings, currency } = snapshot;

  if (accounts.length === 0 && records.length === 0) {
    return 'The user has not set up any accounts or recorded anything yet.';
  }

  const month = periodWindow('monthly', now);
  const thisMonth = records.filter((r) => inWindow(r, month.start, month.end));

  const quarterStart = new Date(now);
  quarterStart.setMonth(quarterStart.getMonth() - 3);
  const recent = records.filter((r) => inWindow(r, quarterStart, month.end));

  const streamName = new Map(streams.map((s) => [s.id, s.name]));
  const spendByStream = new Map<string, number>();
  for (const record of thisMonth) {
    if (record.type !== 'expense') continue;
    spendByStream.set(record.streamId, (spendByStream.get(record.streamId) ?? 0) + record.amount);
  }
  const topSpend = [...spendByStream.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, total]) => `  - ${streamName.get(id) ?? 'Unknown'}: ${money(total, currency)}`);

  const dates = records.map((r) => r.date).sort();
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const sections = [
    `Currency: ${currency}. Today: ${now.toISOString().slice(0, 10)}.`,
    '',
    `Net worth across ${accounts.length} account(s): ${money(totalBalance, currency)}`,
    ...accounts.slice(0, 12).map((a) => `  - ${a.name}: ${money(a.balance, currency)}`),
    '',
    'This month:',
    `  income ${money(sumOf(thisMonth, 'income'), currency)}, ` +
      `expenses ${money(sumOf(thisMonth, 'expense'), currency)}, ` +
      `${thisMonth.length} record(s)`,
    'Last 3 months:',
    `  income ${money(sumOf(recent, 'income'), currency)}, ` +
      `expenses ${money(sumOf(recent, 'expense'), currency)}`,
  ];

  if (topSpend.length) sections.push('', 'Top spending this month:', ...topSpend);

  if (budgets.length) {
    sections.push('', 'Budgets (spent of limit, this period):');
    for (const budget of budgets.slice(0, 10)) {
      const state = budget.spent > budget.limit ? ' — OVER' : '';
      sections.push(
        `  - ${budget.name}: ${money(budget.spent, currency)} of ${money(budget.limit, currency)}${state}`,
      );
    }
  }

  const activeSavings = savings.filter((s) => !s.resolved);
  if (activeSavings.length) {
    sections.push('', 'Savings goals:');
    for (const goal of activeSavings.slice(0, 10)) {
      const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
      sections.push(
        `  - ${goal.name}: ${money(goal.current, currency)} of ${money(goal.target, currency)} (${pct}%)`,
      );
    }
  }

  if (dates.length) {
    sections.push('', `${records.length} record(s) from ${dates[0]} to ${dates[dates.length - 1]}.`);
  }

  const summary = sections.join('\n');
  return summary.length > MAX_SUMMARY_CHARS
    ? `${summary.slice(0, MAX_SUMMARY_CHARS)}\n…(truncated)`
    : summary;
}
