import type { CurrencyCode } from '../../shared/lib/currencies';

/** Stored shape. The live balance is derived from records — see `computeBalances`. */
export interface Account {
  id: string;
  name: string;
  /** Balance before any record is applied. Not the balance shown in the UI. */
  initialBalance: number;
  categoryId: string;
  iconName: string;
  color: string;
  isSavings?: boolean;
  createdAt: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  cardType?: 'debit' | 'credit' | 'checking' | 'savings';
  currency?: CurrencyCode;
  /** Visual treatment of the account card. Older data defaults to 'card'. */
  displayStyle?: 'card' | 'wallet' | 'vault';
}

export interface Stream {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'system';
  iconName: string;
  color: string;
  isSystem?: boolean;
  categoryId?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  scope: 'account' | 'stream';
  iconName: string;
  color: string;
  note?: string;
  customSvg?: string;
  createdAt: string;
}

export type RecordType = 'income' | 'expense' | 'transfer' | 'alter';

/**
 * The single source of truth for balance changes.
 *
 * `alter` sets the target account's running balance to `amount` as of `date`,
 * rather than applying a delta — it is how a user says "my real balance is X".
 */
export interface LedgerRecord {
  id: string;
  type: RecordType;
  amount: number;
  fromAccountId?: string;
  toAccountId?: string;
  streamId: string;
  note?: string;
  date: string;
  /** Optional time of day as 'HH:MM' (24h). Absent on older records. */
  time?: string;
  createdAt: string;
}

export type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/** Stored shape. Spend is derived from records — see `computeBudgetSpent`. */
export interface Budget {
  id: string;
  streamId?: string;
  name: string;
  categoryId?: string;
  limit: number;
  period: Period;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Savings {
  id: string;
  name: string;
  accountId: string;
  target: number;
  current: number;
  note: string;
  color: string;
  photoUrl: string;
  iconName: string;
  period: Period;
  startDate: string;
  endDate: string;
  createdAt: string;
  /** 'savings' = open-ended safety net, 'goal' = a specific thing to buy or do. Older data defaults to 'goal'. */
  kind?: 'savings' | 'goal';
  /** Emoji shown as the vault's picture on cards (photoUrl wins when set). */
  emoji?: string;
  /** Archived once the goal/fund is resolved; hidden from the active lists. */
  resolved?: boolean;
}

/* --- View shapes: stored data plus its derived fields, as handed to the UI --- */

export type AccountView = Account & { balance: number };
export type BudgetView = Budget & { spent: number };

/** Every collection the app persists, keyed by name. */
export interface TheriaData {
  accounts: Account[];
  streams: Stream[];
  categories: Category[];
  records: LedgerRecord[];
  budgets: Budget[];
  savings: Savings[];
}

export type CollectionKey = keyof TheriaData;

export const COLLECTION_KEYS: CollectionKey[] = [
  'accounts',
  'streams',
  'categories',
  'records',
  'budgets',
  'savings',
];

/** The system stream that absorbs otherwise-unattributed movement. */
export const UNACCOUNTED_STREAM_ID = 'unaccounted';

export const createUnaccountedStream = (): Stream => ({
  id: UNACCOUNTED_STREAM_ID,
  name: 'Unaccounted',
  type: 'system',
  iconName: 'AlertCircle',
  color: '#6B7280',
  isSystem: true,
  createdAt: new Date().toISOString(),
});

export const emptyData = (): TheriaData => ({
  accounts: [],
  streams: [createUnaccountedStream()],
  categories: [],
  records: [],
  budgets: [],
  savings: [],
});
