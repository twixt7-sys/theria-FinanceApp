import React, { useState } from 'react';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

export const RecordsScreen: React.FC = () => {
  const { records, streams, accounts, addRecord, updateRecord, deleteRecord } = useData();
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state (local add/edit)
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [streamId, setStreamId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (timeFilter) {
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getFilteredRecords = () => {
    const now = currentDate;
    return records.filter(r => {
      const recordDate = new Date(r.date);
      switch (timeFilter) {
        case 'day':
          return recordDate.toDateString() === now.toDateString();
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return recordDate >= weekStart && recordDate <= weekEnd;
        }
        case 'month':
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        case 'quarter': {
          const quarter = Math.floor(now.getMonth() / 3);
          const recordQuarter = Math.floor(recordDate.getMonth() / 3);
          return recordQuarter === quarter && recordDate.getFullYear() === now.getFullYear();
        }
        case 'year':
          return recordDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredRecords = getFilteredRecords();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordData = {
      type: type as any,
      amount: parseFloat(amount),
      streamId,
      note,
      date,
      ...(type === 'income' && { toAccountId }),
      ...(type === 'expense' && { fromAccountId }),
      ...(type === 'transfer' && { fromAccountId, toAccountId }),
    };

    if (editingId) {
      updateRecord(editingId, recordData);
      setEditingId(null);
    } else {
      addRecord(recordData);
    }

    // Reset form
    setAmount('');
    setStreamId('');
    setFromAccountId('');
    setToAccountId('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsAddOpen(false);
  };

  const handleEdit = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      setType(record.type as any);
      setAmount(record.amount.toString());
      setStreamId(record.streamId);
      setFromAccountId(record.fromAccountId || '');
      setToAccountId(record.toAccountId || '');
      setNote(record.note || '');
      setDate(record.date);
      setEditingId(recordId);
      setIsAddOpen(true);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteRecord(deleteId);
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header 
      <div>
        <h1 className="text-3xl font-bold text-primary text-center">
          Transaction Records
        </h1>
        <p className="text-muted-foreground mt-1">Track all your financial activities</p>
      </div> 
      */}

      {/* Filters and Actions */}
      <div className="w-full">
        <TimeFilter 
          value={timeFilter} 
          onChange={setTimeFilter}
          currentDate={currentDate}
          onNavigateDate={handleNavigateDate}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-primary" size={20} />
            <span className="text-sm font-medium text-muted-foreground">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="bg-destructive/10 backdrop-blur-sm border border-destructive/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-destructive" size={20} />
            <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((record) => {
          const stream = streams.find(s => s.id === record.streamId);
          const isIncome = record.type === 'income';
          
          return (
            <div
              key={record.id}
                className={`${
                  isIncome
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-destructive/10 border-destructive/30'
                } backdrop-blur-sm border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all group`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: `${stream?.color || '#6B7280'}40` }}
              >
                <IconComponent name={stream?.iconName || 'Circle'} style={{ color: stream?.color || '#6B7280' }} size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{stream?.name}</p>
                <p className="text-sm text-muted-foreground truncate">{record.note || 'No description'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="text-right">
                <p className={`font-bold text-lg ${isIncome ? 'text-primary' : 'text-destructive'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(record.amount)}
                </p>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(record.id)}
                  className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(record.id)}
                  className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No records for this period</p>
            <p className="text-sm mt-1">Click the button above to add one</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Add'} Record</DialogTitle>
            <DialogDescription>Record a financial transaction</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Stream *</Label>
              <Select value={streamId} onValueChange={setStreamId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  {streams.filter(s => !s.isSystem).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(type === 'expense' || type === 'transfer') && (
              <div className="space-y-2">
                <Label>From Account *</Label>
                <Select value={fromAccountId} onValueChange={setFromAccountId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(type === 'income' || type === 'transfer') && (
              <div className="space-y-2">
                <Label>To Account *</Label>
                <Select value={toAccountId} onValueChange={setToAccountId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea placeholder="Add a description" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                {editingId ? 'Update' : 'Add'} Record
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};