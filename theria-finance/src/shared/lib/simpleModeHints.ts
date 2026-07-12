import type { FeatureColorKey } from './featureColors';

export type SimpleModePage =
  | 'dashboard'
  | 'records'
  | 'streams'
  | 'categories'
  | 'accounts'
  | 'budget'
  | 'savings'
  | 'analysis'
  | 'activity'
  | 'notifications'
  | 'streak';

/** Maps each simple-mode hint page to its feature accent palette. */
export const SIMPLE_MODE_HINT_FEATURE: Record<SimpleModePage, FeatureColorKey> = {
  dashboard: 'primary',
  records: 'records',
  streams: 'streams',
  categories: 'categories',
  accounts: 'accounts',
  budget: 'budget',
  savings: 'savings',
  analysis: 'analysis',
  activity: 'activity',
  notifications: 'notifications',
  streak: 'streak',
};

export const SIMPLE_MODE_HINTS: Record<
  SimpleModePage,
  { title: string; body: string; tip?: string }
> = {
  dashboard: {
    title: 'Simple dashboard',
    body: 'This view shows only the essentials: your balance and how much came in or went out this period.',
    tip: 'Turn off Simple mode in the sidebar when you want charts and detailed breakdowns.',
  },
  records: {
    title: 'Your transaction list',
    body: 'Every income, expense, and transfer you log appears here. Tap a row to view or edit it.',
    tip: 'Use the + button → Add Record to log something new.',
  },
  streams: {
    title: 'Money streams',
    body: 'Streams are labels like “Groceries” or “Salary.” Pick a stream when adding a record so spending stays organized.',
    tip: 'Create a stream before logging records that belong to it.',
  },
  categories: {
    title: 'Categories',
    body: 'Categories group your streams and accounts with colors and icons. They keep filters and reports tidy.',
    tip: 'Tap + to add a category, then assign it when creating streams or accounts.',
  },
  accounts: {
    title: 'Accounts',
    body: 'Each wallet or bank account lives here with its own balance and currency.',
    tip: 'Add an account first, then link records and savings goals to it.',
  },
  budget: {
    title: 'Budgets',
    body: 'Set a spending limit per stream for the month. The bar shows how much you have used.',
    tip: 'Green means on track. Red means you have gone over the limit.',
  },
  savings: {
    title: 'Savings',
    body: 'Goals are things you want to buy or do. Funds are safety nets like an emergency fund.',
    tip: 'Give each one a picture — it makes saving a lot more motivating.',
  },
  analysis: {
    title: 'Analysis',
    body: 'Charts summarize trends for income, spending, budgets, and accounts. Change the time filter to compare periods.',
    tip: 'Start with Overview, then explore tabs for the area you care about.',
  },
  activity: {
    title: 'Recent activity',
    body: 'A timeline of changes across the app: new records, edits, and updates.',
    tip: 'Use the time filter to focus on a specific day or month.',
  },
  notifications: {
    title: 'Notifications',
    body: 'Alerts about budgets, savings milestones, and other updates appear here.',
    tip: 'Check back after adding records or nearing a budget limit.',
  },
  streak: {
    title: 'Daily streak',
    body: 'Stay consistent by opening the app or logging activity. Your streak grows one day at a time.',
    tip: 'Log a record today to keep the streak alive.',
  },
};
