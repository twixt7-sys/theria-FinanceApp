import React, { useState } from 'react';
import { Plus, Wallet, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

const ICON_OPTIONS = ['Wallet', 'PiggyBank', 'CreditCard', 'Landmark', 'TrendingUp', 'Briefcase'];
const COLOR_OPTIONS = ['#10B981', '#4F46E5', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6'];

export const AccountsScreen: React.FC = () => {
  const { accounts, categories, addAccount, updateAccount, deleteAccount } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  
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

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const accountCategories = categories.filter(c => c.scope === 'account');

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
      {/* Total Balance */}
      <div className="bg-primary rounded-2xl p-6 text-white shadow-xl">
        <p className="text-white/80 mb-2">Total Balance</p>
        <h2 className="text-4xl font-bold">{formatCurrency(totalBalance)}</h2>
        <p className="text-white/70 mt-2">{accounts.length} accounts</p>
      </div>

      {/* Add Account Button */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary hover:bg-primary/90 shadow-md">
            <Plus size={20} className="mr-2" />
            Add Account
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Create New Account'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                placeholder="e.g., Main Wallet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Balance</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all shadow-sm ${
                      color === c ? 'border-foreground scale-110 shadow-md' : 'border-border'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <Label htmlFor="is-savings" className="cursor-pointer">Savings Account</Label>
              <Switch
                id="is-savings"
                checked={isSavings}
                onCheckedChange={setIsSavings}
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-md">
              {editingAccount ? 'Update Account' : 'Create Account'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accounts Grid */}
      <div className="grid gap-4">
        {accounts.map((account) => {
          const category = categories.find(c => c.id === account.categoryId);
          
          return (
            <div
              key={account.id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 shadow-md"
                  style={{ backgroundColor: account.color }}
                >
                  <IconComponent
                    name={account.iconName}
                    size={24}
                    style={{ color: 'white' }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{account.name}</h3>
                    {account.isSavings && (
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                        Savings
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{category?.name}</p>
                </div>

                <div className="text-right flex items-center gap-3">
                  <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-xl shadow-md">
            <Wallet size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold mb-2">No Accounts Yet</h3>
            <p className="text-muted-foreground">Create your first account to get started</p>
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
