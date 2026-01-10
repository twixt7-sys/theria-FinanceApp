import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useData } from '../contexts/DataContext';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES = ['Checking', 'Savings', 'Credit Card', 'Investment', 'Cash', 'Other'];
const COLOR_OPTIONS = [
  { name: 'Emerald', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount } = useData();
  const [name, setName] = useState('');
  const [type, setType] = useState('Checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#10B981');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !balance) return;

    addAccount({
      name,
      balance: parseFloat(balance),
      categoryId: 'default',
      iconName: 'credit-card',
      color,
    });

    // Reset
    setName('');
    setType('Checking');
    setBalance('');
    setColor('#10B981');
    onClose();
  };

  return (
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add Account"
    >
      <div className="space-y-4">
        {/* Account Name + Type */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input
              placeholder="e.g., My Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Initial Balance */}
        <div className="space-y-2">
          <Label>Initial Balance</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            step="0.01"
            min="0"
            className="shadow-sm"
          />
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                className={`w-full h-10 rounded-lg border-2 transition-all shadow-sm ${
                  color === opt.value
                    ? 'border-foreground ring-2 ring-offset-1 scale-105'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: opt.value }}
                title={opt.name}
              />
            ))}
          </div>
        </div>
      </div>
    </CompactFormModal>
  );
};
