import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useData } from '../contexts/DataContext';
import { Calculator } from './Calculator';
import { TimeFilter, type TimeFilterValue } from './TimeFilter';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose}) => {
  var value: TimeFilterValue;

  function onChange(value: TimeFilterValue) {
    value = value;
  }
  const filters: TimeFilterValue[] = ['day', 'week', 'month', 'quarter', 'year'];
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('month');
  const { streams, addBudget } = useData();
  const [streamId, setStreamId] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!streamId || !limit) return;

    addBudget({
      streamId,
      categoryId: 'default',
      limit: parseFloat(limit),
      spent: 0,
      period,
      startDate: new Date().toISOString(),
      endDate: ''
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
      <Input
        className="flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm"
        placeholder='Budget Name'
        ></Input>
      {/* filter buttons */}
      <div className="w-full">
        <div className="grid grid-cols-5 gap-2 p-1 bg-card rounded-lg shadow-md border border-border">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => onChange(filter)}
              className={`w-full px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                value === filter
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {/* Limit Amount + Period */}
        <div className="grid grid-cols-2 gap-3">
        {/* Stream Selection */}
        <span className=" flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm">
          <label className="text-muted-foreground">Stream</label>
        </span>
        <span className=" flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm">
          <label className="text-muted-foreground">Specify</label>
        </span>

        </div>
          <div className="space-y-2">
            <Calculator value={limit} onChange={setLimit} />
          </div>
      </div>
    </CompactFormModal>
  );
};
