import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useData } from '../contexts/DataContext';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose }) => {
  const { streams, addBudget } = useData();
  const [streamId, setStreamId] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!streamId || !limit) return;

    addBudget({
      streamId,
      limit: parseFloat(limit),
      period,
    });

    // Reset
    setStreamId('');
    setLimit('');
    setPeriod('monthly');
    onClose();
  };

  return (
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add Budget"
    >
      {/* Stream Selection */}
      <div className="space-y-2">
        <Label>Category/Stream</Label>
        <Select value={streamId} onValueChange={setStreamId}>
          <SelectTrigger>
            <SelectValue placeholder="Select stream" />
          </SelectTrigger>
          <SelectContent>
            {streams
              .filter((s) => !s.isSystem && s.type === 'expense')
              .map((stream) => (
                <SelectItem key={stream.id} value={stream.id}>
                  {stream.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Limit Amount */}
      <div className="space-y-2">
        <Label>Spending Limit</Label>
        <Input
          type="number"
          placeholder="0.00"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          step="0.01"
          min="0"
        />
      </div>

      {/* Period */}
      <div className="space-y-2">
        <Label>Period</Label>
        <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CompactFormModal>
  );
};
