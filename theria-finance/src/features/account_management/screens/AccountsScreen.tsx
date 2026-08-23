import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import {
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FolderOpen,
  PiggyBank,
  Plus,
  Search,
  X,
} from '@/shared/icons';
import { IconComponent } from '../../../shared/components/IconComponent';
import { Badge } from '../../../shared/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { AddAccountModal } from '../components/AddAccountModal';
import { AddRecordModal } from '../../records/components/AddRecordModal';
import { CategoryManager } from '../../../shared/components/categories/CategoryManager';
import { AddCategoryModal } from '../../../shared/components/categories/AddCategoryModal';
import { BalanceOverviewCard, type AccountsView } from '../components/BalanceOverviewCard';
import { AccountsBoard, type AccountGroup } from '../components/AccountsBoard';
import { AccountCardVisual } from '../../../shared/components/AccountCardVisual';
import { formatAccountCurrency } from '../../../shared/lib/currencies';
import { motion, AnimatePresence } from 'motion/react';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { TerryPanel } from '../../../features/terry/TerryPanel';
import { buildAccountsTerry } from '../../../features/terry/terryLines';
import { STORAGE_KEYS } from '../../../core/constants/appStorage';
import { readJsonFromLocalStorage, writeJsonToLocalStorage } from '../../../core/lib/localStorageJson';
import type { Account, AccountView } from '../../../core/domain/types';

const CATEGORIES_PER_PAGE = 3;
/** Sort key for accounts with no manual order yet — keeps them last, stably. */
const ORDER_LAST = Number.MAX_SAFE_INTEGER;

