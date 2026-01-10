import React, { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, ArrowLeftRight, Calendar } from 'lucide-react';
import { CompactFormModal } from './CompactFormModal';
import { Calculator } from './Calculator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useData } from '../contexts/DataContext';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense' | 'transfer';
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({ isOpen, onClose, initialType }) => {
  const { streams, accounts, addRecord } = useData();
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [streamId, setStreamId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNoteModal, setShowNoteModal] = useState(false);

  useEffect(() => {
    if (isOpen && initialType) {
      setType(initialType);
    }
  }, [initialType, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
          {/* Type, Date, Note cluster */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 flex gap-2">
              {[
                { key: 'income', icon: <TrendingUp size={18} />, label: 'Income', color: 'bg-primary' },
                { key: 'expense', icon: <TrendingDown size={18} />, label: 'Expense', color: 'bg-destructive' },
                { key: 'transfer', icon: <ArrowLeftRight size={18} />, label: 'Transfer', color: 'bg-blue-500' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setType(option.key as any)}
                  className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
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

            <div className="flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-inner">
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
                <SelectTrigger>
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
                <SelectTrigger>
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

            {(type === 'income' || type === 'expense') && (

            <Select value={streamId} onValueChange={setStreamId}>
              <SelectTrigger>
                <SelectValue placeholder="Stream" />
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
            )}
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
            className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
          >
            Done
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};
