import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { useAlert } from '../../../core/state/AlertContext';
import { Edit, Trash2, MoreVertical, List, Grid, Square, ChevronLeft, ChevronRight, MessageSquare, ChevronUp, Coins } from 'lucide-react';
import { IconComponent } from '../../../shared/components/IconComponent';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../shared/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Calculator } from '../../../shared/components/Calculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/components/ui/dialog';
import { Textarea } from '../../../shared/components/ui/textarea';
import { IconColorSubModal, SelectionModal, CurrencySelectionModal } from '../../../shared/components/submodals';
import { motion, AnimatePresence } from 'motion/react';
import { formatAccountCurrency } from '../../../shared/lib/currencies';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FinanceBuddy, type BuddyMood } from '../../../shared/components/FinanceBuddy';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';

const CATEGORIES_PER_PAGE = 3;

interface AccountsScreenProps {
  filterOpen: boolean;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  filterOpen,
}) => {
  const { accounts, categories, addAccount, updateAccount, deleteAccount } = useData();
  const { showAddAlert } = useAlert();
  const { mainCurrency } = useCurrency();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [categoryPage, setCategoryPage] = useState(0);
  
  // Form state
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [iconName, setIconName] = useState('Wallet');
  const [color, setColor] = useState('#10B981');
  const [isSavings, setIsSavings] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [cardType, setCardType] = useState<'debit' | 'credit' | 'checking' | 'savings' | 'none'>('none');
  const [currency, setCurrency] = useState(mainCurrency);
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('full');
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  // Session-only: Terry returns the next time the page is opened.
  const [buddyDismissed, setBuddyDismissed] = useState(false);

  // Modals
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

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

  const groupedByCategory = useMemo(() => {
    const categoryGroups: { [key: string]: { category: { id: string; name: string; color?: string }, items: any[] } } = accountCategories.reduce((acc, category) => {
      const categoryName = category.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: { id: categoryName, name: categoryName, color: category.color },
          items: []
        };
      }
      acc[categoryName].items.push(category);
      return acc;
    }, {} as { [key: string]: { category: { id: string; name: string; color?: string }, items: any[] } });
    
    return Object.values(categoryGroups);
  }, [accountCategories]);
  
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

  const resetForm = () => {
    setName('');
    setBalance('');
    setCategoryId('');
    setIconName('Wallet');
    setColor('#10B981');
    setIsSavings(false);
    setBankName('');
    setAccountNumber('');
    setRoutingNumber('');
    setCardType('none');
    setCurrency(mainCurrency);
    setEditingAccount(null);
  };

  const handleEdit = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setName(account.name);
      setBalance(account.balance.toString());
      setCategoryId(account.categoryId);
      setIconName(account.iconName);
      setColor(account.color);
      setIsSavings(account.isSavings || false);
      setBankName(account.bankName || '');
      setAccountNumber(account.accountNumber || '');
      setRoutingNumber(account.routingNumber || '');
      setCardType(account.cardType || 'none');
      setCurrency(account.currency || mainCurrency);
      setEditingAccount(accountId);
      setIsAddOpen(true);
    }
  };

  const handleDelete = (accountId: string) => {
    deleteAccount(accountId);
    setDeleteAccountId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !balance) return;

    if (editingAccount) {
      updateAccount(editingAccount, {
        name,
        balance: parseFloat(balance),
        categoryId: categoryId || accountCategories[0]?.id || '1',
        iconName,
        color,
        isSavings,
        bankName,
        accountNumber,
        routingNumber,
        ...(cardType !== 'none' && { cardType }),
        currency,
      });
    } else {
      addAccount({
        name,
        balance: parseFloat(balance),
        categoryId: categoryId || accountCategories[0]?.id || '1',
        iconName,
        color,
        isSavings,
        bankName,
        accountNumber,
        routingNumber,
        ...(cardType !== 'none' && { cardType }),
        currency,
      });
    }

    const formattedBalance = formatAccountCurrency(parseFloat(balance), currency);
    
    showAddAlert(`Account "${name}"`, `Starting balance: ${formattedBalance}`);

    resetForm();
    setIsAddOpen(false);
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
      {!buddyDismissed && (
        <FinanceBuddy lines={buddyLines} mood={buddyMood} onDismiss={() => setBuddyDismissed(true)} />
      )}
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

      {/* Add/Edit Modal */}
      <CompactFormModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        title={editingAccount ? 'Edit Account' : 'Add Account'}
      >
        <div className="space-y-2">
        {/* Account Card Preview */}
        <div className="flex items-center justify-center p-2 bg-muted/20 rounded-lg border">
          <div 
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-2 my-2 transition-all cursor-pointer min-h-[80px] max-w-[200px] w-full overflow-hidden shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${color}dd, ${color}99)`,
              boxShadow: '0 8px 20px rgba(0,0,0,0.3), 0 12px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-white/20"></div>
              <div className="absolute bottom-1 left-1 w-6 h-6 rounded-full border-2 border-white/15"></div>
              <div className="absolute top-1/2 right-1/4 w-4 h-4 rounded-full border-2 border-white/10"></div>
            </div>
            
            <div className="absolute -top-2 right-1 w-10 h-10 opacity-8 transform translate-x-3 translate-y-1 scale-[2] rotate-12">
              <IconComponent
                name={iconName}
                size={40}
                style={{ color: 'white', transform: 'scaleX(-1)' }}
              />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center shadow-md backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <IconComponent
                      name={iconName}
                      size={8}
                      style={{ color: 'white' }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-[10px] truncate">{name || 'Account Name'}</h3>
                    {bankName && (
                      <p className="text-white/80 text-[8px]">{bankName}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    {cardType && cardType !== 'none' && (
                      <span className="px-0.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[6px] rounded-full font-medium">
                        {cardType === 'checking' ? 'Checking' : 
                         cardType === 'savings' ? 'Savings' : 
                         cardType === 'debit' ? 'Debit' : 'Credit'}
                      </span>
                    )}
                    {isSavings && (
                      <span className="px-0.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[6px] rounded-full font-medium">
                        Savings
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-1">
                {accountNumber && (
                  <div className="text-white/90 font-mono text-[8px] tracking-wider">
                    •••• •••• •••• {accountNumber.slice(-4)}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/70 text-[6px] mb-0.5">Balance</p>
                  <p className="text-white font-bold text-[10px]">
                    {balance
                      ? formatAccountCurrency(parseFloat(balance) || 0, currency)
                      : formatAccountCurrency(0, currency)}
                  </p>
                </div>
                
                <div className="text-right">
                  {accountCategories.find(c => c.id === categoryId) && (
                    <p className="text-white/60 text-[6px]">
                      {accountCategories.find(c => c.id === categoryId)?.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="my-2 h-px w-full bg-border/80" />

        {/* Account Name and Icon */}
        <div className="grid grid-cols-12">
          <Input
            className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
            placeholder='Account Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid col-span-2">
            <button
            type="button"
            onClick={() => setShowIconModal(true)}
            className="h-full ml-1.5 rounded-xl border border-border hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
            title="Choose icon"
            style={{ backgroundColor: (iconName !== 'Wallet' || color !== '#10B981') ? color : undefined, borderColor: (iconName !== 'Wallet' || color !== '#10B981') ? color : undefined }}
          >
            {iconName !== 'Wallet' || color !== '#10B981' ? (
              <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
            ) : (
              <IconComponent name="Wallet" size={14} className="text-muted-foreground" />
            )}
          </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowBankModal(true)}
            className={`flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl border border-border transition-all shadow-md ${
              bankName || accountNumber || routingNumber
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-card hover:bg-muted'
            }`}
            title="Bank Information"
          >
            <IconComponent
              name="Landmark"
              size={14}
              className={
                bankName || accountNumber || routingNumber
                  ? 'text-green-500'
                  : 'text-muted-foreground'
              }
            />
            <span
              className={`text-[10px] font-semibold truncate ${
                bankName || accountNumber || routingNumber
                  ? 'text-green-500'
                  : 'text-muted-foreground'
              }`}
            >
              {bankName || 'Bank Information'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowCurrencyModal(true)}
            className={`flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl border border-border transition-all shadow-md ${
              currency !== mainCurrency
                ? 'bg-primary/10 border-primary/25'
                : 'bg-card hover:bg-muted'
            }`}
            title="Account currency"
          >
            <Coins
              size={14}
              className={
                currency !== mainCurrency ? 'text-primary' : 'text-muted-foreground'
              }
            />
            <span
              className={`text-[10px] font-semibold ${
                currency !== mainCurrency ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {currency}
            </span>
          </button>
        </div>

        <div className="my-2 h-px w-full bg-border/80" />
        
        {/* Note, Category, and Savings Toggle */}
        <div className='grid grid-cols-3 gap-2'>
          {/* Note button - 1/3 ratio */}
          <div className='col-span-1'>
            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className={`h-full rounded-xl border border-border transition-colors flex flex-col items-center justify-center gap-1 text-[10px] font-semibold shadow-sm w-full ${
                note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
              }`}
              title="Add note"
            >
              <MessageSquare size={14} className={note ? 'text-green-500' : 'text-muted-foreground'} />
              <span className={`text-[8px] ${note ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                {note ? 'Edit note' : 'Add note'}
              </span>
            </button>
          </div>

          {/* Category and Savings Toggle - 2/3 ratio */}
          <div className='col-span-2 space-y-2'>
            {/* Category */}
            <button
              className="flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full"
              type="button"
              onClick={() => setShowCategoryModal(true)}
              style={{ backgroundColor: categoryId ? accountCategories.find(c => c.id === categoryId)?.color + '20' : undefined, borderColor: categoryId ? accountCategories.find(c => c.id === categoryId)?.color : undefined }}
            >
              <div className="pl-6">
                {categoryId ? (
                  <IconComponent name={accountCategories.find(c => c.id === categoryId)?.iconName || 'Folder'} className='mr-3' size={18} style={{ color: accountCategories.find(c => c.id === categoryId)?.color }} />
                ) : (
                  <IconComponent name="Folder" className='mr-3' size={18} />
                )}
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-[8px] text-muted-foreground mb-0.5">Category</span>
                <span className="text-[10px] font-medium truncate">{accountCategories.find(c => c.id === categoryId)?.name || 'Choose Category'}</span>
              </div>
            </button>

            {/* Savings Toggle */}
            <button
              type="button"
              onClick={() => setIsSavings(!isSavings)}
              className={`flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full transition-colors ${
                isSavings ? 'bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/15' : 'bg-card hover:bg-muted'
              }`}
            >
              <div className="pl-6">
                <IconComponent 
                  name={isSavings ? "PiggyBank" : "Wallet"} 
                  className={`mr-3 ${isSavings ? 'text-pink-500' : 'text-muted-foreground'}`} 
                  size={18} 
                />
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-[8px] text-muted-foreground mb-0.5">Savings Account</span>
                <span className={`text-[10px] font-medium ${isSavings ? 'text-pink-500' : 'text-foreground'}`}>
                  {isSavings ? 'Yes' : 'No'}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="my-2 h-px w-full bg-border/80" />

        {/* Calculator */}
        <div className="col-span-3">
          <Calculator value={balance} onChange={setBalance} label="Amount" />
        </div>
      </div>
      </CompactFormModal>

      {/* Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-32"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNote('')}
              className="flex-1 px-2.5 py-1 bg-muted text-muted-foreground rounded-lg font-semibold hover:bg-muted/80"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowNoteModal(false)}
              className="flex-1 px-2.5 py-1 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Icon Modal */}
      <IconColorSubModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        title="Icon"
        selectedIcon={iconName}
        selectedColor={color}
        onIconChange={setIconName}
        onColorChange={setColor}
      />

      {/* Category Modal */}
      <SelectionModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Choose Category"
        items={groupedByCategory.flatMap((group: any) => group.items)}
        selectedItem={categoryId}
        onSelectItem={setCategoryId}
        showCategories={true}
      />

      <CurrencySelectionModal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        value={currency}
        onChange={setCurrency}
      />

      {/* Bank Information Modal */}
      <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bank Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {/* Bank Name */}
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                placeholder="e.g., Chase, Bank of America"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="shadow-md"
              />
            </div>

            {/* Card Type */}
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select value={cardType} onValueChange={(value: 'debit' | 'credit' | 'checking' | 'savings' | 'none') => setCardType(value)}>
                <SelectTrigger className="shadow-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="debit">Debit Card</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                className="shadow-md font-mono"
                maxLength={12}
              />
            </div>

            {/* Routing Number */}
            <div className="space-y-2">
              <Label>Routing Number</Label>
              <Input
                placeholder="123456789"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                className="shadow-md font-mono"
                maxLength={9}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                    onClick={() => handleEdit(account.id)}
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
                          <DropdownMenuItem onClick={() => handleEdit(account.id)}>
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
                    onClick={() => handleEdit(account.id)}
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
            
            {/* Full Card View */}
            {viewLayout === 'full' && (
              <div className="grid grid-cols-2 gap-3">
                {group.accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => handleEdit(account.id)}
                    className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-2.5 transition-all cursor-pointer group min-h-[104px] overflow-hidden shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${account.color}dd, ${account.color}99)`
                    }}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full border-2 border-white/20"></div>
                      <div className="absolute bottom-1.5 left-1.5 w-8 h-8 rounded-full border-2 border-white/15"></div>
                      <div className="absolute top-1/2 right-1/4 w-5 h-5 rounded-full border-2 border-white/10"></div>
                    </div>
                    
                    <div className="absolute -top-2 right-1 w-10 h-10 opacity-8 transform translate-x-3 translate-y-1 scale-[2] rotate-12">
                      <IconComponent
                        name={account.iconName}
                        size={40}
                        style={{ color: 'white', transform: 'scaleX(-1)' }}
                      />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center shadow-md backdrop-blur-sm shrink-0"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                          >
                            <IconComponent
                              name={account.iconName}
                              size={10}
                              style={{ color: 'white' }}
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-xs truncate">{account.name}</h3>
                            {account.bankName && (
                              <p className="text-white/80 text-[8px] truncate">{account.bankName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            {account.cardType && (
                              <span className="px-1 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[7px] rounded-full font-medium">
                                {account.cardType.charAt(0).toUpperCase() + account.cardType.slice(1)}
                              </span>
                            )}
                            {account.isSavings && (
                              <span className="px-1 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[7px] rounded-full font-medium">
                                Savings
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center space-y-1">
                        {account.accountNumber && (
                          <div className="text-white/90 font-mono text-[8px] tracking-wider truncate">
                            •••• •••• •••• {account.accountNumber.slice(-4)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="min-w-0">
                          <p className="text-white/70 text-[8px] mb-0.5">Balance</p>
                          <p className="text-white font-bold text-lg leading-none whitespace-nowrap truncate">
                            {formatCurrency(account.balance, account.currency)}
                          </p>
                        </div>
                        
                        <div className="text-right min-w-0 max-w-[45%]">
                          {categories.find(c => c.id === account.categoryId) && (
                            <p className="text-white/60 text-[8px] truncate">
                              {categories.find(c => c.id === account.categoryId)?.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
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
