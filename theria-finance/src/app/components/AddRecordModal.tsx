import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { CompactFormModal } from './CompactFormModal';
import { Calculator } from './Calculator';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useData } from '../contexts/DataContext';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({ isOpen, onClose }) => {
  const { streams, accounts, addRecord } = useData();
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [streamId, setStreamId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNoteModal, setShowNoteModal] = useState(false);

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
        {/* Type Selection */}
        <div className="space-y-2">
          <Label>Type</Label>
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

        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm"
          />
        </div>

        {/* Account Selection */}
        <div className="grid grid-cols-2 gap-3">
          {(type === 'expense' || type === 'transfer') && (
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === 'income' || type === 'transfer') && (
            <div className="space-y-2">
              <Label>To Account</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Stream Selection */}
        <div className="space-y-2">
          <Label>Category/Stream</Label>
          <Select value={streamId} onValueChange={setStreamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select stream" />
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

        {/* Note Button */}
        <button
          type="button"
          onClick={() => setShowNoteModal(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
        >
          <MessageSquare size={16} />
          {note ? `Note: ${note.substring(0, 30)}...` : 'Add Note'}
        </button>

        {/* Calculator */}
        <div className="space-y-2">
          <Label>Amount</Label>
          <Calculator value={amount} onChange={setAmount} />
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
