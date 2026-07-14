import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { Edit, Trash2, MoreVertical, List, Grid, Square, ChevronLeft, ChevronRight, ChevronUp, PiggyBank } from 'lucide-react';
import { IconComponent } from '../../../shared/components/IconComponent';
import { Button } from '../../../shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../shared/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { AddAccountModal } from '../components/AddAccountModal';
import { AccountCardVisual } from '../../../shared/components/AccountCardVisual';
import { formatAccountCurrency } from '../../../shared/lib/currencies';
import { motion, AnimatePresence } from 'motion/react';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FinanceBuddy, type BuddyMood } from '../../../shared/components/FinanceBuddy';
import { TerryToggle } from '../../../shared/components/TerryToggle';
import { useTerry } from '../../../core/state/TerryContext';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';

const CATEGORIES_PER_PAGE = 3;

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
  const { terryVisible, setTerryVisible } = useTerry();

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
  
  const uncategorized = filteredAccounts.filter(acc => !accountCategories.find(c => c.id === acc.categoryId));
  const groupedAccounts = [
    ...accountCategories.map(category => ({
      category,
      accounts: filteredAccounts.filter(acc => acc.categoryId === category.id),
    })),
    ...(uncategorized.length
      ? [{ category: { id: 'other', name: 'Other Accounts', color: '#6B7280', iconName: 'Wallet', scope: 'account', createdAt: '' }, accounts: uncategorized }]
      : []),
  ].filter(group => group.accounts.length > 0);

  const handleDelete = (accountId: string) => {
    deleteAccount(accountId);
    setDeleteAccountId(null);
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
  const buddyMood: BuddyMood = accounts.length === 0 ? 'neutral' : allBalance >= 0 ? 'happy' : 'concerned';
  const buddyLines: string[] = [];
  if (accounts.length === 0) {
    buddyLines.push('No accounts yet — tap the + button and tell me where your money lives!');
    buddyLines.push('Start with your wallet and your main bank account.');
  } else {
    buddyLines.push(
      `You've got **${formatCurrency(allBalance)}** across **${accounts.length}** ${accounts.length === 1 ? 'account' : 'accounts'}.`,
    );
    if (biggestAccount) {
      buddyLines.push(
        `**${biggestAccount.name}** holds the most — **${formatCurrency(biggestAccount.balance, biggestAccount.currency)}**.`,
      );
    }
    if (savingsAccountCount > 0) {
      buddyLines.push(
        `**${savingsAccountCount}** of them ${savingsAccountCount === 1 ? 'is' : 'are'} savings — future you approves!`,
      );
    }
    buddyLines.push('Tap an account to edit it, or use the filter to browse by category.');
  }

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="accounts" />

      {/* Terry counts the vaults */}
      <AnimatePresence initial={false}>
        {terryVisible && (
          <motion.div
            key="terry-buddy"
            initial={{ opacity: 0, height: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <FinanceBuddy lines={buddyLines} mood={buddyMood} onDismiss={() => setTerryVisible(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Category Filter */}
      <AnimatePresence initial={false}>
        {filterOpen && (
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
      {/* Accounts overview — amber take on the dashboard balance widget */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-amber-100/80 p-4 shadow-sm dark:bg-amber-950/40 sm:p-5">
        <TerryToggle className="absolute left-3 top-3 z-20" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-amber-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl"
        />

        <div className="relative flex items-center gap-4 sm:gap-5">
          {/* Balance circle */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="rounded-full border border-border/40 bg-card/40 p-1.5 shadow-sm">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[6px] border-amber-600 bg-card px-3 text-center shadow-inner sm:h-32 sm:w-32">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Balance
                </span>
                <span
                  className="mt-0.5 w-full whitespace-nowrap text-base font-bold tracking-tight tabular-nums text-foreground"
                  title={formatCurrency(totalBalance)}
                >
                  {formatCompactCurrency(totalBalance, formatCurrency)}
                </span>
              </div>
            </div>
            <p className="max-w-32 text-center text-[10px] font-medium leading-tight text-muted-foreground sm:max-w-36">
              {filterCategoryId === 'all'
                ? `${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`
                : `${filteredAccounts.length} in this category`}
            </p>
          </div>

          {/* Counts — plain, no boxes */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">Accounts</p>
              <p className="text-base font-bold tabular-nums text-amber-700 dark:text-amber-400">
                {accounts.length}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">Savings accounts</p>
              <p className="text-base font-bold tabular-nums text-foreground">{savingsAccountCount}</p>
            </div>
          </div>

          {/* Layout switcher — the single box */}
          <div className="flex shrink-0 flex-col justify-center gap-1.5 rounded-2xl bg-card/70 px-2 py-2 shadow-sm">
            {(
              [
                { key: 'list', icon: List, label: 'List view' },
                { key: 'small', icon: Grid, label: 'Small card view' },
                { key: 'full', icon: Square, label: 'Full card view' },
              ] as const
            ).map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setViewLayout(option.key)}
                  title={option.label}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    viewLayout === option.key
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add / Edit Account modal — reuses the add modal so edit always matches add */}
      <AddAccountModal
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        editId={editingAccount}
      />

      {/* Accounts grouped + scrollable */}
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
            {/* List View */}
            {viewLayout === 'list' && (
              <div className="space-y-2">
                {group.accounts.map((account) => (
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
              </div>
            )}
            
            {/* Small Card View */}
            {viewLayout === 'small' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {group.accounts.map((account) => (
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
                ))}
              </div>
            )}
            
            {/* Full Card View — drawn in the account's chosen display style */}
            {viewLayout === 'full' && (
              <div className="grid grid-cols-2 gap-3">
                {group.accounts.map((account) => (
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
                ))}
              </div>
            )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredAccounts.length === 0 && (
          <EmptyState
            title={
              filterCategoryId === 'all'
                ? 'No accounts yet'
                : 'No accounts in this category'
            }
            hint="Use the + button to add one"
          />
        )}
      </div>

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
