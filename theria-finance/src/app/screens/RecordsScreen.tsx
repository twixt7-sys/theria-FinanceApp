import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, MessageSquare, ArrowLeftRight, Calendar, List, Grid, Square, Wallet, Target } from 'lucide-react';
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
import { SelectionSubModal } from '../components/submodals';
import { CalendarSubModal } from '../components/submodals/CalendarSubModal';

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
  
  // Submodal states
  const [showFromAccountModal, setShowFromAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

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

  const getCurrentDate = () => new Date(date);
  const formatDateDisplay = () => {
    const dateObj = getCurrentDate();
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFromAccountDetails = () => {
    const account = accounts.find(acc => acc.id === fromAccountId);
    return account || { iconName: 'Wallet', color: '#6B7280' };
  };

  const getToAccountDetails = () => {
    const account = accounts.find(acc => acc.id === toAccountId);
    return account || { iconName: 'Wallet', color: '#6B7280' };
  };

  const getStreamDetails = () => {
    const stream = streams.find(s => s.id === streamId);
    return stream || { iconName: 'Target', color: '#6B7280' };
  };

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate.toISOString().split('T')[0]);
  };

  const handleSelectFromAccount = (id: string) => {
    setFromAccountId(id);
    setShowFromAccountModal(false);
  };

  const handleSelectToAccount = (id: string) => {
    setToAccountId(id);
    setShowToAccountModal(false);
  };

  const handleSelectStream = (id: string) => {
    setStreamId(id);
    setShowStreamModal(false);
  };

  const getFromAccountName = () => {
    const account = accounts.find(acc => acc.id === fromAccountId);
    return account ? account.name : 'From account';
  };

  const getToAccountName = () => {
    const account = accounts.find(acc => acc.id === toAccountId);
    return account ? account.name : 'To account';
  };

  const getStreamName = () => {
    const stream = streams.find(s => s.id === streamId);
    return stream ? stream.name : 'Stream';
  };

  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-4">
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
        className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 text-white overflow-hidden transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #2563ebdd, #1e40af99)'
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
          <TrendingUp size={96} style={{ color: 'white', transform: 'scaleX(-1)' }} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 mb-0.5 text-sm">Net Flow</p>
            <h2 className="text-2xl font-bold mb-0.5">{totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses)}</h2>
            <p className="text-white/70 text-sm">{filteredRecords.length} records</p>
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

      {/* Income and Expenses Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-emerald-500 text-white border-0 rounded-xl p-3">
          <div className="flex items-center justify-center gap-1.5">
            <TrendingUp size={14} className="text-white" />
            <p className="text-lg font-bold text-white">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        
        <div className="bg-red-500 text-white border-0 rounded-xl p-3">
          <div className="flex items-center justify-center gap-1.5">
            <TrendingDown size={14} className="text-white" />
            <p className="text-lg font-bold text-white">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-2">
        {filteredRecords.map((record) => {
          const stream = streams.find(s => s.id === record.streamId);
          const isIncome = record.type === 'income';
          const isTransfer = record.type === 'transfer';
          const leftIconBg = isTransfer ? '#3B82F6' : (stream?.color || '#6B7280');
          
          return (
            <div
              key={record.id}
              onClick={() => handleEdit(record.id)}
              className={`rounded-2xl p-3 flex items-center gap-3 transition-all group cursor-pointer ${
                isIncome ? 'bg-emerald-500/20 hover:bg-emerald-500/25' : 
                isTransfer ? 'bg-blue-500/20 hover:bg-blue-500/25' : 
                'bg-red-500/20 hover:bg-red-500/25'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: leftIconBg }}
              >
                {isTransfer ? (
                  <ArrowLeftRight size={18} className="text-white" />
                ) : (
                  <IconComponent
                    name={stream?.iconName || 'Circle'}
                    style={{ color: 'white' }}
                    size={18}
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate text-xs">{stream?.name}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{record.note || 'No description'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              {/* Amount and type */}
              <div className="w-32 flex justify-self-end">
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <div className="text-right">
                    <p className={`font-bold text-base ${
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
                    <TrendingUp size={18} className="text-primary" />
                  ) : isTransfer ? (
                    <ArrowLeftRight size={18} className="text-blue-500" />
                  ) : (
                    <TrendingDown size={18} className="text-destructive" />
                  )}
                </div>
              </div>

              <div
                className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleEdit(record.id)}
                  className="p-1.5 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(record.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
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
          {/* Type Display */}
          <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm shadow-md ${
            type === 'income' ? 'bg-primary border-primary text-white' : 
            type === 'expense' ? 'bg-destructive border-destructive text-white' : 
            'bg-blue-500 border-blue-500 text-white'
          }`}>
            <span className="text-sm font-semibold capitalize">{type}</span>
          </div>

          {/* Type, Date, Note cluster */}
          <div className="grid grid-cols-1 gap-4">
            {/* Type buttons */}
            <div className="flex gap-2">
              {[
                { key: 'income', icon: <TrendingUp size={18} />, label: 'Income', color: 'bg-primary' },
                { key: 'expense', icon: <TrendingDown size={18} />, label: 'Expense', color: 'bg-destructive' },
                { key: 'transfer', icon: <ArrowLeftRight size={18} />, label: 'Transfer', color: 'bg-blue-500' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setType(option.key as any)}
                  className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                    type === option.key
                      ? option.key === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        option.key === 'expense' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Date picker */}
            <div>
              <button
                type="button"
                onClick={() => setShowCalendarModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted transition-all shadow-md"
              >
                <span className="text-sm font-semibold">{formatDateDisplay()}</span>
              </button>
            </div>
          </div>

          <div className="my-4 h-px w-full bg-border/80" />

          <div className='grid grid-cols-3 gap-3'>
          <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className={`h-full rounded-xl border border-border transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm ${
                note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
              }`}
              title="Add note"
            >
              <MessageSquare size={18} className={note ? 'text-green-500' : 'text-muted-foreground'} />
              <span className={`text-xs ${note ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                {note ? 'Edit note' : 'Note'}
              </span>
            </button>
          {/* Accounts + Stream */}
            <div className='col-span-2'>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(type === 'expense' || type === 'transfer') && (
                  <button
                    className="flex items-center px-3 h-20 rounded-xl text-center border border-border text-sm shadow-sm"
                    type="button"
                    onClick={() => setShowFromAccountModal(true)}
                    style={{ backgroundColor: fromAccountId ? getFromAccountDetails().color + '20' : undefined, borderColor: fromAccountId ? getFromAccountDetails().color : undefined }}
                  >
                    {fromAccountId ? (
                      <IconComponent name={getFromAccountDetails().iconName} className='mr-3' size={25} style={{ color: getFromAccountDetails().color }} />
                    ) : (
                      <Wallet className='mr-3' size={25} />
                    )}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-muted-foreground mb-1">From Account</span>
                      <span className="text-sm font-medium truncate">{getFromAccountName()}</span>
                    </div>
                  </button>
                )}

                {(type === 'transfer' || type === 'income') && (
                  <button
                    className="flex items-center px-3 h-20 rounded-xl text-center border border-border text-sm shadow-sm"
                    type="button"
                    onClick={() => setShowToAccountModal(true)}
                    style={{ backgroundColor: toAccountId ? getToAccountDetails().color + '20' : undefined, borderColor: toAccountId ? getToAccountDetails().color : undefined }}
                  >
                    {toAccountId ? (
                      <IconComponent name={getToAccountDetails().iconName} className='mr-3' size={25} style={{ color: getToAccountDetails().color }} />
                    ) : (
                      <Wallet className='mr-3' size={25} />
                    )}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-muted-foreground mb-1">To Account</span>
                      <span className="text-sm font-medium truncate">{getToAccountName()}</span>
                    </div>
                  </button>
                )}

                {(type === 'income' || type === 'expense') && (
                  <button
                    className="flex items-center px-3 h-20 rounded-xl text-center border border-border text-sm shadow-sm"
                    type="button"
                    onClick={() => setShowStreamModal(true)}
                    style={{ backgroundColor: streamId ? getStreamDetails().color + '20' : undefined, borderColor: streamId ? getStreamDetails().color : undefined }}
                  >
                    {streamId ? (
                      <IconComponent name={getStreamDetails().iconName} className='mr-3' size={25} style={{ color: getStreamDetails().color }} />
                    ) : (
                      <Target className='mr-3' size={25} />
                    )}
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-muted-foreground mb-1">Stream</span>
                      <span className="text-sm font-medium truncate">{getStreamName()}</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="my-4 h-px w-full bg-border/80" />
      

          {/* Amount + Note */}
          <div className="col-span-3">
            <Calculator value={amount} onChange={setAmount} />
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
              className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg font-semibold hover:bg-muted/80"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowNoteModal(false)}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              Done
            </button>
          </div>
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

      {/* From Account Modal */}
      <SelectionSubModal
        isOpen={showFromAccountModal}
        onClose={() => setShowFromAccountModal(false)}
        onSubmit={() => {}}
        title="Choose From Account"
        items={accounts.map(acc => ({ ...acc, balance: acc.balance }))}
        selectedItem={fromAccountId}
        onSelectItem={handleSelectFromAccount}
      />

      {/* To Account Modal */}
      <SelectionSubModal
        isOpen={showToAccountModal}
        onClose={() => setShowToAccountModal(false)}
        onSubmit={() => {}}
        title="Choose To Account"
        items={accounts.map(acc => ({ ...acc, balance: acc.balance }))}
        selectedItem={toAccountId}
        onSelectItem={handleSelectToAccount}
      />

      {/* Stream Modal */}
      <SelectionSubModal
        isOpen={showStreamModal}
        onClose={() => setShowStreamModal(false)}
        onSubmit={() => {}}
        title="Choose Stream"
        items={streams
          .filter((s) => !s.isSystem && s.type === type)
          .map(stream => ({ ...stream, type: stream.type }))}
        selectedItem={streamId}
        onSelectItem={handleSelectStream}
        showCategories={true}
      />

      {/* Calendar Modal */}
      <CalendarSubModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={handleDateSelect}
        selectedDate={getCurrentDate()}
      />
    </div>
  );
};