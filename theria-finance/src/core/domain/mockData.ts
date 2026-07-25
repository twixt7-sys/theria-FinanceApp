import { netEffectOnAccount } from './ledger';
import type { Account, Budget, Category, LedgerRecord, Savings, Stream, TheriaData } from './types';

/** Dev-only sample dataset behind Settings → Developer → "Populate database". */
export function buildRichMockData(): TheriaData {
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

  /** Balances the dashboard should end up showing; anchors are derived below. */
  const accountSeeds: Array<Omit<Account, 'initialBalance'> & { displayBalance: number }> = [
    { id: 'acc-1', name: 'Main Wallet', displayBalance: 3120.25, categoryId: 'ac-1', iconName: 'Wallet', color: '#10B981', createdAt: toIso(2, 1, 1) },
    { id: 'acc-2', name: 'Payroll Account', displayBalance: 8450.65, categoryId: 'ac-1', iconName: 'Landmark', color: '#22C55E', createdAt: toIso(2, 1, 2), bankName: 'Metro Bank' },
    { id: 'acc-3', name: 'Emergency Fund', displayBalance: 12400.0, categoryId: 'ac-5', iconName: 'Shield', color: '#F59E0B', isSavings: true, createdAt: toIso(2, 1, 3) },
    { id: 'acc-4', name: 'Travel Vault', displayBalance: 2900.0, categoryId: 'ac-6', iconName: 'Plane', color: '#EC4899', isSavings: true, createdAt: toIso(2, 1, 4) },
    { id: 'acc-5', name: 'Index Portfolio', displayBalance: 18050.0, categoryId: 'ac-3', iconName: 'TrendingUp', color: '#8B5CF6', createdAt: toIso(2, 1, 5) },
    { id: 'acc-6', name: 'Crypto Wallet', displayBalance: 2140.35, categoryId: 'ac-3', iconName: 'Coins', color: '#6366F1', createdAt: toIso(2, 1, 6) },
    { id: 'acc-7', name: 'Rewards Card', displayBalance: 1250.4, categoryId: 'ac-4', iconName: 'CreditCard', color: '#06B6D4', createdAt: toIso(2, 1, 7), cardType: 'credit' },
    { id: 'acc-8', name: 'Daily Card', displayBalance: 680.9, categoryId: 'ac-4', iconName: 'CreditCard', color: '#3B82F6', createdAt: toIso(2, 1, 8), cardType: 'debit' },
    { id: 'acc-9', name: 'Family Savings', displayBalance: 7650.0, categoryId: 'ac-2', iconName: 'PiggyBank', color: '#6366F1', isSavings: true, createdAt: toIso(2, 1, 9) },
    { id: 'acc-10', name: 'Tax Reserve', displayBalance: 3425.0, categoryId: 'ac-2', iconName: 'FileText', color: '#0EA5E9', isSavings: true, createdAt: toIso(2, 1, 10) },
    { id: 'acc-11', name: 'Broker Cash', displayBalance: 2125.55, categoryId: 'ac-3', iconName: 'BarChart3', color: '#A855F7', createdAt: toIso(2, 1, 11) },
    { id: 'acc-12', name: 'Long-Term Bond', displayBalance: 9050.0, categoryId: 'ac-3', iconName: 'BadgeDollarSign', color: '#14B8A6', createdAt: toIso(2, 1, 12) },
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
    { id: 'bg-1', streamId: 'st-7', name: 'Groceries Budget', limit: 520, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 1) },
    { id: 'bg-2', streamId: 'st-8', name: 'Dining Budget', limit: 280, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 2) },
    { id: 'bg-3', streamId: 'st-10', name: 'Fuel Budget', limit: 220, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 3) },
    { id: 'bg-4', streamId: 'st-11', name: 'Ride Share Budget', limit: 160, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 4) },
    { id: 'bg-5', streamId: 'st-13', name: 'Rent Budget', limit: 1250, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 5) },
    { id: 'bg-6', streamId: 'st-14', name: 'Utilities Budget', limit: 210, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 6) },
    { id: 'bg-7', streamId: 'st-15', name: 'Internet Budget', limit: 95, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 7) },
    { id: 'bg-8', streamId: 'st-16', name: 'Entertainment Budget', limit: 240, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 8) },
    { id: 'bg-9', streamId: 'st-17', name: 'Shopping Budget', limit: 350, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 9) },
    { id: 'bg-10', streamId: 'st-18', name: 'Subscriptions Budget', limit: 110, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 10) },
    { id: 'bg-11', streamId: 'st-19', name: 'Fitness Budget', limit: 150, period: 'monthly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 0, 31), createdAt: toIso(0, 0, 11) },
    { id: 'bg-12', streamId: 'st-7', name: 'Annual Food Control', limit: 6200, period: 'yearly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 11, 31), createdAt: toIso(0, 0, 12) },
    { id: 'bg-13', streamId: 'st-10', name: 'Annual Transport Control', limit: 2800, period: 'yearly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 11, 31), createdAt: toIso(0, 0, 13) },
    { id: 'bg-14', streamId: 'st-16', name: 'Leisure Year Cap', limit: 3200, period: 'yearly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 11, 31), createdAt: toIso(0, 0, 14) },
    { id: 'bg-15', streamId: 'st-17', name: 'Lifestyle Year Cap', limit: 4200, period: 'yearly', startDate: toDateOnly(0, 0, 1), endDate: toDateOnly(0, 11, 31), createdAt: toIso(0, 0, 15) },
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
  const records: LedgerRecord[] = [];
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
          fromAccountId: accountSeeds[(month + i) % accountSeeds.length].id,
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

  // Anchor each account so the derived balance lands on the intended figure.
  const accounts: Account[] = accountSeeds.map(({ displayBalance, ...rest }) => ({
    ...rest,
    initialBalance: displayBalance - netEffectOnAccount(rest.id, records),
  }));

  return { categories, accounts, streams, records, budgets, savings };
}
