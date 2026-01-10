import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useData } from '../contexts/DataContext';
import { Calculator } from './Calculator';
import { Calendar } from 'lucide-react';
import { Button } from 'react-day-picker';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({ isOpen, onClose }) => {
  const { accounts, addSavings } = useData();
  const [accountId, setAccountId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId || !targetAmount) return;

    addSavings({
      accountId,
      target: parseFloat(targetAmount),
      current: 0,
      period: 'monthly',
      startDate: new Date().toISOString(),
      endDate: ''
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
        {/* Account Selection */}
        <div className="space-y-2">
          <span className=" flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm">
            <label className="text-muted-foreground">Account</label>
          </span>
          {/*
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="shadow-sm">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select*/}
        </div>
        <div className="space-y-2">
            <div className="flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-muted-foreground"
              />
            </div>
          </div>
      </div>

        {/* Target Amount + Deadline */}
          <div className="space-y-2">
            <Calculator value={targetAmount} onChange={setTargetAmount} />
          </div>
      </div>
    </CompactFormModal>
  );
};
