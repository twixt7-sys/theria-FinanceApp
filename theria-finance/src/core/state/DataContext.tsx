import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createLocalRepository } from '../data/localRepository';
import type { ItemOf, TheriaRepository } from '../data/repository';
import { newId } from '../domain/ids';
import { withBalances, withSpent } from '../domain/ledger';
import { buildRichMockData } from '../domain/mockData';
import { COLLECTION_KEYS, emptyData } from '../domain/types';
import type {
  Account,
  AccountView,
  Budget,
  BudgetView,
  Category,
  CollectionKey,
  LedgerRecord,
  Savings,
  Stream,
  TheriaData,
} from '../domain/types';

export type {
  Account,
  AccountView,
  Budget,
  BudgetView,
  Category,
  LedgerRecord,
  Savings,
  Stream,
  TheriaData,
} from '../domain/types';

/** @deprecated Use `LedgerRecord`; `Record` shadows the TypeScript built-in. */
export type { LedgerRecord as Record } from '../domain/types';

/** Fields the caller supplies; id and createdAt are assigned here. */
type NewItem<T> = Omit<T, 'id' | 'createdAt'>;

interface DataContextType {
  /** Accounts with their derived `balance`. */
  accounts: AccountView[];
  streams: Stream[];
  categories: Category[];
  records: LedgerRecord[];
  /** Budgets with their derived `spent`. */
  budgets: BudgetView[];
  savings: Savings[];
  addAccount: (account: NewItem<Account>) => Account;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addStream: (stream: NewItem<Stream>) => void;
  updateStream: (id: string, stream: Partial<Stream>) => void;
  deleteStream: (id: string) => void;
  addCategory: (category: NewItem<Category>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addRecord: (record: NewItem<LedgerRecord>) => void;
  updateRecord: (id: string, record: Partial<LedgerRecord>) => void;
  deleteRecord: (id: string) => void;
  addBudget: (budget: NewItem<Budget>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSavings: (savings: NewItem<Savings>) => void;
  updateSavings: (id: string, savings: Partial<Savings>) => void;
  deleteSavings: (id: string) => void;
  clearDatabase: () => void;
  populateDatabase: () => void;
  /** Bulk-append pre-linked starter data (onboarding) — ids come from the caller. */
  seedData: (payload: { categories?: Category[]; accounts?: Account[]; streams?: Stream[] }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Broadcasts a freshly-added item so the guided tutorial can react to the user
 * completing a hands-on "add your first ___" step.
 */
const notifyItemAdded = (kind: string) => {
  try {
    window.dispatchEvent(new CustomEvent('theria:item-added', { detail: { kind } }));
  } catch {
    /* SSR / non-DOM guard */
  }
};

export const DataProvider: React.FC<{
  children: React.ReactNode;
  /** Swapped for the Firestore repository once the user signs in. */
  repository?: TheriaRepository;
}> = ({ children, repository }) => {
  const repoRef = useRef<TheriaRepository>(repository ?? createLocalRepository());
  if (repository && repoRef.current !== repository) repoRef.current = repository;
  const repo = repoRef.current;

  const [data, setData] = useState<TheriaData>(emptyData);

  useEffect(() => {
    let cancelled = false;
    repo.load().then((loaded) => {
      if (!cancelled) setData(loaded);
    });
    const unsubscribe = repo.subscribe?.((next) => {
      if (!cancelled) setData(next);
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [repo]);

  /**
   * One CRUD trio per collection, generated rather than hand-written six times.
   * `kind` is what the tutorial listens for.
   */
  const makeCrud = useCallback(
    <K extends CollectionKey>(collection: K, kind: string) => {
      type Item = ItemOf<K>;

      const add = (fields: NewItem<Item>): Item => {
        const item = {
          ...fields,
          id: newId(),
          createdAt: new Date().toISOString(),
        } as Item;
        setData((current) => ({ ...current, [collection]: [...current[collection], item] }));
        void repo.put(collection, item);
        notifyItemAdded(kind);
        return item;
      };

      const update = (id: string, patch: Partial<Item>) => {
        setData((current) => {
          const next = (current[collection] as Item[]).map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          );
          const updated = next.find((item) => item.id === id);
          if (updated) void repo.put(collection, updated);
          return { ...current, [collection]: next };
        });
      };

      const remove = (id: string) => {
        setData((current) => ({
          ...current,
          [collection]: (current[collection] as Item[]).filter((item) => item.id !== id),
        }));
        void repo.remove(collection, id);
      };

      return { add, update, remove };
    },
    [repo],
  );

  const accountsCrud = useMemo(() => makeCrud('accounts', 'account'), [makeCrud]);
  const streamsCrud = useMemo(() => makeCrud('streams', 'stream'), [makeCrud]);
  const categoriesCrud = useMemo(() => makeCrud('categories', 'category'), [makeCrud]);
  const recordsCrud = useMemo(() => makeCrud('records', 'record'), [makeCrud]);
  const budgetsCrud = useMemo(() => makeCrud('budgets', 'budget'), [makeCrud]);
  const savingsCrud = useMemo(() => makeCrud('savings', 'savings'), [makeCrud]);

  // Balances and budget spend are derived, so deleting or editing a record
  // reverses its effect automatically — no compensating writes anywhere.
  const accounts = useMemo(
    () => withBalances(data.accounts, data.records),
    [data.accounts, data.records],
  );
  const budgets = useMemo(
    () => withSpent(data.budgets, data.records),
    [data.budgets, data.records],
  );

  const replaceAll = useCallback(
    (next: TheriaData) => {
      setData(next);
      void repo.replaceAll(next);
    },
    [repo],
  );

  const seedData = useCallback<DataContextType['seedData']>(
    ({ categories = [], accounts: newAccounts = [], streams = [] }) => {
      setData((current) => {
        const next: TheriaData = {
          ...current,
          categories: [...current.categories, ...categories],
          accounts: [...current.accounts, ...newAccounts],
          streams: [...current.streams, ...streams],
        };
        void repo.replaceAll(next);
        return next;
      });
    },
    [repo],
  );

  const value = useMemo<DataContextType>(
    () => ({
      accounts,
      streams: data.streams,
      categories: data.categories,
      records: data.records,
      budgets,
      savings: data.savings,
      addAccount: accountsCrud.add,
      updateAccount: accountsCrud.update,
      deleteAccount: accountsCrud.remove,
      addStream: streamsCrud.add,
      updateStream: streamsCrud.update,
      deleteStream: streamsCrud.remove,
      addCategory: categoriesCrud.add,
      updateCategory: categoriesCrud.update,
      deleteCategory: categoriesCrud.remove,
      addRecord: recordsCrud.add,
      updateRecord: recordsCrud.update,
      deleteRecord: recordsCrud.remove,
      addBudget: budgetsCrud.add,
      updateBudget: budgetsCrud.update,
      deleteBudget: budgetsCrud.remove,
      addSavings: savingsCrud.add,
      updateSavings: savingsCrud.update,
      deleteSavings: savingsCrud.remove,
      clearDatabase: () => replaceAll(emptyData()),
      populateDatabase: () => replaceAll(buildRichMockData()),
      seedData,
    }),
    [
      accounts,
      budgets,
      data.streams,
      data.categories,
      data.records,
      data.savings,
      accountsCrud,
      streamsCrud,
      categoriesCrud,
      recordsCrud,
      budgetsCrud,
      savingsCrud,
      replaceAll,
      seedData,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export { COLLECTION_KEYS };