interface AccountsScreenProps {
  filterOpen: boolean;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  filterOpen,
}) => {
  const { accounts, categories, savings, deleteAccount, updateAccount } = useData();
  const { mainCurrency } = useCurrency();
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [detailsAccountId, setDetailsAccountId] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [categoryPage, setCategoryPage] = useState(0);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addCategoryId, setAddCategoryId] = useState<string | undefined>(undefined);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  // Accounts · Archive · Categories — driven by the overview card's pill.
  const [activeView, setActiveView] = useState<AccountsView>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [recordPrefill, setRecordPrefill] = useState<{ type: 'income' | 'expense'; accountId: string } | null>(null);
  // Privacy toggle for the headline balance — remembered across sessions.
  const [balanceHidden, setBalanceHidden] = useState<boolean>(
    () => readJsonFromLocalStorage<boolean>(STORAGE_KEYS.balanceHidden) ?? false,
  );

  const toggleBalanceHidden = () => {
    setBalanceHidden((prev) => {
      const next = !prev;
      writeJsonToLocalStorage(STORAGE_KEYS.balanceHidden, next);
      return next;
    });
  };

  const formatCurrency = (amount: number, currencyCode = mainCurrency) =>
    formatAccountCurrency(amount, currencyCode);

  const accountCategories = categories.filter(c => c.scope === 'account');
  const categoryNameFor = (account: AccountView) =>
    categories.find((c) => c.id === account.categoryId)?.name;

  // Active vs. archived split — the pill decides which set the screen shows.
  const activeAccounts = useMemo(() => accounts.filter((a) => !a.archived), [accounts]);
  const archivedAccounts = useMemo(() => accounts.filter((a) => a.archived), [accounts]);
  const isArchivedView = activeView === 'archived';
  const viewAccounts = isArchivedView ? archivedAccounts : activeAccounts;

  const totalCategoryPages = Math.max(1, Math.ceil(accountCategories.length / CATEGORIES_PER_PAGE));
  const pagedAccountCategories = accountCategories.slice(
    categoryPage * CATEGORIES_PER_PAGE,
    (categoryPage + 1) * CATEGORIES_PER_PAGE,
  );

  useEffect(() => {
    setCategoryPage((p) => Math.min(p, totalCategoryPages - 1));
  }, [totalCategoryPages]);

  // Category filter feeds the headline balance; search only narrows the cards.
  const categoryFiltered = useMemo(
    () =>
      filterCategoryId === 'all'
        ? viewAccounts
        : viewAccounts.filter((acc) => acc.categoryId === filterCategoryId),
    [viewAccounts, filterCategoryId],
  );

  const searchFiltered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') return categoryFiltered;
    return categoryFiltered.filter(
      (acc) =>
        acc.name.toLowerCase().includes(query) ||
        (acc.bankName?.toLowerCase().includes(query) ?? false),
    );
  }, [categoryFiltered, searchQuery]);

  const totalBalance = categoryFiltered.reduce((sum, acc) => sum + acc.balance, 0);

  // Manual drag order first (stable), leaving un-ordered accounts in place.
  const orderAccounts = <T extends AccountView>(list: T[]): T[] =>
    [...list].sort((a, b) => (a.order ?? ORDER_LAST) - (b.order ?? ORDER_LAST));

  // Show every category (even empty) so each one carries its own inline "+" tile,
  // matching the organizing strategy used by the streams module. Archived view
  // only lists the categories that actually hold archived accounts.
  const groupedAccounts = useMemo<AccountGroup[]>(() => {
    const cats =
      filterCategoryId === 'all'
        ? accountCategories
        : accountCategories.filter((c) => c.id === filterCategoryId);
    const groups: AccountGroup[] = cats.map((category) => ({
      category,
      accounts: orderAccounts(searchFiltered.filter((acc) => acc.categoryId === category.id)),
    }));
    const uncategorized = orderAccounts(
      searchFiltered.filter((acc) => !accountCategories.find((c) => c.id === acc.categoryId)),
    );
    if (uncategorized.length && filterCategoryId === 'all') {
      groups.push({
        category: { id: 'other', name: 'Other Accounts', color: '#6B7280' },
        accounts: uncategorized,
      });
    }
    // Archived view has no inline add tiles, so hide the empty groups entirely.
    return isArchivedView ? groups.filter((g) => g.accounts.length > 0) : groups;
  }, [accountCategories, searchFiltered, filterCategoryId, isArchivedView]);

  // Allocation strip data — positive holdings of the live accounts, biggest first.
  const allocation = useMemo(() => {
    const cats =
      filterCategoryId === 'all'
        ? accountCategories
        : accountCategories.filter((c) => c.id === filterCategoryId);
    const slices = cats.map((category) => ({
      name: category.name,
      color: category.color || '#6B7280',
      value: activeAccounts
        .filter((acc) => acc.categoryId === category.id)
        .reduce((sum, acc) => sum + Math.max(0, acc.balance), 0),
    }));
    return slices.filter((slice) => slice.value > 0).sort((a, b) => b.value - a.value);
  }, [accountCategories, activeAccounts, filterCategoryId]);

  // Drag-and-drop only makes sense on the unfiltered, unsearched live view —
  // anywhere else the cards are a subset and reordering would be ambiguous.
  const dndEnabled =
    activeView === 'accounts' && filterCategoryId === 'all' && searchQuery.trim() === '';
  // Stable references so the board's resync effect only fires on real changes.
  const boardGroups = useMemo(
    () => groupedAccounts.filter((g) => g.category.id !== 'other'),
    [groupedAccounts],
  );
  const otherGroup = useMemo(
    () => groupedAccounts.find((g) => g.category.id === 'other'),
    [groupedAccounts],
  );

  const handleDelete = (accountId: string) => {
    deleteAccount(accountId);
    setDeleteAccountId(null);
  };

  const setArchived = (accountId: string, archived: boolean) => {
    updateAccount(accountId, { archived });
    setDetailsAccountId(null);
  };

  // Persist a drag: each account's category + position (0-based) within it.
  const commitAccountOrder = (containers: Record<string, string[]>) => {
    Object.entries(containers).forEach(([categoryId, ids]) => {
      ids.forEach((id, index) => {
        const account = accounts.find((a) => a.id === id);
        if (!account) return;
        const patch: Partial<Account> = {};
        if (account.categoryId !== categoryId) patch.categoryId = categoryId;
        if (account.order !== index) patch.order = index;
        if (Object.keys(patch).length > 0) updateAccount(id, patch);
      });
    });
  };

  const openAddForCategory = (categoryId?: string) => {
    setEditingAccount(null);
    setAddCategoryId(categoryId && categoryId !== 'other' ? categoryId : undefined);
    setIsAddOpen(true);
  };

  const closeAccountModal = () => {
    setIsAddOpen(false);
    setEditingAccount(null);
    setAddCategoryId(undefined);
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const savingsAccountCount = activeAccounts.filter((a) => a.isSavings).length;

  const allBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const biggestAccount = activeAccounts.reduce(
    (best, a) => (best === null || a.balance > best.balance ? a : best),
    null as (typeof activeAccounts)[number] | null,
  );

  // Terry keeps count of where the money lives
  const terry = buildAccountsTerry({
    accountCount: activeAccounts.length,
    allBalance,
    savingsAccountCount,
    biggest: biggestAccount
      ? {
          name: biggestAccount.name,
          formattedBalance: formatCurrency(biggestAccount.balance, biggestAccount.currency),
        }
      : null,
    money: formatCurrency,
  });

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="accounts" />

      {/* Terry counts the vaults */}
      <TerryPanel content={terry} />

      {/* Category Filter / analysis bar (accounts + archive views). Carries the
          search toggle at its right edge. Categories tab has its own filter. */}
      <AnimatePresence initial={false}>
        {activeView !== 'categories' && filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex w-full items-center gap-1 rounded-xl bg-card border border-border shadow-sm p-0.5">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setCategoryPage((p) => Math.max(0, p - 1))}
                  disabled={categoryPage === 0}
                  aria-label="Previous categories"
                  className="shrink-0 z-10 p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="flex gap-1 flex-1 justify-center overflow-hidden min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`category-page-${categoryPage}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="flex gap-1 flex-nowrap"
                    >
                      <motion.button
                        key="all"
                        type="button"
                        onClick={() => setFilterCategoryId('all')}
                        className={`shrink-0 whitespace-nowrap px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1 ${
                          filterCategoryId === 'all'
                            ? 'bg-primary text-white shadow'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        title="All categories"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        All
                      </motion.button>
                      {pagedAccountCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          onClick={() => setFilterCategoryId(cat.id)}
                          className={`shrink-0 whitespace-nowrap px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1 ${
                            filterCategoryId === cat.id
                              ? 'bg-primary text-white shadow'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title={cat.name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent name={cat.iconName || 'Wallet'} size={12} className="shrink-0" />
                          <span>{cat.name}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => setCategoryPage((p) => Math.min(totalCategoryPages - 1, p + 1))}
                  disabled={categoryPage >= totalCategoryPages - 1}
                  aria-label="Next categories"
                  className="shrink-0 z-10 p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Search toggle — reveals the search bar under the overview card */}
              <button
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
                aria-pressed={searchOpen}
                title={searchOpen ? 'Hide search' : 'Search'}
                aria-label={searchOpen ? 'Hide search' : 'Search'}
                className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-md border border-border shadow-sm transition-colors ${
                  searchOpen ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Search size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accounts overview — subtle orange balance hero with the view pill */}
      <BalanceOverviewCard
        totalBalance={totalBalance}
        formatCurrency={(amount) => formatCurrency(amount)}
        accountCount={activeAccounts.length}
        archivedCount={archivedAccounts.length}
        categoryCount={accountCategories.length}
        allocation={allocation}
        activeView={activeView}
        onViewChange={setActiveView}
        hidden={balanceHidden}
        onToggleHidden={toggleBalanceHidden}
      />

      {/* Search bar under the card — mirrors the records module, toggleable */}
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex h-9 min-w-0 items-center gap-2 rounded-full border border-border/40 bg-muted px-3 shadow-sm">
              <Search size={14} className="shrink-0 text-muted-foreground" aria-hidden />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={activeView === 'categories' ? 'Search categories' : 'Search accounts'}
                aria-label={activeView === 'categories' ? 'Search categories' : 'Search accounts'}
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Account modal — reuses the add modal so edit always matches add */}
      <AddAccountModal
        isOpen={isAddOpen || !!editingAccount}
        onClose={closeAccountModal}
        editId={editingAccount}
        initialCategoryId={addCategoryId}
      />

      {/* Add Income / Add Expense shortcuts — launched from an account's details */}
      <AddRecordModal
        isOpen={!!recordPrefill}
        onClose={() => setRecordPrefill(null)}
        initialType={recordPrefill?.type}
        initialAccountId={recordPrefill?.accountId}
      />

      {activeView === 'categories' ? (
        <CategoryManager scope="account" filterOpen={filterOpen} searchQuery={searchQuery} />
      ) : (
      /* Accounts (or archived) grouped + scrollable */
      <div className="space-y-4">
        {dndEnabled ? (
          <>
            <AccountsBoard
              groups={boardGroups}
              formatCurrency={formatCurrency}
              categoryNameFor={categoryNameFor}
              collapsedGroupIds={collapsedGroupIds}
              onToggleCollapse={toggleGroupCollapse}
              onCardClick={setDetailsAccountId}
              onAddClick={openAddForCategory}
              onCommit={commitAccountOrder}
            />
            {otherGroup && (
              <StaticAccountsGroup
                group={otherGroup}
                collapsed={collapsedGroupIds.has(otherGroup.category.id)}
                onToggleCollapse={() => toggleGroupCollapse(otherGroup.category.id)}
                formatCurrency={formatCurrency}
                categoryNameFor={categoryNameFor}
                onCardClick={setDetailsAccountId}
              />
            )}
          </>
        ) : (
          groupedAccounts.map((group) => (
            <StaticAccountsGroup
              key={group.category.id}
              group={group}
              collapsed={collapsedGroupIds.has(group.category.id)}
              onToggleCollapse={() => toggleGroupCollapse(group.category.id)}
              formatCurrency={formatCurrency}
              categoryNameFor={categoryNameFor}
              onCardClick={setDetailsAccountId}
              onAddClick={isArchivedView ? undefined : openAddForCategory}
            />
          ))
        )}

        {/* Archived view — nothing to show */}
        {isArchivedView && groupedAccounts.length === 0 && (
          <EmptyState
            title="No archived accounts"
            hint="Archive an account from its details to tuck it away here"
          />
        )}

        {/* Live accounts view — category scaffolding + add-category shortcut */}
        {!isArchivedView && (
          <>
            {accountCategories.length === 0 && (
              <EmptyState
                title="No account categories yet"
                hint="Use the button below to add one"
              />
            )}

            {/* Broken-line add-category shortcut — jumps straight to the modal
                without leaving the Accounts tab. */}
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              title="Add a new account category"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
            >
              <FolderOpen size={16} />
              Add category
            </button>
          </>
        )}
      </div>
      )}

      {/* Add Category modal — reachable directly from the Accounts tab */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        scope="account"
      />

      {/* Account Details Modal */}
      {detailsAccountId && (() => {
        const account = accounts.find((a) => a.id === detailsAccountId);
        if (!account) return null;
        const accountCategory = categories.find((c) => c.id === account.categoryId);
        const isArchived = !!account.archived;
        // Earmarked savings that live in this account (deposits are earmark-only).
        const linkedSavings = savings.filter((s) => s.accountId === account.id && !s.resolved);
        const partitioned = linkedSavings.reduce((sum, s) => sum + s.current, 0);
        const available = account.balance - partitioned;

        return (
          <DetailsModal
            isOpen={!!detailsAccountId}
            onClose={() => setDetailsAccountId(null)}
            title="Account Details"
            onEdit={() => {
              setDetailsAccountId(null);
              setEditingAccount(account.id);
            }}
            onDelete={() => {
              setDetailsAccountId(null);
              setDeleteAccountId(account.id);
            }}
            extraActions={
              isArchived
                ? []
                : [
                    {
                      icon: <Plus size={16} />,
                      label: 'Income',
                      className: 'bg-emerald-500 hover:bg-emerald-600',
                      onClick: () => {
                        setDetailsAccountId(null);
                        setRecordPrefill({ type: 'income', accountId: account.id });
                      },
                    },
                    {
                      icon: <Plus size={16} />,
                      label: 'Expense',
                      className: 'bg-red-500 hover:bg-red-600',
                      onClick: () => {
                        setDetailsAccountId(null);
                        setRecordPrefill({ type: 'expense', accountId: account.id });
                      },
                    },
                  ]
            }
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: account.color }}
                >
                  <IconComponent name={account.iconName} size={16} style={{ color: 'white' }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{account.name}</p>
                  {account.bankName && (
                    <p className="text-xs text-muted-foreground truncate">{account.bankName}</p>
                  )}
                </div>
                {isArchived && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    <Archive size={11} strokeWidth={2.5} />
                    Archived
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-border p-2.5">
                  <p className="text-muted-foreground text-xs">Balance</p>
                  <p className="font-semibold text-primary">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-2.5">
                  <p className="text-muted-foreground text-xs">Category</p>
                  <p className="font-semibold truncate">{accountCategory?.name || 'Uncategorized'}</p>
                </div>
                {account.cardType && (
                  <div className="rounded-lg border border-border p-2.5">
                    <p className="text-muted-foreground text-xs">Card Type</p>
                    <p className="font-semibold capitalize">{account.cardType}</p>
                  </div>
                )}
                <div className="rounded-lg border border-border p-2.5">
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-semibold">{account.isSavings ? 'Savings' : 'Standard'}</p>
                </div>
                {account.accountNumber && (
                  <div className="rounded-lg border border-border p-2.5 col-span-2">
                    <p className="text-muted-foreground text-xs">Account Number</p>
                    <p className="font-semibold font-mono">•••• {account.accountNumber.slice(-4)}</p>
                  </div>
                )}
              </div>

              {/* Funds partitioned toward savings goals/funds linked to this account */}
              {linkedSavings.length > 0 && (
                <div className="rounded-xl border border-pink-500/30 bg-pink-500/5 p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400">
                      <PiggyBank size={13} strokeWidth={2.5} />
                      Partitioned for savings
                    </span>
                    <span className="text-sm font-bold tabular-nums text-pink-600 dark:text-pink-400">
                      {formatCurrency(partitioned, account.currency)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {linkedSavings.map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                          <IconComponent name={s.iconName || 'PiggyBank'} size={12} style={{ color: s.color }} />
                          <span className="truncate">{s.name}</span>
                        </span>
                        <span className="shrink-0 font-semibold tabular-nums text-foreground">
                          {formatCurrency(s.current, account.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-pink-500/20 pt-1.5 text-xs">
                    <span className="text-muted-foreground">Available (unreserved)</span>
                    <span
                      className={`font-bold tabular-nums ${available < 0 ? 'text-destructive' : 'text-foreground'}`}
                    >
                      {formatCurrency(available, account.currency)}
                    </span>
                  </div>
                </div>
              )}

              {/* Archive / restore toggle */}
              <button
                type="button"
                onClick={() => setArchived(account.id, !isArchived)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {isArchived ? (
                  <>
                    <ArchiveRestore size={16} />
                    Restore account
                  </>
                ) : (
                  <>
                    <Archive size={16} />
                    Archive account
                  </>
                )}
              </button>
            </div>
          </DetailsModal>
        );
      })()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountId && handleDelete(deleteAccountId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/**
 * A non-draggable category group — used for the archived list, filtered/searched
 * results, and the "Other" bucket, where reordering isn't offered.
 */
const StaticAccountsGroup: React.FC<{
  group: AccountGroup;
  collapsed: boolean;
  onToggleCollapse: () => void;
  formatCurrency: (amount: number, currencyCode?: AccountView['currency']) => string;
  categoryNameFor: (account: AccountView) => string | undefined;
  onCardClick: (id: string) => void;
  onAddClick?: (categoryId: string) => void;
}> = ({ group, collapsed, onToggleCollapse, formatCurrency, categoryNameFor, onCardClick, onAddClick }) => (
  <div className="space-y-2">
    <button
      type="button"
      onClick={onToggleCollapse}
      className="w-full flex items-center justify-between gap-2 px-1"
    >
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.category.color || '#6B7280' }} />
        <span className="text-xs font-semibold text-foreground">{group.category.name}</span>
        {group.accounts.length > 0 && (
          <Badge variant="outline" className="text-[11px]">
            {group.accounts.length} item{group.accounts.length > 1 ? 's' : ''}
          </Badge>
        )}
      </span>
      <motion.div
        animate={{ rotate: collapsed ? 180 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <ChevronUp size={14} className="text-muted-foreground" />
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 gap-3">
            {group.accounts.map((account) => (
              <div
                key={account.id}
                onClick={() => onCardClick(account.id)}
                className="cursor-pointer transition-transform active:scale-[0.98]"
              >
                <AccountCardVisual
                  size="full"
                  displayStyle={account.displayStyle}
                  name={account.name}
                  bankName={account.bankName}
                  balanceText={formatCurrency(account.balance, account.currency)}
                  categoryName={categoryNameFor(account)}
                  accountNumber={account.accountNumber}
                  iconName={account.iconName}
                  color={account.color}
                  cardType={account.cardType}
                  isSavings={account.isSavings}
                />
              </div>
            ))}
            {onAddClick && (
              <button
                type="button"
                onClick={() => onAddClick(group.category.id)}
                title={`Add account to ${group.category.name}`}
                className="flex min-h-[104px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus size={24} />
                <span className="text-[11px] font-semibold">Add</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
