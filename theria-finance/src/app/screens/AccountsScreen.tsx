import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';
import { Wallet, Edit, Trash2, MoreVertical, List, Grid, Square, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { IconComponent } from '../components/IconComponent';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { CompactFormModal } from '../components/CompactFormModal';
import { Calculator } from '../components/Calculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { IconColorSubModal, SelectionSubModal } from '../components/submodals';
import { motion, AnimatePresence } from 'motion/react';


interface AccountsScreenProps {
  filterOpen: boolean;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  filterOpen,
}) => {
  const { accounts, categories, addAccount, updateAccount, deleteAccount } = useData();
  const { showAddAlert } = useAlert();
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
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');

  // Modals
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const accountCategories = categories.filter(c => c.scope === 'account');
  
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
      });
    }

    // Show alert
    const formattedBalance = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(balance));
    
    showAddAlert(`Account "${name}"`, `Starting balance: ${formattedBalance}`);

    resetForm();
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-4">
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
            <div className="rounded-xl bg-card border border-border p-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryPage(Math.max(0, categoryPage - 1))}
                  disabled={categoryPage === 0}
                  className="p-1 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
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
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium capitalize transition-all ${
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
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium capitalize transition-all ${
                            filterCategoryId === cat.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          title={cat.name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent name={cat.iconName || 'Wallet'} size={14} />
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
                  className="p-1 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Total Balance */}
      <div 
        className="relative bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-4 text-white overflow-hidden transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #d97706dd, #92400e99)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-white/20"></div>
          <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full border-2 border-white/15"></div>
          <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border-2 border-white/10"></div>
        </div>
        
        {/* Background icon */}
        <div className="absolute -top-6 right-2 w-24 h-24 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
          <Wallet size={96} style={{ color: 'white', transform: 'scaleX(-1)' }} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 mb-0.5 text-sm">Total Balance</p>
            <h2 className="text-2xl font-bold mb-0.5">{formatCurrency(totalBalance)}</h2>
            <p className="text-white/70 text-sm">{accounts.length} accounts</p>
          </div>
          
          {/* Layout Selection Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'list'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewLayout('small')}
              className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'small'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="Small Card View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewLayout('full')}
              className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'full'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="Full Card View"
            >
              <Square size={15} />
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
                    {balance ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(parseFloat(balance) || 0) : '$0.00'}
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
        
        <button
          type="button"
          onClick={() => setShowBankModal(true)}
          className={`w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl border border-border transition-all shadow-md ${
            bankName || accountNumber || routingNumber ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
          }`}
          title="Bank Information"
        >
          <IconComponent 
            name="Landmark"
            size={14} 
            className={bankName || accountNumber || routingNumber ? 'text-green-500' : 'text-muted-foreground'}
          />
          <span className={`text-[10px] font-semibold ${bankName || accountNumber || routingNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
            {bankName || 'Bank Information'}
          </span>
        </button>

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
      <SelectionSubModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={() => setShowCategoryModal(false)}
        title="Choose Category"
        items={groupedByCategory.flatMap((group: any) => group.items)}
        selectedItem={categoryId}
        onSelectItem={setCategoryId}
        showCategories={true}
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
      </CompactFormModal>

      {/* Accounts grouped + scrollable */}
      <div className="space-y-4">
        {groupedAccounts.map((group) => (
          <div key={group.category.id} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.category.color || '#6B7280' }} />
              <p className="text-xs font-semibold text-foreground">{group.category.name}</p>
            </div>
            
            {/* List View */}
            {viewLayout === 'list' && (
              <div className="space-y-2">
                {group.accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => handleEdit(account.id)}
                    className="flex items-center justify-between bg-card border border-border rounded-xl p-3 transition-all cursor-pointer group"
                    style={{}}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
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
                          <h3 className="font-semibold text-sm">{account.name}</h3>
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
                      <p className="text-base font-bold">{formatCurrency(account.balance)}</p>
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
                    className="flex flex-col bg-card border border-border rounded-xl p-3 transition-all cursor-pointer group min-h-[120px]"
                    style={{}}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: account.color }}
                      >
                        <IconComponent
                          name={account.iconName}
                          size={18}
                          style={{ color: 'white' }}
                        />
                      </div>
                      
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
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate text-sm">{account.name}</h3>
                        </div>
                        {account.isSavings && (
                          <span className="inline-block px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded-full mb-2">
                            Savings
                          </span>
                        )}
                        {account.cardType && (
                          <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full mb-2">
                            {account.cardType.charAt(0).toUpperCase() + account.cardType.slice(1)}
                          </span>
                        )}
                        <p className="text-[11px] text-muted-foreground truncate mb-1.5">
                          {categories.find(c => c.id === account.categoryId)?.name || 'Uncategorized'}
                        </p>
                      </div>
                      <p className="text-base font-bold">{formatCurrency(account.balance)}</p>
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
                    className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 transition-all cursor-pointer group min-h-[180px] overflow-hidden"
                    style={{ 
                      background: `linear-gradient(135deg, ${account.color}dd, ${account.color}99)`
                    }}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-white/20"></div>
                      <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full border-2 border-white/15"></div>
                      <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border-2 border-white/10"></div>
                    </div>
                    
                    <div className="absolute -top-6 right-2 w-24 h-24 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
                      <IconComponent
                        name={account.iconName}
                        size={96}
                        style={{ color: 'white', transform: 'scaleX(-1)' }}
                      />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                          >
                            <IconComponent
                              name={account.iconName}
                              size={16}
                              style={{ color: 'white' }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base truncate">{account.name}</h3>
                            {account.bankName && (
                              <p className="text-white/80 text-xs">{account.bankName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            {account.cardType && (
                              <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] rounded-full font-medium">
                                {account.cardType.charAt(0).toUpperCase() + account.cardType.slice(1)}
                              </span>
                            )}
                            {account.isSavings && (
                              <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] rounded-full font-medium">
                                Savings
                              </span>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/20"
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
                      
                      <div className="flex-1 flex flex-col justify-center space-y-3">
                        {account.accountNumber && (
                          <div className="text-white/90 font-mono text-xs tracking-wider">
                            •••• •••• •••• {account.accountNumber.slice(-4)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-white/70 text-xs mb-1">Balance</p>
                          <p className="text-white font-bold text-lg">{formatCurrency(account.balance)}</p>
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
