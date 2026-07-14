import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Account {
  id: string;
  name: string;
  balance: number;
  categoryId: string;
  iconName: string;
  color: string;
  isSavings?: boolean;
  createdAt: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  cardType?: 'debit' | 'credit' | 'checking' | 'savings';
  currency?: string;
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

export interface Record {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'alter';
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

export interface Budget {
  id: string;
  streamId?: string;
  name: string;
  categoryId?: string;
  limit: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
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
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  createdAt: string;
  /** 'savings' = open-ended safety net, 'goal' = a specific thing to buy or do. Older data defaults to 'goal'. */
  kind?: 'savings' | 'goal';
  /** Emoji shown as the vault's picture on cards (photoUrl wins when set). */
  emoji?: string;
  /** Archived once the goal/fund is resolved (achieved or closed); hidden from the active lists. */
  resolved?: boolean;
}

interface DataContextType {
  accounts: Account[];
  streams: Stream[];
  categories: Category[];
  records: Record[];
  budgets: Budget[];
  savings: Savings[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Account;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addStream: (stream: Omit<Stream, 'id' | 'createdAt'>) => void;
  updateStream: (id: string, stream: Partial<Stream>) => void;
  deleteStream: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addRecord: (record: Omit<Record, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, record: Partial<Record>) => void;
  deleteRecord: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSavings: (savings: Omit<Savings, 'id' | 'createdAt'>) => void;
  updateSavings: (id: string, savings: Partial<Savings>) => void;
  deleteSavings: (id: string) => void;
  clearDatabase: () => void;
  populateDatabase: () => void;
  /** Bulk-append pre-linked starter data (onboarding) — ids are provided by the caller. */
  seedData: (payload: { categories?: Category[]; accounts?: Account[]; streams?: Stream[] }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial demo data
const initialCategories: Category[] = [
  { id: '1', name: 'Cash & Bank', scope: 'account', iconName: 'Wallet', color: '#10B981', createdAt: new Date().toISOString() },
  { id: '2', name: 'Investments', scope: 'account', iconName: 'TrendingUp', color: '#4F46E5', createdAt: new Date().toISOString() },
  { id: '3', name: 'Food & Dining', scope: 'stream', iconName: 'Utensils', color: '#F59E0B', createdAt: new Date().toISOString() },
  { id: '4', name: 'Transportation', scope: 'stream', iconName: 'Car', color: '#6B7280', createdAt: new Date().toISOString() },
  { id: '5', name: 'Income', scope: 'stream', iconName: 'DollarSign', color: '#10B981', createdAt: new Date().toISOString() },
];

const initialAccounts: Account[] = [
  { id: '1', name: 'Main Wallet', balance: 5420.50, categoryId: '1', iconName: 'Wallet', color: '#10B981', currency: 'USD', createdAt: new Date().toISOString() },
  { id: '2', name: 'Savings Account', balance: 12500.00, categoryId: '1', iconName: 'PiggyBank', color: '#4F46E5', isSavings: true, currency: 'USD', createdAt: new Date().toISOString() },
  { id: '3', name: 'Investment Portfolio', balance: 25000.00, categoryId: '2', iconName: 'TrendingUp', color: '#6B7280', currency: 'USD', createdAt: new Date().toISOString() },
];

const initialStreams: Stream[] = [
  { id: '1', name: 'Salary', type: 'income', iconName: 'Briefcase', color: '#10B981', categoryId: '5', createdAt: new Date().toISOString() },
  { id: '2', name: 'Freelance', type: 'income', iconName: 'Code', color: '#4F46E5', categoryId: '5', createdAt: new Date().toISOString() },
  { id: '3', name: 'Groceries', type: 'expense', iconName: 'ShoppingCart', color: '#F59E0B', categoryId: '3', createdAt: new Date().toISOString() },
  { id: '4', name: 'Transportation', type: 'expense', iconName: 'Car', color: '#6B7280', categoryId: '4', createdAt: new Date().toISOString() },
  { id: '5', name: 'Entertainment', type: 'expense', iconName: 'Film', color: '#EF4444', categoryId: '5', createdAt: new Date().toISOString() },
  { id: 'unaccounted', name: 'Unaccounted', type: 'system', iconName: 'AlertCircle', color: '#6B7280', isSystem: true, createdAt: new Date().toISOString() },
];

const initialRecords: Record[] = [
  // Original base records
  { id: '1', type: 'income', amount: 5000, toAccountId: '1', streamId: '1', note: 'Monthly salary', date: '2026-01-01', createdAt: new Date().toISOString() },
  { id: '2', type: 'expense', amount: 250, fromAccountId: '1', streamId: '3', note: 'Weekly groceries', date: '2026-01-02', createdAt: new Date().toISOString() },
  { id: '3', type: 'expense', amount: 50, fromAccountId: '1', streamId: '4', note: 'Gas', date: '2026-01-02', createdAt: new Date().toISOString() },
  { id: '4', type: 'transfer', amount: 1000, fromAccountId: '1', toAccountId: '2', streamId: 'unaccounted', note: 'Monthly savings', date: '2026-01-03', createdAt: new Date().toISOString() },
  
  // Randomized mock data: Mixed incomes and expenses, realistic patterns
  // 2026 - Year 1
  // January
  { id: '5', type: 'income', amount: 850, toAccountId: '1', streamId: '2', note: 'Freelance project', date: '2026-01-06', createdAt: new Date().toISOString() },
  { id: '6', type: 'expense', amount: 25, fromAccountId: '1', streamId: '3', note: 'Coffee shop', date: '2026-01-06', createdAt: new Date().toISOString() },
  { id: '7', type: 'expense', amount: 15, fromAccountId: '1', streamId: '5', note: 'Movie ticket', date: '2026-01-06', createdAt: new Date().toISOString() },
  { id: '8', type: 'income', amount: 120, toAccountId: '1', streamId: '2', note: 'Side gig payment', date: '2026-01-08', createdAt: new Date().toISOString() },
  { id: '9', type: 'expense', amount: 45, fromAccountId: '1', streamId: '3', note: 'Lunch meeting', date: '2026-01-08', createdAt: new Date().toISOString() },
  { id: '10', type: 'expense', amount: 12, fromAccountId: '1', streamId: '5', note: 'Snacks', date: '2026-01-08', createdAt: new Date().toISOString() },
  { id: '11', type: 'expense', amount: 120, fromAccountId: '1', streamId: '3', note: 'Groceries', date: '2026-01-10', createdAt: new Date().toISOString() },
  { id: '12', type: 'expense', amount: 35, fromAccountId: '1', streamId: '5', note: 'Dinner out', date: '2026-01-10', createdAt: new Date().toISOString() },
  { id: '13', type: 'expense', amount: 18, fromAccountId: '1', streamId: '4', note: 'Uber ride', date: '2026-01-10', createdAt: new Date().toISOString() },
  
  // February
  { id: '14', type: 'income', amount: 450, toAccountId: '1', streamId: '2', note: 'Consulting work', date: '2026-02-03', createdAt: new Date().toISOString() },
  { id: '15', type: 'expense', amount: 30, fromAccountId: '1', streamId: '3', note: 'Groceries', date: '2026-02-03', createdAt: new Date().toISOString() },
  { id: '16', type: 'expense', amount: 20, fromAccountId: '1', streamId: '5', note: 'Concert ticket', date: '2026-02-03', createdAt: new Date().toISOString() },
  { id: '17', type: 'income', amount: 200, toAccountId: '1', streamId: '2', note: 'Online course sale', date: '2026-02-05', createdAt: new Date().toISOString() },
  { id: '18', type: 'expense', amount: 55, fromAccountId: '1', streamId: '3', note: 'Restaurant', date: '2026-02-05', createdAt: new Date().toISOString() },
  { id: '19', type: 'expense', amount: 25, fromAccountId: '1', streamId: '5', note: 'Gaming', date: '2026-02-05', createdAt: new Date().toISOString() },
  { id: '20', type: 'expense', amount: 80, fromAccountId: '1', streamId: '3', note: 'Weekly shopping', date: '2026-02-07', createdAt: new Date().toISOString() },
  { id: '21', type: 'expense', amount: 40, fromAccountId: '1', streamId: '5', note: 'Streaming services', date: '2026-02-07', createdAt: new Date().toISOString() },
  { id: '22', type: 'expense', amount: 12, fromAccountId: '1', streamId: '4', note: 'Public transport', date: '2026-02-07', createdAt: new Date().toISOString() },
  
  // March
  { id: '23', type: 'income', amount: 600, toAccountId: '1', streamId: '2', note: 'Design project', date: '2026-03-02', createdAt: new Date().toISOString() },
  { id: '24', type: 'expense', amount: 95, fromAccountId: '1', streamId: '3', note: 'Bulk groceries', date: '2026-03-02', createdAt: new Date().toISOString() },
  { id: '25', type: 'expense', amount: 60, fromAccountId: '1', streamId: '5', note: 'Weekend trip', date: '2026-03-02', createdAt: new Date().toISOString() },
  { id: '26', type: 'income', amount: 150, toAccountId: '1', streamId: '2', note: 'Photography gig', date: '2026-03-04', createdAt: new Date().toISOString() },
  { id: '27', type: 'expense', amount: 40, fromAccountId: '1', streamId: '3', note: 'Lunch special', date: '2026-03-04', createdAt: new Date().toISOString() },
  { id: '28', type: 'expense', amount: 30, fromAccountId: '1', streamId: '5', note: 'Books', date: '2026-03-04', createdAt: new Date().toISOString() },
  { id: '29', type: 'expense', amount: 150, fromAccountId: '1', streamId: '3', note: 'Monthly groceries', date: '2026-03-06', createdAt: new Date().toISOString() },
  { id: '30', type: 'expense', amount: 75, fromAccountId: '1', streamId: '5', note: 'Entertainment', date: '2026-03-06', createdAt: new Date().toISOString() },
  { id: '31', type: 'expense', amount: 20, fromAccountId: '1', streamId: '4', note: 'Gas refill', date: '2026-03-06', createdAt: new Date().toISOString() },
  
  // 2027 - Year 2
  // January
  { id: '32', type: 'income', amount: 750, toAccountId: '1', streamId: '2', note: 'Web development', date: '2027-01-05', createdAt: new Date().toISOString() },
  { id: '33', type: 'expense', amount: 28, fromAccountId: '1', streamId: '3', note: 'Coffee shop', date: '2027-01-05', createdAt: new Date().toISOString() },
  { id: '34', type: 'expense', amount: 18, fromAccountId: '1', streamId: '5', note: 'Movie', date: '2027-01-05', createdAt: new Date().toISOString() },
  { id: '35', type: 'income', amount: 320, toAccountId: '1', streamId: '2', note: 'Writing assignment', date: '2027-01-07', createdAt: new Date().toISOString() },
  { id: '36', type: 'expense', amount: 65, fromAccountId: '1', streamId: '3', note: 'Dinner', date: '2027-01-07', createdAt: new Date().toISOString() },
  { id: '37', type: 'expense', amount: 22, fromAccountId: '1', streamId: '5', note: 'Gaming subscription', date: '2027-01-07', createdAt: new Date().toISOString() },
  { id: '38', type: 'expense', amount: 110, fromAccountId: '1', streamId: '3', note: 'Weekly groceries', date: '2027-01-09', createdAt: new Date().toISOString() },
  { id: '39', type: 'expense', amount: 45, fromAccountId: '1', streamId: '5', note: 'Concert', date: '2027-01-09', createdAt: new Date().toISOString() },
  { id: '40', type: 'expense', amount: 18, fromAccountId: '1', streamId: '4', note: 'Rideshare', date: '2027-01-09', createdAt: new Date().toISOString() },
  
  // February
  { id: '41', type: 'income', amount: 480, toAccountId: '1', streamId: '2', note: 'Marketing consulting', date: '2027-02-02', createdAt: new Date().toISOString() },
  { id: '42', type: 'expense', amount: 35, fromAccountId: '1', streamId: '3', note: 'Groceries', date: '2027-02-02', createdAt: new Date().toISOString() },
  { id: '43', type: 'expense', amount: 25, fromAccountId: '1', streamId: '5', note: 'Bowling', date: '2027-02-02', createdAt: new Date().toISOString() },
  { id: '44', type: 'income', amount: 180, toAccountId: '1', streamId: '2', note: 'Tutoring session', date: '2027-02-04', createdAt: new Date().toISOString() },
  { id: '45', type: 'expense', amount: 48, fromAccountId: '1', streamId: '3', note: 'Restaurant', date: '2027-02-04', createdAt: new Date().toISOString() },
  { id: '46', type: 'expense', amount: 32, fromAccountId: '1', streamId: '5', note: 'Sports event', date: '2027-02-04', createdAt: new Date().toISOString() },
  { id: '47', type: 'expense', amount: 88, fromAccountId: '1', streamId: '3', note: 'Shopping', date: '2027-02-06', createdAt: new Date().toISOString() },
  { id: '48', type: 'expense', amount: 55, fromAccountId: '1', streamId: '5', note: 'Weekend getaway', date: '2027-02-06', createdAt: new Date().toISOString() },
  { id: '49', type: 'expense', amount: 16, fromAccountId: '1', streamId: '4', note: 'Train ticket', date: '2027-02-06', createdAt: new Date().toISOString() },
  
  // March
  { id: '50', type: 'income', amount: 920, toAccountId: '1', streamId: '2', note: 'App development', date: '2027-03-01', createdAt: new Date().toISOString() },
  { id: '51', type: 'expense', amount: 125, fromAccountId: '1', streamId: '3', note: 'Monthly stock up', date: '2027-03-01', createdAt: new Date().toISOString() },
  { id: '52', type: 'expense', amount: 85, fromAccountId: '1', streamId: '5', note: 'Vacation prep', date: '2027-03-01', createdAt: new Date().toISOString() },
  { id: '53', type: 'income', amount: 275, toAccountId: '1', streamId: '2', note: 'Video editing', date: '2027-03-03', createdAt: new Date().toISOString() },
  { id: '54', type: 'expense', amount: 52, fromAccountId: '1', streamId: '3', note: 'Brunch', date: '2027-03-03', createdAt: new Date().toISOString() },
  { id: '55', type: 'expense', amount: 38, fromAccountId: '1', streamId: '5', note: 'Theater tickets', date: '2027-03-03', createdAt: new Date().toISOString() },
  { id: '56', type: 'expense', amount: 98, fromAccountId: '1', streamId: '3', note: 'Weekly groceries', date: '2027-03-05', createdAt: new Date().toISOString() },
  { id: '57', type: 'expense', amount: 62, fromAccountId: '1', streamId: '5', note: 'Gym membership', date: '2027-03-05', createdAt: new Date().toISOString() },
  { id: '58', type: 'expense', amount: 19, fromAccountId: '1', streamId: '4', note: 'Rideshare', date: '2027-03-05', createdAt: new Date().toISOString() },
];

const initialBudgets: Budget[] = [
  { id: '1', streamId: '3', name: 'Groceries Budget', limit: 500, spent: 250, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '2', streamId: '4', name: 'Transportation Budget', limit: 200, spent: 50, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '3', streamId: '5', name: 'Entertainment Budget', limit: 300, spent: 0, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '4', streamId: '3', name: 'Dining Out Budget', limit: 150, spent: 75, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '5', streamId: '4', name: 'Gas & Fuel Budget', limit: 100, spent: 30, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '6', streamId: '5', name: 'Shopping Budget', limit: 200, spent: 120, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '7', streamId: '3', name: 'Coffee Budget', limit: 50, spent: 25, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '8', streamId: '4', name: 'Public Transit Budget', limit: 75, spent: 20, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
];

const initialSavings: Savings[] = [
  { id: '1', name: 'Emergency Fund', accountId: '2', note: 'Emergency savings for unexpected expenses', iconName: 'Shield', color: '#EF4444', target: 20000, current: 12500, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', kind: 'savings', emoji: '🛟', createdAt: new Date().toISOString() },
  { id: '2', name: 'Vacation Fund', accountId: '2', note: 'Summer vacation to Europe', iconName: 'Plane', color: '#3B82F6', target: 5000, current: 2300, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '3', name: 'New Car Fund', accountId: '2', note: 'Down payment for new car', iconName: 'Car', color: '#10B981', target: 15000, current: 8500, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '4', name: 'Home Renovation', accountId: '2', note: 'Kitchen remodel project', iconName: 'Home', color: '#F59E0B', target: 25000, current: 8000, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '5', name: 'Education Fund', accountId: '2', note: 'Professional development courses', iconName: 'BookOpen', color: '#8B5CF6', target: 3000, current: 1200, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '6', name: 'Wedding Fund', accountId: '2', note: 'Future wedding expenses', iconName: 'Heart', color: '#EC4899', target: 10000, current: 4500, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
];

const cloneWithFreshCreatedAt = <T extends { createdAt: string }>(items: T[]): T[] =>
  items.map((item) => ({ ...item, createdAt: new Date().toISOString() }));

const emptyStreams: Stream[] = [
  { id: 'unaccounted', name: 'Unaccounted', type: 'system', iconName: 'AlertCircle', color: '#6B7280', isSystem: true, createdAt: new Date().toISOString() },
];

const storageKeys = [
  'theria-accounts',
  'theria-streams',
  'theria-categories',
  'theria-records',
  'theria-budgets',
  'theria-savings',
] as const;

const buildRichMockData = () => {
  const now = new Date();
  const toIso = (yearOffset: number, month: number, day: number) =>
    new Date(now.getFullYear() - yearOffset, month, day).toISOString();
  const toDateOnly = (yearOffset: number, month: number, day: number) =>
    new Date(now.getFullYear() - yearOffset, month, day).toISOString().slice(0, 10);

  const accountCategories: Category[] = [
    { id: 'ac-1', name: 'Cash & Bank', scope: 'account', iconName: 'Wallet', color: '#10B981', createdAt: toIso(2, 0, 1) },
    { id: 'ac-2', name: 'Savings', scope: 'account', iconName: 'PiggyBank', color: '#6366F1', createdAt: toIso(2, 0, 2) },
    { id: 'ac-3', name: 'Investments', scope: 'account', iconName: 'TrendingUp', color: '#8B5CF6', createdAt: toIso(2, 0, 3) },
    { id: 'ac-4', name: 'Cards', scope: 'account', iconName: 'CreditCard', color: '#06B6D4', createdAt: toIso(2, 0, 4) },
    { id: 'ac-5', name: 'Emergency', scope: 'account', iconName: 'Shield', color: '#F59E0B', createdAt: toIso(2, 0, 5) },
    { id: 'ac-6', name: 'Travel', scope: 'account', iconName: 'Plane', color: '#EC4899', createdAt: toIso(2, 0, 6) },
  ];

  const streamCategories: Category[] = [
    { id: 'sc-1', name: 'Salary', scope: 'stream', iconName: 'Briefcase', color: '#10B981', createdAt: toIso(2, 0, 7) },
    { id: 'sc-2', name: 'Business', scope: 'stream', iconName: 'Building2', color: '#22C55E', createdAt: toIso(2, 0, 8) },
    { id: 'sc-3', name: 'Food', scope: 'stream', iconName: 'Utensils', color: '#F59E0B', createdAt: toIso(2, 0, 9) },
    { id: 'sc-4', name: 'Transport', scope: 'stream', iconName: 'Car', color: '#3B82F6', createdAt: toIso(2, 0, 10) },
    { id: 'sc-5', name: 'Housing', scope: 'stream', iconName: 'Home', color: '#A855F7', createdAt: toIso(2, 0, 11) },
    { id: 'sc-6', name: 'Lifestyle', scope: 'stream', iconName: 'Sparkles', color: '#EF4444', createdAt: toIso(2, 0, 12) },
  ];

  const categories = [...accountCategories, ...streamCategories];

  const accounts: Account[] = [
    { id: 'acc-1', name: 'Main Wallet', balance: 3120.25, categoryId: 'ac-1', iconName: 'Wallet', color: '#10B981', createdAt: toIso(2, 1, 1) },
    { id: 'acc-2', name: 'Payroll Account', balance: 8450.65, categoryId: 'ac-1', iconName: 'Landmark', color: '#22C55E', createdAt: toIso(2, 1, 2), bankName: 'Metro Bank' },
    { id: 'acc-3', name: 'Emergency Fund', balance: 12400.0, categoryId: 'ac-5', iconName: 'Shield', color: '#F59E0B', isSavings: true, createdAt: toIso(2, 1, 3) },
    { id: 'acc-4', name: 'Travel Vault', balance: 2900.0, categoryId: 'ac-6', iconName: 'Plane', color: '#EC4899', isSavings: true, createdAt: toIso(2, 1, 4) },
    { id: 'acc-5', name: 'Index Portfolio', balance: 18050.0, categoryId: 'ac-3', iconName: 'TrendingUp', color: '#8B5CF6', createdAt: toIso(2, 1, 5) },
    { id: 'acc-6', name: 'Crypto Wallet', balance: 2140.35, categoryId: 'ac-3', iconName: 'Coins', color: '#6366F1', createdAt: toIso(2, 1, 6) },
    { id: 'acc-7', name: 'Rewards Card', balance: 1250.4, categoryId: 'ac-4', iconName: 'CreditCard', color: '#06B6D4', createdAt: toIso(2, 1, 7), cardType: 'credit' },
    { id: 'acc-8', name: 'Daily Card', balance: 680.9, categoryId: 'ac-4', iconName: 'CreditCard', color: '#3B82F6', createdAt: toIso(2, 1, 8), cardType: 'debit' },
    { id: 'acc-9', name: 'Family Savings', balance: 7650.0, categoryId: 'ac-2', iconName: 'PiggyBank', color: '#6366F1', isSavings: true, createdAt: toIso(2, 1, 9) },
    { id: 'acc-10', name: 'Tax Reserve', balance: 3425.0, categoryId: 'ac-2', iconName: 'FileText', color: '#0EA5E9', isSavings: true, createdAt: toIso(2, 1, 10) },
    { id: 'acc-11', name: 'Broker Cash', balance: 2125.55, categoryId: 'ac-3', iconName: 'BarChart3', color: '#A855F7', createdAt: toIso(2, 1, 11) },
    { id: 'acc-12', name: 'Long-Term Bond', balance: 9050.0, categoryId: 'ac-3', iconName: 'BadgeDollarSign', color: '#14B8A6', createdAt: toIso(2, 1, 12) },
  ];

  const streams: Stream[] = [
    { id: 'st-1', name: 'Primary Salary', type: 'income', iconName: 'Briefcase', color: '#10B981', categoryId: 'sc-1', createdAt: toIso(2, 2, 1) },
    { id: 'st-2', name: 'Side Consulting', type: 'income', iconName: 'Laptop', color: '#22C55E', categoryId: 'sc-2', createdAt: toIso(2, 2, 2) },
    { id: 'st-3', name: 'Freelance Design', type: 'income', iconName: 'PenTool', color: '#16A34A', categoryId: 'sc-2', createdAt: toIso(2, 2, 3) },
    { id: 'st-4', name: 'Dividends', type: 'income', iconName: 'TrendingUp', color: '#84CC16', categoryId: 'sc-2', createdAt: toIso(2, 2, 4) },
    { id: 'st-5', name: 'Rental Income', type: 'income', iconName: 'Building', color: '#65A30D', categoryId: 'sc-2', createdAt: toIso(2, 2, 5) },
    { id: 'st-6', name: 'Bonuses', type: 'income', iconName: 'Gift', color: '#4D7C0F', categoryId: 'sc-1', createdAt: toIso(2, 2, 6) },
    { id: 'st-7', name: 'Groceries', type: 'expense', iconName: 'ShoppingCart', color: '#F59E0B', categoryId: 'sc-3', createdAt: toIso(2, 2, 7) },
    { id: 'st-8', name: 'Dining Out', type: 'expense', iconName: 'Utensils', color: '#FB923C', categoryId: 'sc-3', createdAt: toIso(2, 2, 8) },
    { id: 'st-9', name: 'Coffee & Snacks', type: 'expense', iconName: 'Coffee', color: '#F97316', categoryId: 'sc-3', createdAt: toIso(2, 2, 9) },
    { id: 'st-10', name: 'Fuel', type: 'expense', iconName: 'Fuel', color: '#3B82F6', categoryId: 'sc-4', createdAt: toIso(2, 2, 10) },
    { id: 'st-11', name: 'Ride Sharing', type: 'expense', iconName: 'Car', color: '#2563EB', categoryId: 'sc-4', createdAt: toIso(2, 2, 11) },
    { id: 'st-12', name: 'Public Transit', type: 'expense', iconName: 'Train', color: '#1D4ED8', categoryId: 'sc-4', createdAt: toIso(2, 2, 12) },
    { id: 'st-13', name: 'Rent', type: 'expense', iconName: 'Home', color: '#A855F7', categoryId: 'sc-5', createdAt: toIso(2, 2, 13) },
    { id: 'st-14', name: 'Utilities', type: 'expense', iconName: 'Lightbulb', color: '#9333EA', categoryId: 'sc-5', createdAt: toIso(2, 2, 14) },
    { id: 'st-15', name: 'Internet', type: 'expense', iconName: 'Wifi', color: '#7E22CE', categoryId: 'sc-5', createdAt: toIso(2, 2, 15) },
    { id: 'st-16', name: 'Entertainment', type: 'expense', iconName: 'Film', color: '#EF4444', categoryId: 'sc-6', createdAt: toIso(2, 2, 16) },
    { id: 'st-17', name: 'Shopping', type: 'expense', iconName: 'ShoppingBag', color: '#DC2626', categoryId: 'sc-6', createdAt: toIso(2, 2, 17) },
    { id: 'st-18', name: 'Subscriptions', type: 'expense', iconName: 'Receipt', color: '#B91C1C', categoryId: 'sc-6', createdAt: toIso(2, 2, 18) },
    { id: 'st-19', name: 'Health & Fitness', type: 'expense', iconName: 'HeartPulse', color: '#BE123C', categoryId: 'sc-6', createdAt: toIso(2, 2, 19) },
    { id: 'unaccounted', name: 'Unaccounted', type: 'system', iconName: 'AlertCircle', color: '#6B7280', isSystem: true, createdAt: toIso(2, 2, 20) },
  ];

  const budgets: Budget[] = [
    { id: 'bg-1', streamId: 'st-7', name: 'Groceries Budget', limit: 520, spent: 332, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 1) },
    { id: 'bg-2', streamId: 'st-8', name: 'Dining Budget', limit: 280, spent: 145, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 2) },
    { id: 'bg-3', streamId: 'st-10', name: 'Fuel Budget', limit: 220, spent: 118, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 3) },
    { id: 'bg-4', streamId: 'st-11', name: 'Ride Share Budget', limit: 160, spent: 79, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 4) },
    { id: 'bg-5', streamId: 'st-13', name: 'Rent Budget', limit: 1250, spent: 1250, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 5) },
    { id: 'bg-6', streamId: 'st-14', name: 'Utilities Budget', limit: 210, spent: 155, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 6) },
    { id: 'bg-7', streamId: 'st-15', name: 'Internet Budget', limit: 95, spent: 82, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 7) },
    { id: 'bg-8', streamId: 'st-16', name: 'Entertainment Budget', limit: 240, spent: 132, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 8) },
    { id: 'bg-9', streamId: 'st-17', name: 'Shopping Budget', limit: 350, spent: 206, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 9) },
    { id: 'bg-10', streamId: 'st-18', name: 'Subscriptions Budget', limit: 110, spent: 69, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 10) },
    { id: 'bg-11', streamId: 'st-19', name: 'Fitness Budget', limit: 150, spent: 94, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 11) },
    { id: 'bg-12', streamId: 'st-7', name: 'Annual Food Control', limit: 6200, spent: 2130, period: 'yearly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 11, 31), createdAt: toIso(0, 0, 12) },
    { id: 'bg-13', streamId: 'st-10', name: 'Annual Transport Control', limit: 2800, spent: 1020, period: 'yearly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 11, 31), createdAt: toIso(0, 0, 13) },
    { id: 'bg-14', streamId: 'st-16', name: 'Leisure Year Cap', limit: 3200, spent: 1095, period: 'yearly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 11, 31), createdAt: toIso(0, 0, 14) },
    { id: 'bg-15', streamId: 'st-17', name: 'Lifestyle Year Cap', limit: 4200, spent: 1510, period: 'yearly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 11, 31), createdAt: toIso(0, 0, 15) },
  ];

  const savings: Savings[] = [
    { id: 'sv-1', name: 'Emergency Fund', accountId: 'acc-3', target: 20000, current: 12400, note: 'Emergency buffer', color: '#EF4444', photoUrl: '', iconName: 'Shield', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 11, 31), kind: 'savings', emoji: '🛟', createdAt: toIso(1, 0, 1) },
    { id: 'sv-2', name: 'Travel Europe', accountId: 'acc-4', target: 7000, current: 2900, note: 'Summer trip', color: '#3B82F6', photoUrl: '', iconName: 'Plane', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 10, 30), kind: 'goal', emoji: '✈️', createdAt: toIso(1, 0, 2) },
    { id: 'sv-3', name: 'New Car', accountId: 'acc-9', target: 18000, current: 7600, note: 'Down payment', color: '#10B981', photoUrl: '', iconName: 'Car', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 11, 31), kind: 'goal', emoji: '🚗', createdAt: toIso(1, 0, 3) },
    { id: 'sv-4', name: 'House Upgrade', accountId: 'acc-9', target: 15000, current: 6400, note: 'Renovation plans', color: '#F59E0B', photoUrl: '', iconName: 'Home', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 11, 31), kind: 'goal', emoji: '🏠', createdAt: toIso(1, 0, 4) },
    { id: 'sv-5', name: 'Learning Budget', accountId: 'acc-10', target: 3500, current: 1400, note: 'Courses and books', color: '#8B5CF6', photoUrl: '', iconName: 'BookOpen', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 11, 31), kind: 'goal', emoji: '📚', createdAt: toIso(1, 0, 5) },
    { id: 'sv-6', name: 'Wedding', accountId: 'acc-10', target: 10000, current: 4200, note: 'Ceremony reserve', color: '#EC4899', photoUrl: '', iconName: 'Heart', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 11, 31), kind: 'goal', emoji: '💍', createdAt: toIso(1, 0, 6) },
    { id: 'sv-7', name: 'Gadget Upgrade', accountId: 'acc-1', target: 2200, current: 760, note: 'Phone + laptop', color: '#14B8A6', photoUrl: '', iconName: 'Smartphone', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 7, 31), kind: 'goal', emoji: '📱', createdAt: toIso(1, 0, 7) },
    { id: 'sv-8', name: 'Tax Buffer', accountId: 'acc-10', target: 5000, current: 3425, note: 'Quarterly tax protection', color: '#0EA5E9', photoUrl: '', iconName: 'FileText', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 11, 31), kind: 'savings', emoji: '🧾', createdAt: toIso(1, 0, 8) },
    { id: 'sv-9', name: 'Family Holiday', accountId: 'acc-4', target: 6000, current: 2200, note: 'End-of-year getaway', color: '#F97316', photoUrl: '', iconName: 'Luggage', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 10, 30), kind: 'goal', emoji: '🏝️', createdAt: toIso(1, 0, 9) },
    { id: 'sv-10', name: 'Rainy Day', accountId: 'acc-3', target: 4000, current: 1750, note: 'Unexpected bills', color: '#EAB308', photoUrl: '', iconName: 'CloudRain', period: 'yearly', startDate: toDateOnly(1, 0, 1), endDate: toDateOnly(0, 11, 31), kind: 'savings', emoji: '☔', createdAt: toIso(1, 0, 10) },
  ];

  const incomeStreams = streams.filter((s) => s.type === 'income');
  const expenseStreams = streams.filter((s) => s.type === 'expense');
  const records: Record[] = [];
  let recordId = 1;

  for (let yearOffset = 2; yearOffset >= 0; yearOffset -= 1) {
    for (let month = 0; month < 12; month += 1) {
      const salaryStream = incomeStreams[month % incomeStreams.length];
      records.push({
        id: `rc-${recordId++}`,
        type: 'income',
        amount: 4200 + month * 50,
        toAccountId: 'acc-2',
        streamId: salaryStream.id,
        note: 'Monthly payroll',
        date: toDateOnly(yearOffset, month, 1),
        createdAt: toIso(yearOffset, month, 1),
      });

      const sideIncomeStream = incomeStreams[(month + 2) % incomeStreams.length];
      records.push({
        id: `rc-${recordId++}`,
        type: 'income',
        amount: 450 + (month % 4) * 120,
        toAccountId: 'acc-1',
        streamId: sideIncomeStream.id,
        note: 'Side income',
        date: toDateOnly(yearOffset, month, 10),
        createdAt: toIso(yearOffset, month, 10),
      });

      for (let i = 0; i < 4; i += 1) {
        const expenseStream = expenseStreams[(month * 2 + i) % expenseStreams.length];
        records.push({
          id: `rc-${recordId++}`,
          type: 'expense',
          amount: 40 + ((month + 1) * (i + 3) * 7) % 420,
          fromAccountId: accounts[(month + i) % accounts.length].id,
          streamId: expenseStream.id,
          note: `${expenseStream.name} expense`,
          date: toDateOnly(yearOffset, month, Math.min(26, 4 + i * 6)),
          createdAt: toIso(yearOffset, month, Math.min(26, 4 + i * 6)),
        });
      }

      records.push({
        id: `rc-${recordId++}`,
        type: 'transfer',
        amount: 300 + (month % 5) * 80,
        fromAccountId: 'acc-2',
        toAccountId: 'acc-3',
        streamId: 'unaccounted',
        note: 'Savings transfer',
        date: toDateOnly(yearOffset, month, 22),
        createdAt: toIso(yearOffset, month, 22),
      });
    }
  }

  return { categories, accounts, streams, records, budgets, savings };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const stored = localStorage.getItem('theria-accounts');
    return stored ? JSON.parse(stored) : [];
  });

  const [streams, setStreams] = useState<Stream[]>(() => {
    const stored = localStorage.getItem('theria-streams');
    return stored ? JSON.parse(stored) : emptyStreams;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem('theria-categories');
    return stored ? JSON.parse(stored) : [];
  });

  const [records, setRecords] = useState<Record[]>(() => {
    const stored = localStorage.getItem('theria-records');
    return stored ? JSON.parse(stored) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const stored = localStorage.getItem('theria-budgets');
    return stored ? JSON.parse(stored) : [];
  });

  const [savings, setSavings] = useState<Savings[]>(() => {
    const stored = localStorage.getItem('theria-savings');
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('theria-accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('theria-streams', JSON.stringify(streams));
  }, [streams]);

  useEffect(() => {
    localStorage.setItem('theria-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('theria-records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('theria-budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('theria-savings', JSON.stringify(savings));
  }, [savings]);

  // Account methods
  const addAccount = (account: Omit<Account, 'id' | 'createdAt'>): Account => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAccounts([...accounts, newAccount]);
    return newAccount;
  };

  const updateAccount = (id: string, account: Partial<Account>) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, ...account } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  // Stream methods
  const addStream = (stream: Omit<Stream, 'id' | 'createdAt'>) => {
    const newStream: Stream = {
      ...stream,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setStreams([...streams, newStream]);
  };

  const updateStream = (id: string, stream: Partial<Stream>) => {
    setStreams(streams.map(s => s.id === id ? { ...s, ...stream } : s));
  };

  const deleteStream = (id: string) => {
    setStreams(streams.filter(s => s.id !== id));
  };

  // Category methods
  const addCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...category } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  // Record methods
  const addRecord = (record: Omit<Record, 'id' | 'createdAt'>) => {
    const newRecord: Record = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setRecords([...records, newRecord]);

    // Update account balances
    if (record.type === 'income' && record.toAccountId) {
      updateAccount(record.toAccountId, {
        balance: (accounts.find(a => a.id === record.toAccountId)?.balance || 0) + record.amount
      });
    } else if (record.type === 'expense' && record.fromAccountId) {
      updateAccount(record.fromAccountId, {
        balance: (accounts.find(a => a.id === record.fromAccountId)?.balance || 0) - record.amount
      });
    } else if (record.type === 'transfer' && record.fromAccountId && record.toAccountId) {
      updateAccount(record.fromAccountId, {
        balance: (accounts.find(a => a.id === record.fromAccountId)?.balance || 0) - record.amount
      });
      updateAccount(record.toAccountId, {
        balance: (accounts.find(a => a.id === record.toAccountId)?.balance || 0) + record.amount
      });
    }
  };

  const updateRecord = (id: string, record: Partial<Record>) => {
    setRecords(records.map(r => r.id === id ? { ...r, ...record } : r));
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  // Budget methods
  const addBudget = (budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setBudgets([...budgets, newBudget]);
  };

  const updateBudget = (id: string, budget: Partial<Budget>) => {
    setBudgets(budgets.map(b => b.id === id ? { ...b, ...budget } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  // Savings methods
  const addSavings = (savingsItem: Omit<Savings, 'id' | 'createdAt'>) => {
    const newSavings: Savings = {
      ...savingsItem,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSavings([...savings, newSavings]);
  };

  const updateSavings = (id: string, savingsItem: Partial<Savings>) => {
    setSavings(savings.map(s => s.id === id ? { ...s, ...savingsItem } : s));
  };

  const deleteSavings = (id: string) => {
    setSavings(savings.filter(s => s.id !== id));
  };

  const clearDatabase = () => {
    storageKeys.forEach((key) => localStorage.removeItem(key));
    setAccounts([]);
    setCategories([]);
    setStreams([
      { id: 'unaccounted', name: 'Unaccounted', type: 'system', iconName: 'AlertCircle', color: '#6B7280', isSystem: true, createdAt: new Date().toISOString() },
    ]);
    setRecords([]);
    setBudgets([]);
    setSavings([]);
  };

  const seedData = ({
    categories: newCategories = [],
    accounts: newAccounts = [],
    streams: newStreams = [],
  }: {
    categories?: Category[];
    accounts?: Account[];
    streams?: Stream[];
  }) => {
    if (newCategories.length) setCategories((prev) => [...prev, ...newCategories]);
    if (newAccounts.length) setAccounts((prev) => [...prev, ...newAccounts]);
    if (newStreams.length) setStreams((prev) => [...prev, ...newStreams]);
  };

  const populateDatabase = () => {
    const richData = buildRichMockData();
    setCategories(cloneWithFreshCreatedAt(richData.categories));
    setAccounts(cloneWithFreshCreatedAt(richData.accounts));
    setStreams(cloneWithFreshCreatedAt(richData.streams));
    setRecords(cloneWithFreshCreatedAt(richData.records));
    setBudgets(cloneWithFreshCreatedAt(richData.budgets));
    setSavings(cloneWithFreshCreatedAt(richData.savings));
  };

  return (
    <DataContext.Provider
      value={{
        accounts,
        streams,
        categories,
        records,
        budgets,
        savings,
        addAccount,
        updateAccount,
        deleteAccount,
        addStream,
        updateStream,
        deleteStream,
        addCategory,
        updateCategory,
        deleteCategory,
        addRecord,
        updateRecord,
        deleteRecord,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavings,
        updateSavings,
        deleteSavings,
        clearDatabase,
        populateDatabase,
        seedData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};