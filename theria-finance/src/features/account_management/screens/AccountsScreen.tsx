import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight, ChevronUp, PiggyBank, Plus, Wallet, List, FolderOpen } from '@/shared/icons';
import { IconComponent } from '../../../shared/components/IconComponent';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../shared/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { AddAccountModal } from '../components/AddAccountModal';
import { AddRecordModal } from '../../records/components/AddRecordModal';
import { CategoryManager } from '../../../shared/components/categories/CategoryManager';
import { AddCategoryModal } from '../../../shared/components/categories/AddCategoryModal';
import { BalanceOverviewCard } from '../components/BalanceOverviewCard';
import { AccountCardVisual } from '../../../shared/components/AccountCardVisual';
import { CategoryCarousel } from '../../../shared/components/CategoryCarousel';
import { formatAccountCurrency } from '../../../shared/lib/currencies';
import { motion, AnimatePresence } from 'motion/react';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { TerryPanel } from '../../../features/terry/TerryPanel';
import { buildAccountsTerry } from '../../../features/terry/terryLines';
import { STORAGE_KEYS } from '../../../core/constants/appStorage';
import { readJsonFromLocalStorage, writeJsonToLocalStorage } from '../../../core/lib/localStorageJson';

const CATEGORIES_PER_PAGE = 3;
/** Rows shown per swipeable page when the accounts list layout is active. */
const LIST_ROWS_PER_PAGE = 4;
type AccountsTab = 'accounts' | 'categories';

/** Splits a list into fixed-size pages; always yields at least one (possibly empty) page. */
function chunk<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

