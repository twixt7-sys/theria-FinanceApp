import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { MessageSquare, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { IconColorModal, SelectionSubModal, NoteModal } from '../../../shared/components/submodals';
import { AddCategoryModal } from '../../categories/components/AddCategoryModal';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
  editId?: string | null;
  /** Pre-selects a category when adding (e.g. the "+" tile under a category). */
  initialCategoryId?: string;
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({
  isOpen,
  onClose,
  initialType,
  editId = null,
  initialCategoryId,
}) => {
  const { categories, streams, addStream, updateStream } = useData();
  const { showAddAlert, showUpdateAlert } = useAlert();
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [iconName, setIconName] = useState('Target');
  const [color, setColor] = useState('#10B981');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const streamCategories = useMemo(
    () => categories.filter((c) => c.scope === 'stream'),
    [categories],
  );
  const isEditing = !!editId;
  const formInitializedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      formInitializedRef.current = false;
      setShowIconModal(false);
      setShowCategoryModal(false);
      setShowAddCategoryModal(false);
      setShowNoteModal(false);
      return;
    }

    if (formInitializedRef.current) return;
    formInitializedRef.current = true;

    if (editId) {
      const stream = streams.find((s) => s.id === editId);
      if (stream) {
        setName(stream.name);
        setType(stream.type as 'income' | 'expense');
        setIconName(stream.iconName);
        setColor(stream.color);
        setCategoryId(stream.categoryId || '');
        setNote('');
      }
      return;
    }

    setName('');
    setNote('');
    setCategoryId(initialCategoryId || streamCategories[0]?.id || '');
    if (initialType) {
      setType(initialType);
      setColor(initialType === 'income' ? '#10B981' : '#EF4444');
      setIconName('Target');
    } else {
      setType('income');
      setColor('#10B981');
      setIconName('Target');
    }
  }, [editId, initialType, initialCategoryId, isOpen, streamCategories, streams]);

  const getCategoryDetails = () => {
    const category = streamCategories.find((cat) => cat.id === categoryId);
    return category || { iconName: 'Tag', color: '#6B7280', name: 'Category' };
  };

  const getCategoryName = () => {
    const category = streamCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Category';
  };

  const handleSelectCategory = (id: string) => {
    setCategoryId(id);
    setShowCategoryModal(false);
  };

  const handleCategoryClick = () => {
    if (streamCategories.length > 0) {
      setShowCategoryModal(true);
    } else {
      setShowAddCategoryModal(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) return;

    if (editId) {
      updateStream(editId, { name, type, iconName, color, categoryId });
      showUpdateAlert(
        `${type === 'income' ? 'Income' : 'Expense'} Stream "${name}"`,
        note ? `With description: ${note}` : 'Updated successfully',
      );
    } else {
      addStream({ name, type, iconName, color, categoryId });
      showAddAlert(
        `${type === 'income' ? 'Income' : 'Expense'} Stream "${name}"`,
        note ? `With description: ${note}` : undefined,
      );
    }

    setName('');
    setType('income');
    setIconName('Target');
    setColor('#10B981');
    setCategoryId('');
    setNote('');
    onClose();
  };

  return (
    <>
      <CompactFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={`${isEditing ? 'Edit' : 'Add'} ${type === 'income' ? 'Income' : 'Expense'} Stream`}
        accent={color}
        headerTint="#eab308"
      >
        <div className="space-y-4">
          {/* Name + icon chooser */}
          <div className="flex gap-2">
            <Input
              className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-input-background px-4 text-sm shadow-md"
              placeholder="Stream Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowIconModal(true)}
              title="Choose icon"
              aria-label="Choose icon"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-md transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor:
                  iconName !== 'Target' || color !== '#10B981' ? color : undefined,
                borderColor:
                  iconName !== 'Target' || color !== '#10B981' ? color : 'var(--border)',
              }}
            >
              {iconName !== 'Target' || color !== '#10B981' ? (
                <IconComponent name={iconName} size={18} style={{ color: '#ffffff' }} />
              ) : (
                <IconComponent name="Target" size={18} className="text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Type selector — icon-only capsule; the header spells out the type */}
          <CapsuleSelector
            id="stream-type"
            iconOnly
            value={type}
            onChange={(next) => {
              setType(next);
              setColor(next === 'income' ? '#10B981' : '#EF4444');
            }}
            options={[
              { value: 'income', label: 'Income', icon: <TrendingUp size={16} />, color: '#10B981' },
              { value: 'expense', label: 'Expense', icon: <TrendingDown size={16} />, color: '#EF4444' },
            ]}
          />

          <div className="my-4 h-px w-full bg-border/80" />

          {/* Category + Description cluster */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCategoryClick}
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center shadow-sm transition-colors"
              style={{
                backgroundColor: categoryId ? `${getCategoryDetails().color}20` : undefined,
                borderColor: categoryId ? getCategoryDetails().color : 'var(--border)',
              }}
              title="Choose category"
            >
              {categoryId ? (
                <IconComponent
                  name={getCategoryDetails().iconName || 'Tag'}
                  size={18}
                  style={{ color: getCategoryDetails().color }}
                />
              ) : (
                <Tag size={18} className="text-muted-foreground" />
              )}
              <span className="w-full truncate text-xs font-medium text-foreground">
                {streamCategories.length > 0 ? getCategoryName() : 'Category'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className={`h-20 rounded-xl border border-border transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm ${
                note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
              }`}
              title="Add description"
            >
              <MessageSquare size={18} className={note ? 'text-green-500' : 'text-muted-foreground'} />
              <span className={`text-xs ${note ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                {note ? 'Edit note' : 'Description'}
              </span>
            </button>
          </div>
        </div>
      </CompactFormModal>

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        note={note}
        onNoteChange={setNote}
      />

      {streamCategories.length > 0 && (
        <SelectionSubModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={() => {}}
          title="Choose Category"
          items={streamCategories}
          selectedItem={categoryId}
          onSelectItem={handleSelectCategory}
          onAddItem={() => setShowAddCategoryModal(true)}
          addItemLabel="Add Category"
        />
      )}

      <IconColorModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        title="Icon"
        selectedIcon={iconName}
        selectedColor={color}
        onIconChange={setIconName}
        onColorChange={setColor}
      />

      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        scope="stream"
      />
    </>
  );
};
