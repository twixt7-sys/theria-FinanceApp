import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useData } from '../contexts/DataContext';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({ isOpen, onClose }) => {
  const { accounts, addSavingsGoal } = useData();
  const [accountId, setAccountId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId || !targetAmount) return;

    addSavingsGoal({
      accountId,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || undefined,
    });

    // Reset
    setAccountId('');
    setTargetAmount('');
    setDeadline('');
    onClose();
  };

  return (
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add Savings Goal"
    >
      {/* Account Selection */}
      <div className="space-y-2">
        <Label>Target Account</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
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

      {/* Target Amount */}
      <div className="space-y-2">
        <Label>Target Amount</Label>
        <Input
          type="number"
          placeholder="0.00"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          step="0.01"
          min="0"
        />
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label>Target Date (Optional)</Label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm"
        />
      </div>
    </CompactFormModal>
  );
};
