import { endOfDay, format, parseISO, startOfDay } from 'date-fns';
import { periodWindow, type AccountLedgerEntry } from '../../../core/domain/ledger';
import type { Period, Savings } from '../../../core/domain/types';

/**
 * Derived numbers for the account details page. Everything here works on an
 * account's ledger (see `accountLedger`), so each figure is a pure function
 * of the records — the same way balances are.
 */

/** The window the page looks at. Calendar-aligned, like the app's time filter. */
export type AccountRange = 'month' | 'quarter' | 'year' | 'all';

export interface AccountRangeOption {
  value: AccountRange;
  /** Selector label. */
  label: string;
  /** Standalone caption, e.g. a subtitle. */
  title: string;
  /** Reads inside a sentence: "grew by $40 this month" / "… so far". */
  phrase: string;
}

export const ACCOUNT_RANGES: readonly AccountRangeOption[] = [
  { value: 'month', label: 'Month', title: 'This month', phrase: 'this month' },
  { value: 'quarter', label: 'Quarter', title: 'This quarter', phrase: 'this quarter' },
  { value: 'year', label: 'Year', title: 'This year', phrase: 'this year' },
  { value: 'all', label: 'All time', title: 'All time', phrase: 'so far' },
];

export const rangeOption = (range: AccountRange): AccountRangeOption =>
  ACCOUNT_RANGES.find((option) => option.value === range) ?? ACCOUNT_RANGES[ACCOUNT_RANGES.length - 1];

/** Local calendar day as stored on records ('yyyy-MM-dd'). */
export const toDayKey = (date: Date): string => format(date, 'yyyy-MM-dd');

/** Older records may carry a full ISO timestamp; the first ten chars are the day either way. */
const dayKeyOf = (entry: AccountLedgerEntry): string => entry.record.date.slice(0, 10);

/** First and last day (inclusive) a range covers; null means no bounds at all. */
export interface RangeBounds {
  start: string;
  end: string;
}

const RANGE_PERIODS: Record<Exclude<AccountRange, 'all'>, Period> = {
  month: 'monthly',
  quarter: 'quarterly',
  year: 'yearly',
};

/** The calendar window around `now` — closed at both ends, so future-dated records stay out. */
export function rangeBounds(range: AccountRange, now: Date): RangeBounds | null {
  if (range === 'all') return null;
  const { start, end } = periodWindow(RANGE_PERIODS[range], now);
  return { start: toDayKey(start), end: toDayKey(end) };
}

/** Day keys sort as strings, so no Date parsing (or timezone drift) is needed. */
export const isInRange = (entry: AccountLedgerEntry, bounds: RangeBounds | null): boolean => {
  if (bounds === null) return true;
  const key = dayKeyOf(entry);
  return key >= bounds.start && key <= bounds.end;
};

/** Balance going into the range: the last close before it, else the starting balance. */
const openingBalance = (
  entries: AccountLedgerEntry[],
  initialBalance: number,
  bounds: RangeBounds | null,
): number => {
  let opening = initialBalance;
  if (bounds === null) return opening;
  for (const entry of entries) {
    if (dayKeyOf(entry) >= bounds.start) break;
    opening = entry.balanceAfter;
  }
  return opening;
};

/** Sums of many decimal amounts drift (0.1 + 0.2 − 0.3 ≠ 0); totals are money, so settle on cents. */
const toCents = (amount: number): number => Math.round(amount * 100) / 100;

export interface AccountFlowSummary {
  /** Balance going into the range. */
  opening: number;
  /** Balance after the range's last record. */
  closing: number;
  /** Income plus transfers in. */
  inflow: number;
  /** Expenses plus transfers out, as a positive number. */
  outflow: number;
  /** Net effect of balance corrections (`alter` records). */
  adjustments: number;
  /** closing − opening, in cents. */
  net: number;
  count: number;
}

