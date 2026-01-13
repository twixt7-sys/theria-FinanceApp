import React, { useState, useEffect } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { IconComponent } from './IconComponent';
import { Target, Tag } from 'lucide-react';
import { IconColorSubModal, SelectionSubModal } from './submodals';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({ isOpen, onClose, initialType }) => {
  const { categories, addStream } = useData();
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [iconName, setIconName] = useState('Target');
  const [color, setColor] = useState('#10B981');
  const [categoryId, setCategoryId] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const streamCategories = categories.filter((c) => c.scope === 'stream');

  useEffect(() => {
    if (isOpen && initialType) {
      setType(initialType);
      setColor(initialType === 'income' ? '#10B981' : '#EF4444');
    }
  }, [initialType, isOpen]);

  const getCategoryDetails = () => {
    const category = streamCategories.find(cat => cat.id === categoryId);
    return category || { iconName: 'Tag', color: '#6B7280', name: 'Category' };
  };

  const getCategoryName = () => {
    const category = streamCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Category';
  };

  const handleSelectCategory = (id: string) => {
    setCategoryId(id);
    setShowCategoryModal(false);
  };

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

      <div className="grid grid-cols-12">
        <Input
          className="flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-12"
          placeholder={type === 'income' ? 'Salary, Freelance' : 'Groceries, Transport'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Icon Selection */}
      <button
        className="flex items-center px-3 h-20 rounded-xl text-center border border-border text-sm shadow-sm w-full"
        type="button"
        onClick={() => setShowIconModal(true)}
        style={{ backgroundColor: color + '20', borderColor: color }}
      >
        <IconComponent name={iconName} className='mr-3' size={25} style={{ color }} />
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs text-muted-foreground mb-1">Icon</span>
          <span className="text-sm font-medium truncate">{iconName}</span>
        </div>
      </button>

        {/* Category */}
        {streamCategories.length > 0 && (
          <button
            className="flex items-center px-3 h-20 rounded-xl text-center border border-border text-sm shadow-sm w-full"
            type="button"
            onClick={() => setShowCategoryModal(true)}
            style={{ backgroundColor: categoryId ? getCategoryDetails().color + '20' : undefined, borderColor: categoryId ? getCategoryDetails().color : undefined }}
          >
            {categoryId ? (
              <IconComponent name={getCategoryDetails().iconName || 'Tag'} className='mr-3' size={25} style={{ color: getCategoryDetails().color }} />
            ) : (
              <Tag className='mr-3' size={25} />
            )}
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs text-muted-foreground mb-1">Category</span>
              <span className="text-sm font-medium truncate">{getCategoryName()}</span>
            </div>
          </button>
        )}

      </div>

      {/* Category Modal */}
      {streamCategories.length > 0 && (
        <SelectionSubModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={() => {}}
          title="Choose Category"
          items={streamCategories}
          selectedItem={categoryId}
          onSelectItem={handleSelectCategory}
        />
      )}

      {/* Icon Modal */}
      <IconColorSubModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSubmit={() => {}}
        title="Icon"
        selectedIcon={iconName}
        selectedColor={color}
        onIconChange={setIconName}
        onColorChange={setColor}
      />
    </CompactFormModal>
  );
};
