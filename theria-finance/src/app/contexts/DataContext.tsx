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
  accountId: string;
  target: number;
  current: number;
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
  { id: '1', type: 'income', amount: 5000, toAccountId: '1', streamId: '1', note: 'Monthly salary', date: '2026-01-01', createdAt: new Date().toISOString() },
  { id: '2', type: 'expense', amount: 250, fromAccountId: '1', streamId: '3', note: 'Weekly groceries', date: '2026-01-02', createdAt: new Date().toISOString() },
  { id: '3', type: 'expense', amount: 50, fromAccountId: '1', streamId: '4', note: 'Gas', date: '2026-01-02', createdAt: new Date().toISOString() },
  { id: '4', type: 'transfer', amount: 1000, fromAccountId: '1', toAccountId: '2', streamId: 'unaccounted', note: 'Monthly savings', date: '2026-01-03', createdAt: new Date().toISOString() },
];

const initialBudgets: Budget[] = [
  { id: '1', streamId: '3', limit: 500, spent: 250, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '2', streamId: '4', limit: 200, spent: 50, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
  { id: '3', streamId: '5', limit: 300, spent: 0, period: 'monthly', startDate: '2026-01-01', endDate: '2026-01-31', createdAt: new Date().toISOString() },
];

const initialSavings: Savings[] = [
  { id: '1', accountId: '2', target: 15000, current: 12500, period: 'yearly', startDate: '2026-01-01', endDate: '2026-12-31', createdAt: new Date().toISOString() },
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
    const stored = localStorage.getItem('theria-records');
    return stored ? JSON.parse(stored) : initialRecords;
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