/** Money in, money out and the net change for one account over a range. */
export function summarizeFlow(
  entries: AccountLedgerEntry[],
  initialBalance: number,
  bounds: RangeBounds | null,
): AccountFlowSummary {
  const opening = openingBalance(entries, initialBalance, bounds);
  let closing = opening;
  let inflow = 0;
  let outflow = 0;
  let adjustments = 0;
  let count = 0;

  for (const entry of entries) {
    if (!isInRange(entry, bounds)) continue;
    count += 1;
    closing = entry.balanceAfter;
    if (entry.record.type === 'alter') adjustments += entry.delta;
    else if (entry.delta > 0) inflow += entry.delta;
    else outflow -= entry.delta;
  }

  return {
    opening,
    closing,
    inflow: toCents(inflow),
    outflow: toCents(outflow),
    adjustments: toCents(adjustments),
    net: toCents(inflow - outflow + adjustments),
    count,
  };
}

export interface StreamShare {
  streamId: string;
  amount: number;
  count: number;
  /** Fraction (0–1) of the kind's total. */
  share: number;
}

/** Which streams the account's income came from, or its spending went to, biggest first. */
export function streamBreakdown(
  entries: AccountLedgerEntry[],
  kind: 'income' | 'expense',
): StreamShare[] {
  const totals = new Map<string, { amount: number; count: number }>();
  let total = 0;

  for (const { record, delta } of entries) {
    // A zero delta means the record names this account on the side it doesn't touch.
    if (record.type !== kind || delta === 0) continue;
    const amount = Math.abs(delta);
    const current = totals.get(record.streamId) ?? { amount: 0, count: 0 };
    totals.set(record.streamId, { amount: current.amount + amount, count: current.count + 1 });
    total += amount;
  }

  return [...totals.entries()]
    .map(([streamId, { amount, count }]) => ({
      streamId,
      amount,
      count,
      share: total > 0 ? amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface BalancePoint {
  /** Epoch ms — the chart plots on a time axis so quiet stretches keep their width. */
  time: number;
  balance: number;
}

/**
 * The balance line for the chart: the opening balance at the start of the
 * range, each active day's closing balance, then a flat run to today.
 */
export function balanceSeries(
  entries: AccountLedgerEntry[],
  initialBalance: number,
  bounds: RangeBounds | null,
  openedKey: string,
  now: Date,
): BalancePoint[] {
  const inRange = entries.filter((entry) => isInRange(entry, bounds));
  // All time begins when the account opened — or earlier, if records were backdated.
  const firstKey =
    bounds?.start ?? (inRange.length > 0 && dayKeyOf(inRange[0]) < openedKey ? dayKeyOf(inRange[0]) : openedKey);

  const points: BalancePoint[] = [
    { time: startOfDay(parseISO(firstKey)).getTime(), balance: openingBalance(entries, initialBalance, bounds) },
  ];

  for (const entry of inRange) {
    const time = endOfDay(parseISO(dayKeyOf(entry))).getTime();
    const last = points[points.length - 1];
    if (last.time === time) last.balance = entry.balanceAfter;
    else points.push({ time, balance: entry.balanceAfter });
  }

  const today = endOfDay(now).getTime();
  const last = points[points.length - 1];
  if (last.time < today) points.push({ time: today, balance: last.balance });

  return points;
}

export interface MonthGroup {
  /** 'yyyy-MM'. */
  key: string;
  /** 'October 2026'. */
  label: string;
  entries: AccountLedgerEntry[];
  inflow: number;
  outflow: number;
}

/** Splits an already-sorted (newest first) statement into calendar months. */
export function groupByMonth(entries: AccountLedgerEntry[]): MonthGroup[] {
  return entries.reduce<MonthGroup[]>((groups, entry) => {
    const key = dayKeyOf(entry).slice(0, 7);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: format(parseISO(`${key}-01`), 'MMMM yyyy'), entries: [], inflow: 0, outflow: 0 };
      groups.push(group);
    }
    group.entries.push(entry);
    if (entry.record.type !== 'alter') {
      if (entry.delta > 0) group.inflow = toCents(group.inflow + entry.delta);
      else group.outflow = toCents(group.outflow - entry.delta);
    }
    return groups;
  }, []);
}

/** Open savings goals/funds earmarked inside the account (deposits are earmark-only). */
export const linkedSavingsFor = (savings: Savings[], accountId: string): Savings[] =>
  savings.filter((item) => item.accountId === accountId && !item.resolved);
