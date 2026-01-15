import React, { useState, useMemo } from 'react';
import { Plus, Wallet, Edit, Trash2, MoreVertical, Filter, List, Grid, Square, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [cardType, setCardType] = useState<'debit' | 'credit' | 'checking' | 'savings'>('checking');
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');

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
    setBankName('');
    setAccountNumber('');
    setRoutingNumber('');
    setCardType('checking');
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
      setCardType(account.cardType || 'checking');
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
        bankName,
        accountNumber,
        routingNumber,
        cardType,
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
        cardType,
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryPage(Math.max(0, categoryPage - 1))}
                  disabled={categoryPage === 0}
                  className="p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex gap-2 flex-1 justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`category-page-${categoryPage}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="flex gap-2"
                    >
                      <motion.button
                        key="all"
                        type="button"
                        onClick={() => setFilterCategoryId('all')}
                        className={`flex items-center gap-1 px-2.5 py-2 rounded-md text-xs font-medium capitalize transition-all ${
                          filterCategoryId === 'all'
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title="All categories"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        All
                      </motion.button>
                      {accountCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          onClick={() => setFilterCategoryId(cat.id)}
                          className={`flex items-center gap-1 px-2.5 py-2 rounded-md text-xs font-medium capitalize transition-all ${
                            filterCategoryId === cat.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          title={cat.name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent name={cat.iconName || 'Wallet'} size={16} />
                          {cat.name}
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <button
                  type="button"
                  onClick={() => setCategoryPage(Math.min(0, categoryPage + 1))}
                  disabled={true}
                  className="p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Total Balance */}
      <div 
        className="relative bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-6 text-white shadow-xl overflow-hidden hover:shadow-2xl transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #d97706dd, #92400e99)',
          boxShadow: '0 10px 30px #d9770633, 0 20px 40px #d9770622, inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white/20"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-white/15"></div>
          <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full border-2 border-white/10"></div>
        </div>
        
        {/* Background icon */}
        <div className="absolute -top-8 right-2 w-32 h-32 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
          <Wallet size={128} style={{ color: 'white', transform: 'scaleX(-1)' }} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 mb-2">Total Balance</p>
            <h2 className="text-4xl font-bold mb-2">{formatCurrency(totalBalance)}</h2>
            <p className="text-white/70">{accounts.length} accounts</p>
          </div>
          
          {/* Layout Selection Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setViewLayout('list')}
              className={`p-2 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'list'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewLayout('small')}
              className={`p-2 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'small'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="Small Card View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewLayout('full')}
              className={`p-2 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'full'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="Full Card View"
            >
              <Square size={16} />
            </button>
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

          {/* Bank Information Section */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Bank Information (Optional)</h4>
            
            {/* Bank Name */}
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                placeholder="e.g., Chase, Bank of America"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="shadow-sm"
              />
            </div>

            {/* Card Type */}
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select value={cardType} onValueChange={(value: 'debit' | 'credit' | 'checking' | 'savings') => setCardType(value)}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                className="shadow-sm font-mono"
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
                className="shadow-sm font-mono"
                maxLength={9}
              />
            </div>
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
            
            {/* List View */}
            {viewLayout === 'list' && (
              <div className="space-y-2">
                {group.accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => handleEdit(account.id)}
                    className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all shadow-sm cursor-pointer group"
                    style={{ boxShadow: `0 8px 20px ${account.color}22` }}
                  >
                    <div className="flex items-center gap-4">
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{account.name}</h3>
                          {account.isSavings && (
                            <span className="inline-block px-2 py-0.5 bg-secondary/10 text-secondary text-[11px] rounded-full">
                              Savings
                            </span>
                          )}
                          {account.cardType && (
                            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-full">
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
                      <p className="text-lg font-bold">{formatCurrency(account.balance)}</p>
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
                  </div>
                ))}
              </div>
            )}
            
            {/* Small Card View */}
            {viewLayout === 'small' && (
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
                        {account.cardType && (
                          <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-full mb-2">
                            {account.cardType.charAt(0).toUpperCase() + account.cardType.slice(1)}
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
            )}
            
            {/* Full Card View */}
            {viewLayout === 'full' && (
              <div className="grid grid-cols-1 gap-4">
                {group.accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => handleEdit(account.id)}
                    className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 transition-all cursor-pointer group min-h-[200px] overflow-hidden hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
                    style={{ 
                      background: `linear-gradient(135deg, ${account.color}dd, ${account.color}99)`,
                      boxShadow: `0 10px 30px ${account.color}33, 0 20px 40px ${account.color}22, inset 0 1px 0 rgba(255,255,255,0.1)`
                    }}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white/20"></div>
                      <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-white/15"></div>
                      <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full border-2 border-white/10"></div>
                    </div>
                    
                    <div className="absolute -top-8 right-2 w-32 h-32 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
                      <IconComponent
                        name={account.iconName}
                        size={128}
                        style={{ color: 'white', transform: 'scaleX(-1)' }}
                      />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                          >
                            <IconComponent
                              name={account.iconName}
                              size={18}
                              style={{ color: 'white' }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg truncate">{account.name}</h3>
                            {account.bankName && (
                              <p className="text-white/80 text-sm">{account.bankName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            {account.cardType && (
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                                {account.cardType.charAt(0).toUpperCase() + account.cardType.slice(1)}
                              </span>
                            )}
                            {account.isSavings && (
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                                Savings
                              </span>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/20"
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
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center space-y-3">
                        {account.accountNumber && (
                          <div className="text-white/90 font-mono text-sm tracking-wider">
                            •••• •••• •••• {account.accountNumber.slice(-4)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-white/70 text-xs mb-1">Balance</p>
                          <p className="text-white font-bold text-xl">{formatCurrency(account.balance)}</p>
                        </div>
                        
                        <div className="text-right">
                          {categories.find(c => c.id === account.categoryId) && (
                            <p className="text-white/60 text-xs">
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
