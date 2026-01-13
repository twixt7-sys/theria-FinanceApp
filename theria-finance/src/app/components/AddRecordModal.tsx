import React, { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, ArrowLeftRight, Calendar, ChevronLeft, ChevronRight, Wallet, Target } from 'lucide-react';
import { CompactFormModal } from './CompactFormModal';
import { Calculator } from './Calculator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';
import { type TimeFilterValue } from './TimeFilter';
import { SelectionSubModal } from './submodals';
import { CalendarSubModal } from './submodals/CalendarSubModal';
import { IconComponent } from './IconComponent';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense' | 'transfer';
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({ isOpen, onClose, initialType }) => {
  const { streams, accounts, addRecord } = useData();
  const { showAddAlert } = useAlert();
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [streamId, setStreamId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  
  // Submodal states
  const [showFromAccountModal, setShowFromAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Helper functions
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

  useEffect(() => {
    if (isOpen && initialType) {
      setType(initialType);
    }
  }, [initialType, isOpen]);

  // Handler functions for selections
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

  // Helper functions to get display names
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if ((type === 'income' || type === 'expense') && !streamId) {
      alert('Please select a stream');
      return;
    }
    
    if (type === 'expense' && !fromAccountId) {
      alert('Please select a from account');
      return;
    }
    
    if (type === 'income' && !toAccountId) {
      alert('Please select a to account');
      return;
    }
    
    if (type === 'transfer' && (!fromAccountId || !toAccountId)) {
      alert('Please select both from and to accounts');
      return;
    }
    
    const recordData = {
      type: type as any,
      amount: parseFloat(amount) || 0,
      streamId,
      note,
      date,
      ...(type === 'income' && { toAccountId }),
      ...(type === 'expense' && { fromAccountId }),
      ...(type === 'transfer' && { fromAccountId, toAccountId }),
    };

    addRecord(recordData);

    // Show alert
    const streamName = streams.find(s => s.id === streamId)?.name || 'Unknown stream';
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount) || 0);
    
    showAddAlert(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Record`,
      `${formattedAmount} - ${streamName}${note ? ` (${note})` : ''}`
    );

    // Reset
    setType('expense');
    setAmount('');
    setStreamId('');
    setFromAccountId('');
    setToAccountId('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <>
      <CompactFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title="Add Record"
      >
        <div className="space-y-4">
          {/* Type Display */}
          <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm shadow-md ${
            type === 'income' ? 'bg-primary/10 border-primary/20' : 
            type === 'expense' ? 'bg-destructive/10 border-destructive/20' : 
            'bg-blue-500/10 border-blue-500/20'
          }`}>
            <span className={`text-sm font-semibold capitalize ${
              type === 'income' ? 'text-primary' : 
              type === 'expense' ? 'text-destructive' : 
              'text-blue-500'
            }`}>{type}</span>
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
                      ? `${option.color} text-white shadow-md`
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
          <button
            type="button"
            onClick={() => setShowNoteModal(false)}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
          >
            Done
          </button>
        </DialogContent>
      </Dialog>

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
    </>
  );
};
