import React, { useState, useMemo } from 'react';
import { Plus, Wallet, Edit, Trash2, MoreVertical, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { CompactFormModal } from '../components/CompactFormModal';
import { Calculator } from '../components/Calculator';
import { TimeFilter, type TimeFilterValue } from '../components/TimeFilter';
import { motion, AnimatePresence } from 'motion/react';

const ICON_OPTIONS = ['Wallet', 'PiggyBank', 'CreditCard', 'Landmark', 'TrendingUp', 'Briefcase'];
const COLOR_OPTIONS = ['#10B981', '#4F46E5', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6'];

interface AccountsScreenProps {
  timeFilter: TimeFilterValue;
  onTimeFilterChange: (value: TimeFilterValue) => void;
  currentDate: Date;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
  filterOpen: boolean;
  onToggleFilter: () => void;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = false,
  filterOpen,
  onToggleFilter,
}) => {
  const { accounts, categories, addAccount, updateAccount, deleteAccount } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  
  // Form state
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [iconName, setIconName] = useState('Wallet');
  const [color, setColor] = useState('#10B981');
  const [isSavings, setIsSavings] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const accountCategories = categories.filter(c => c.scope === 'account');
  
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
    
    if (editingAccount) {
      updateAccount(editingAccount, {
        name,
        balance: parseFloat(balance),
        categoryId: categoryId || accountCategories[0]?.id || '1',
        iconName,
        color,
        isSavings,
      });
    } else {
      addAccount({
        name,
        balance: parseFloat(balance),
        categoryId: categoryId || accountCategories[0]?.id || '1',
        iconName,
        color,
        isSavings,
      });
    }

    resetForm();
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
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
            <div className="rounded-xl bg-card border border-border p-3 shadow-sm">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/50">
                <Filter size={16} className="text-muted-foreground" />
                <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
                  <SelectTrigger className="h-9 min-w-[140px] bg-card text-sm shadow-sm">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {accountCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Total Balance */}
      <div className="bg-amber-700 rounded-2xl p-6 text-white shadow-xl">
        <p className="text-white/80 mb-2">Total Balance</p>
        <h2 className="text-4xl font-bold">{formatCurrency(totalBalance)}</h2>
        <p className="text-white/70 mt-2">{accounts.length} accounts</p>
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
        <div className="space-y-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input
              placeholder="e.g., Main Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="shadow-sm"
            />
          </div>

          {/* Balance + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Balance</Label>
              <Calculator value={balance} onChange={setBalance} />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {accountCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setIconName(icon)}
                  className={`p-3 rounded-lg border-2 transition-all shadow-sm ${
                    iconName === icon
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <IconComponent name={icon} size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all shadow-sm ${
                    color === c ? 'border-foreground scale-110 shadow-md' : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Savings Account Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label htmlFor="is-savings" className="cursor-pointer">Savings Account</Label>
            <Switch
              id="is-savings"
              checked={isSavings}
              onCheckedChange={setIsSavings}
            />
          </div>
        </div>
      </CompactFormModal>

      {/* Accounts grouped + scrollable */}
      <div className="space-y-4">
        {groupedAccounts.map((group) => (
          <div key={group.category.id} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.category.color || '#6B7280' }} />
              <p className="text-sm font-semibold text-foreground">{group.category.name}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {group.accounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => handleEdit(account.id)}
                  className="flex flex-col bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all shadow-sm cursor-pointer group min-h-[140px]"
                  style={{ boxShadow: `0 8px 20px ${account.color}22` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: account.color }}
                    >
                      <IconComponent
                        name={account.iconName}
                        size={22}
                        style={{ color: 'white' }}
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={16} />
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
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{account.name}</h3>
                      </div>
                      {account.isSavings && (
                        <span className="inline-block px-2 py-0.5 bg-secondary/10 text-secondary text-[11px] rounded-full mb-2">
                          Savings
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {categories.find(c => c.id === account.categoryId)?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(account.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-xl shadow-md">
            <Wallet size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold mb-2">
              {filterCategoryId === 'all' ? 'No Accounts Yet' : 'No Accounts in This Category'}
            </h3>
            <p className="text-muted-foreground">
              {filterCategoryId === 'all' 
                ? 'Create your first account to get started' 
                : 'Try selecting a different category or create an account in this category'}
            </p>
          </div>
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
