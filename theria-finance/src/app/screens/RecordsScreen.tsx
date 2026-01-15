import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, MessageSquare, ArrowLeftRight, Calendar, List, Grid, Square } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { CompactFormModal } from '../components/CompactFormModal';
import { Calculator } from '../components/Calculator';

interface RecordsScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = true,
}) => {
  const { records, streams, accounts, addRecord, updateRecord, deleteRecord } = useData();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');
  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const activeCurrentDate = currentDate ?? localCurrentDate;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;
  const handleNavigateDate = onNavigateDate ?? ((direction: 'prev' | 'next') => {
    const newDate = new Date(activeCurrentDate);
    
    switch (activeTimeFilter) {
      case 'day':
        newDate.setDate(activeCurrentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(activeCurrentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(activeCurrentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(activeCurrentDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(activeCurrentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setLocalCurrentDate(newDate);
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Form state (local add/edit)
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [streamId, setStreamId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const getFilteredRecords = () => {
    const now = activeCurrentDate;
    return records.filter(r => {
      const recordDate = new Date(r.date);
      switch (activeTimeFilter) {
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
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      // Sort by date descending (newest first)
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      // If dates are the same, sort by createdAt descending (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
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
      {showInlineFilter && (
        <div className="w-full">
          <TimeFilter 
            value={activeTimeFilter} 
            onChange={handleTimeChange}
            currentDate={activeCurrentDate}
            onNavigateDate={handleNavigateDate}
          />
        </div>
      )}

      {/* Records Overview Card */}
      <div 
        className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl overflow-hidden hover:shadow-2xl transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #2563ebdd, #1e40af99)',
          boxShadow: '0 10px 30px #2563eb33, 0 20px 40px #2563eb22, inset 0 1px 0 rgba(255,255,255,0.1)'
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
          <TrendingUp size={128} style={{ color: 'white', transform: 'scaleX(-1)' }} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 mb-2">Net Flow</p>
            <h2 className="text-4xl font-bold mb-2">{totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses)}</h2>
            <p className="text-white/70">{filteredRecords.length} records</p>
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

      {/* Income and Expenses Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center justify-center gap-2">
            <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
            <p className="text-xl font-bold text-red-700 dark:text-red-300">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((record) => {
          const stream = streams.find(s => s.id === record.streamId);
          const isIncome = record.type === 'income';
          const isTransfer = record.type === 'transfer';
          
          return (
            <div
              key={record.id}
              onClick={() => handleEdit(record.id)}
              className={`border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all group cursor-pointer shadow-md ${
                isIncome ? 'bg-emerald-500/5' : 
                isTransfer ? 'bg-blue-500/5' : 
                'bg-red-500/5'
              }`}
              style={{ 
                boxShadow: `0 8px 28px ${(stream?.color || '#6B7280')}15, 0 4px 12px rgba(0, 0, 0, 0.1)`
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: `${stream?.color || '#6B7280'}22` }}
              >
                <IconComponent
                  name={stream?.iconName || 'Circle'}
                  style={{ color: stream?.color || '#6B7280' }}
                  size={20}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{stream?.name}</p>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">{record.note || 'No description'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              {/* Amount and type */}
              <div className="w-35 flex justify-self-end">
                <div className="w-50 flex items-center justify-end gap-2 shrink-0 ">                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    isIncome ? 'text-primary' : 
                    isTransfer ? 'text-blue-500' : 
                    'text-destructive'
                  }`}>
                    {isIncome ? '+' : '-'}
                    {formatCurrency(record.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {record.type === 'transfer'
                      ? 'Transfer'
                      : isIncome
                        ? 'Incoming'
                        : 'Outgoing'}
                  </p>
                </div>
                {isIncome ? (
                  <TrendingUp size={20} className="text-primary" />
                ) : isTransfer ? (
                  <ArrowLeftRight size={20} className="text-blue-500" />
                ) : (
                  <TrendingDown size={20} className="text-destructive" />
                )}
              </div>
              </div>

              <div
                className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
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
      <CompactFormModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmit}
        title={editingId ? 'Edit Record' : 'Add Record'}
      >
        <div className="space-y-4">
          {/* Type, Date, Note cluster */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 flex gap-2">
              {[
                { key: 'income', icon: <TrendingUp size={18} />, label: 'Income' },
                { key: 'expense', icon: <TrendingDown size={18} />, label: 'Expense' },
                { key: 'transfer', icon: <ArrowLeftRight size={18} />, label: 'Transfer' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setType(option.key as any)}
                  className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    type === option.key
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
          </div>

          {/* Accounts + Stream */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(type === 'expense' || type === 'transfer') && (
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="From account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(type === 'transfer' || type === 'income') && (
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="To account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={streamId} onValueChange={setStreamId}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="Stream / category" />
              </SelectTrigger>
              <SelectContent>
                {streams
                  .filter((s) => !s.isSystem && s.type === type)
                  .map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      {stream.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount + Note */}
          <div className="grid grid-cols-4 gap-2 items-start">
            <div className="col-span-3">
              <Calculator value={amount} onChange={setAmount} />
            </div>
            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className="h-full rounded-xl border border-border bg-card hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
              title="Add note"
            >
              <MessageSquare size={18} />
              <span className="text-xs text-muted-foreground">
                {note ? 'Edit note' : 'Note'}
              </span>
            </button>
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
          <button
            type="button"
            onClick={() => setShowNoteModal(false)}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 shadow-sm"
          >
            Done
          </button>
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