interface AccountsScreenProps {
  filterOpen: boolean;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  filterOpen,
}) => {
  const { accounts, categories, savings, deleteAccount } = useData();
  const { mainCurrency } = useCurrency();
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [detailsAccountId, setDetailsAccountId] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [categoryPage, setCategoryPage] = useState(0);
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('full');
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addCategoryId, setAddCategoryId] = useState<string | undefined>(undefined);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountsTab>('accounts');
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

  const totalCategoryPages = Math.max(1, Math.ceil(accountCategories.length / CATEGORIES_PER_PAGE));
  const pagedAccountCategories = accountCategories.slice(
    categoryPage * CATEGORIES_PER_PAGE,
    (categoryPage + 1) * CATEGORIES_PER_PAGE,
  );

  useEffect(() => {
    setCategoryPage((p) => Math.min(p, totalCategoryPages - 1));
  }, [totalCategoryPages]);

  const filteredAccounts = useMemo(() => {
    let filtered = accounts;
    
    // Filter by category
    if (filterCategoryId !== 'all') {
      filtered = filtered.filter(acc => acc.categoryId === filterCategoryId);
    }
    
    return filtered;
  }, [accounts, filterCategoryId]);

  const totalBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Show every category (even empty) so each one carries its own inline "+" tile,
  // matching the organizing strategy used by the streams module.
  const groupedAccounts = useMemo(() => {
    const cats =
      filterCategoryId === 'all'
        ? accountCategories
        : accountCategories.filter((c) => c.id === filterCategoryId);
    const groups = cats.map((category) => ({
      category,
      accounts: filteredAccounts.filter((acc) => acc.categoryId === category.id),
    }));
    const uncategorized = filteredAccounts.filter(
      (acc) => !accountCategories.find((c) => c.id === acc.categoryId),
    );
    if (uncategorized.length && filterCategoryId === 'all') {
      groups.push({
        category: { id: 'other', name: 'Other Accounts', color: '#6B7280', iconName: 'Wallet', scope: 'account', createdAt: '' },
        accounts: uncategorized,
      });
    }
    return groups;
  }, [accountCategories, filteredAccounts, filterCategoryId]);

  // Allocation strip data — positive holdings per visible category, biggest first.
  const allocation = useMemo(
    () =>
      groupedAccounts
        .map((group) => ({
          name: group.category.name,
          color: group.category.color || '#6B7280',
          value: group.accounts.reduce((sum, acc) => sum + Math.max(0, acc.balance), 0),
        }))
        .filter((slice) => slice.value > 0)
        .sort((a, b) => b.value - a.value),
    [groupedAccounts],
  );

  const handleDelete = (accountId: string) => {
    deleteAccount(accountId);
    setDeleteAccountId(null);
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

  const allBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const savingsAccountCount = accounts.filter((a) => a.isSavings).length;
  const biggestAccount = accounts.reduce(
    (best, a) => (best === null || a.balance > best.balance ? a : best),
    null as (typeof accounts)[number] | null,
  );

  // Terry keeps count of where the money lives
  const terry = buildAccountsTerry({
    accountCount: accounts.length,
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
      {/* Category Filter (accounts tab only; Categories tab has its own icon filter) */}
      <AnimatePresence initial={false}>
        {activeTab !== 'categories' && filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex w-full rounded-xl bg-card border border-border shadow-sm p-0.5">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Accounts overview — subtle orange balance hero */}
      {activeTab !== 'categories' && (
        <BalanceOverviewCard
          totalBalance={totalBalance}
          formatCurrency={(amount) => formatCurrency(amount)}
          accountCount={accounts.length}
          filteredCount={filteredAccounts.length}
          savingsAccountCount={savingsAccountCount}
          filterActive={filterCategoryId !== 'all'}
          allocation={allocation}
          viewLayout={viewLayout}
          onViewChange={setViewLayout}
          onOpenCategories={() => setActiveTab('categories')}
          hidden={balanceHidden}
          onToggleHidden={toggleBalanceHidden}
        />
      )}

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

      {/* Categories mode gets a slim header with its own way back — the
          Accounts/Categories pill is gone, folded into the overview card. */}
      {activeTab === 'categories' && (
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: 'var(--accent-accounts)' }}
            >
              <Wallet size={13} strokeWidth={2.25} />
            </span>
            Account categories
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            title="Back to accounts"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted active:scale-95"
          >
            <List size={14} strokeWidth={2.25} />
            Accounts
          </button>
        </div>
      )}

      {activeTab === 'categories' ? (
        <CategoryManager scope="account" filterOpen={filterOpen} />
      ) : (
      /* Accounts grouped + scrollable */
      <div className="space-y-4">
        {groupedAccounts.map((group) => (
          <div key={group.category.id} className="space-y-2">
            <button
              type="button"
              onClick={() => toggleGroupCollapse(group.category.id)}
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
                animate={{ rotate: collapsedGroupIds.has(group.category.id) ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ChevronUp size={14} className="text-muted-foreground" />
              </motion.div>
            </button>
            
            <AnimatePresence initial={false}>
              {!collapsedGroupIds.has(group.category.id) && (
                <motion.div
                  key={`accounts-group-${group.category.id}-${viewLayout}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
            {/* List View — rows paged in chunks so each category swipes horizontally */}
            {viewLayout === 'list' && (
              <CategoryCarousel perPage={1} gapRem={0.75} ariaLabel="Accounts">
                {chunk(group.accounts, LIST_ROWS_PER_PAGE).map((rows, pageIndex, pages) => (
                  <div key={`list-page-${pageIndex}`} className="space-y-2">
                    {rows.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setDetailsAccountId(account.id)}
                    className="relative flex items-center justify-between bg-card border border-border rounded-xl p-3.5 transition-all duration-200 cursor-pointer group hover:shadow-sm hover:border-primary/25"
                    style={{}}
                  >
                    <div className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full opacity-75" style={{ backgroundColor: account.color }} />
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: account.color }}
                      >
                        <IconComponent
                          name={account.iconName}
                          size={18}
                          style={{ color: 'white' }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm tracking-tight">{account.name}</h3>
                          {account.isSavings && (
                            <span className="inline-block px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded-full">
                              Savings
                            </span>
                          )}
                          {account.cardType && (
                            <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                              {account.cardType.charAt(0).toUpperCase() + account.cardType.slice(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {categories.find(c => c.id === account.categoryId)?.name || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary">
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingAccount(account.id)}>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteAccountId(account.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                    ))}

                    {/* Subtle inline add — lives on the last page of the category */}
                    {pageIndex === pages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => openAddForCategory(group.category.id)}
                        title={`Add account to ${group.category.name}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Plus size={16} />
                        Add account
                      </button>
                    )}
                  </div>
                ))}
              </CategoryCarousel>
            )}

            {/* Small Card View */}
            {viewLayout === 'small' && (
              <CategoryCarousel perPage={2} gapRem={0.625} ariaLabel="Accounts">
                {[...group.accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setDetailsAccountId(account.id)}
                    className="relative flex flex-col bg-card border border-border rounded-xl p-3.5 transition-all duration-200 cursor-pointer group min-h-[128px] hover:shadow-md hover:border-primary/25"
                    style={{}}
                  >
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full opacity-75"
                      style={{ backgroundColor: account.color }}
                      aria-hidden
                    />
                    <div className="flex-1 grid grid-cols-1">
                      <div className="flex items-center justify-between gap-2.5 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5"
                            style={{ backgroundColor: account.color }}
                          >
                            <IconComponent
                              name={account.iconName}
                              size={18}
                              style={{ color: 'white' }}
                            />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-semibold truncate text-sm tracking-tight">{account.name}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize inline-flex w-fit bg-primary/10 text-primary">
                              {categories.find(c => c.id === account.categoryId)?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <p className="text-base font-bold px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary w-fit">
                          {formatCurrency(account.balance, account.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                )),
                  <button
                    key="add-small"
                    type="button"
                    onClick={() => openAddForCategory(group.category.id)}
                    title={`Add account to ${group.category.name}`}
                    className="flex min-h-[128px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus size={22} />
                    <span className="text-[11px] font-semibold">Add</span>
                  </button>,
                ]}
              </CategoryCarousel>
            )}

            {/* Full Card View — drawn in the account's chosen display style */}
            {viewLayout === 'full' && (
              <CategoryCarousel perPage={2} gapRem={0.75} ariaLabel="Accounts">
                {[...group.accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setDetailsAccountId(account.id)}
                    className="cursor-pointer transition-transform active:scale-[0.98]"
                  >
                    <AccountCardVisual
                      size="full"
                      displayStyle={account.displayStyle}
                      name={account.name}
                      bankName={account.bankName}
                      balanceText={formatCurrency(account.balance, account.currency)}
                      categoryName={categories.find((c) => c.id === account.categoryId)?.name}
                      accountNumber={account.accountNumber}
                      iconName={account.iconName}
                      color={account.color}
                      cardType={account.cardType}
                      isSavings={account.isSavings}
                    />
                  </div>
                )),
                  <button
                    key="add-full"
                    type="button"
                    onClick={() => openAddForCategory(group.category.id)}
                    title={`Add account to ${group.category.name}`}
                    className="flex min-h-[104px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus size={24} />
                    <span className="text-[11px] font-semibold">Add</span>
                  </button>,
                ]}
              </CategoryCarousel>
            )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

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
            extraActions={[
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
            ]}
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
