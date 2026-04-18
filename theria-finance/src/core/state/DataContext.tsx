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
}

interface DataContextType {
  accounts: Account[];
  streams: Stream[];
  categories: Category[];
  records: Record[];
  budgets: Budget[];
  savings: Savings[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
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
  { id: '1', name: 'Main Wallet', balance: 5420.50, categoryId: '1', iconName: 'Wallet', color: '#10B981', createdAt: new Date().toISOString() },
  { id: '2', name: 'Savings Account', balance: 12500.00, categoryId: '1', iconName: 'PiggyBank', color: '#4F46E5', isSavings: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Investment Portfolio', balance: 25000.00, categoryId: '2', iconName: 'TrendingUp', color: '#6B7280', createdAt: new Date().toISOString() },
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
  { id: '1', name: 'Emergency Fund', accountId: '2', note: 'Emergency savings for unexpected expenses', iconName: 'Shield', color: '#EF4444', target: 20000, current: 12500, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '2', name: 'Vacation Fund', accountId: '2', note: 'Summer vacation to Europe', iconName: 'Plane', color: '#3B82F6', target: 5000, current: 2300, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '3', name: 'New Car Fund', accountId: '2', note: 'Down payment for new car', iconName: 'Car', color: '#10B981', target: 15000, current: 8500, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '4', name: 'Home Renovation', accountId: '2', note: 'Kitchen remodel project', iconName: 'Home', color: '#F59E0B', target: 25000, current: 8000, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '5', name: 'Education Fund', accountId: '2', note: 'Professional development courses', iconName: 'BookOpen', color: '#8B5CF6', target: 3000, current: 1200, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
  { id: '6', name: 'Wedding Fund', accountId: '2', note: 'Future wedding expenses', iconName: 'Heart', color: '#EC4899', target: 10000, current: 4500, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', photoUrl: '', createdAt: new Date().toISOString() },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const stored = localStorage.getItem('theria-accounts');
    return stored ? JSON.parse(stored) : initialAccounts;
  });

  const [streams, setStreams] = useState<Stream[]>(() => {
    const stored = localStorage.getItem('theria-streams');
    return stored ? JSON.parse(stored) : initialStreams;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem('theria-categories');
    return stored ? JSON.parse(stored) : initialCategories;
  });

  const [records, setRecords] = useState<Record[]>(() => {
    localStorage.removeItem('theria-records');
    return initialRecords;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const stored = localStorage.getItem('theria-budgets');
    return stored ? JSON.parse(stored) : initialBudgets;
  });

  const [savings, setSavings] = useState<Savings[]>(() => {
    const stored = localStorage.getItem('theria-savings');
    return stored ? JSON.parse(stored) : initialSavings;
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
  const addAccount = (account: Omit<Account, 'id' | 'createdAt'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAccounts([...accounts, newAccount]);
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