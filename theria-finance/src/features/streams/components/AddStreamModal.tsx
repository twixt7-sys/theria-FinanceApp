import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { IconColorModal, SelectionSubModal, NoteModal } from '../../../shared/components/submodals';
import { AddCategoryModal } from '../../categories/components/AddCategoryModal';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
  editId?: string | null;
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({
  isOpen,
  onClose,
  initialType,
  editId = null,
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
    setCategoryId(streamCategories[0]?.id || '');
    if (initialType) {
      setType(initialType);
      setColor(initialType === 'income' ? '#10B981' : '#EF4444');
      setIconName('Target');
    } else {
      setType('income');
      setColor('#10B981');
      setIconName('Target');
    }
  }, [editId, initialType, isOpen, streamCategories, streams]);

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
        title={
          isEditing
            ? `Edit ${type === 'income' ? 'Income' : 'Expense'} Stream`
            : 'Add Stream'
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-12">
            <Input
              className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
              placeholder="Stream Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid col-span-2">
              <button
                type="button"
                onClick={() => setShowIconModal(true)}
                className="h-full ml-1.5 rounded-xl border border-border hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
                title="Choose icon"
                style={{
                  backgroundColor:
                    iconName !== 'Target' || color !== '#10B981' ? color : undefined,
                  borderColor:
                    iconName !== 'Target' || color !== '#10B981' ? color : undefined,
                }}
              >
                {iconName !== 'Target' || color !== '#10B981' ? (
                  <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
                ) : (
                  <IconComponent name="Target" size={14} className="text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/80" />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType(type === 'income' ? 'expense' : 'income');
                setColor(type === 'income' ? '#EF4444' : '#10B981');
              }}
              className={`flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full transition-colors ${
                type === 'income'
                  ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15'
                  : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15'
              }`}
            >
              <div className="pl-6">
                <IconComponent
                  name={type === 'income' ? 'TrendingUp' : 'TrendingDown'}
                  className={`mr-3 ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}
                  size={18}
                />
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-[8px] text-muted-foreground mb-0.5">Type</span>
                <span
                  className={`text-[10px] font-medium ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}
                >
                  {type === 'income' ? 'Income' : 'Expense'}
                </span>
              </div>
            </button>

            <button
              className="flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full transition-colors hover:bg-muted/40"
              type="button"
              onClick={handleCategoryClick}
              style={{
                backgroundColor: categoryId ? `${getCategoryDetails().color}20` : undefined,
                borderColor: categoryId ? getCategoryDetails().color : undefined,
              }}
            >
              <div className="pl-6">
                {categoryId ? (
                  <IconComponent
                    name={getCategoryDetails().iconName || 'Tag'}
                    className="mr-3"
                    size={18}
                    style={{ color: getCategoryDetails().color }}
                  />
                ) : (
                  <Tag className="mr-3 text-muted-foreground" size={18} />
                )}
              </div>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <span className="text-[8px] text-muted-foreground mb-0.5">Category</span>
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {streamCategories.length > 0 ? getCategoryName() : 'Add category'}
                </span>
              </div>
            </button>
          </div>

          <div className="my-2 h-px w-full bg-border/80" />

          <button
            type="button"
            onClick={() => setShowNoteModal(true)}
            className={`w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl border border-border transition-all shadow-md ${
              note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
            }`}
            title="Add description"
          >
            <IconComponent
              name="MessageSquare"
              size={14}
              className={note ? 'text-green-500' : 'text-muted-foreground'}
            />
            <span
              className={`text-[10px] font-semibold ${note ? 'text-green-500' : 'text-muted-foreground'}`}
            >
              {note ? 'Edit description' : 'Add description'}
            </span>
          </button>
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
