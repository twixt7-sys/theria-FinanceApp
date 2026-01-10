import React, { useState, useEffect } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useData } from '../contexts/DataContext';
import { IconComponent } from './IconComponent';
import { Check } from 'lucide-react';

const ICON_OPTIONS = ['Briefcase', 'Code', 'ShoppingCart', 'Car', 'Film', 'Home', 'Coffee', 'Heart', 'Zap', 'Gift', 'Book', 'Music', 'Smartphone', 'Utensils', 'Plane'];
const COLOR_OPTIONS = ['#10B981', '#059669', '#34D399', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1'];

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({ isOpen, onClose, initialType }) => {
  const { categories, addStream } = useData();
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [iconName, setIconName] = useState('Zap');
  const [color, setColor] = useState('#10B981');
  const [categoryId, setCategoryId] = useState('');

  const streamCategories = categories.filter((c) => c.scope === 'stream');

  useEffect(() => {
    if (isOpen && initialType) {
      setType(initialType);
      setColor(initialType === 'income' ? '#10B981' : '#EF4444');
    }
  }, [initialType, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) return;

    addStream({ name, type, iconName, color, categoryId });

    // Reset
    setName('');
    setType('income');
    setIconName('Zap');
    setColor('#10B981');
    setCategoryId('');
    onClose();
  };

  return (
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={`Add ${type === 'income' ? 'Income' : 'Expense'} Stream`}
    >
      <div className="space-y-4">
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setType('income');
              setColor('#10B981');
            }}
            className={`h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
              type === 'income'
                ? 'bg-primary text-white border-primary'
                : 'border-border text-foreground hover:bg-muted'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setColor('#EF4444');
            }}
            className={`h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
              type === 'expense'
                ? 'bg-destructive text-white border-destructive'
                : 'border-border text-foreground hover:bg-muted'
            }`}
          >
            Expense
          </button>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input
            placeholder={type === 'income' ? 'Salary, Freelance' : 'Groceries, Transport'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="shadow-sm"
          />
        </div>

        {/* Category */}
        {streamCategories.length > 0 && (
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent>
                {streamCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Color */}
        <div className="space-y-2">
          <Label>Color *</Label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-10 rounded-lg border-2 transition-all shadow-sm ${
                  color === c
                    ? 'border-foreground scale-105 shadow-md'
                    : 'border-border hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="mx-auto text-white" size={16} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label>Icon *</Label>
          <div className="grid grid-cols-5 gap-2">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setIconName(icon)}
                className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
                  iconName === icon
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <IconComponent name={icon} size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </CompactFormModal>
  );
};
