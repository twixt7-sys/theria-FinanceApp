import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { MessageSquare, TargetIcon, Folder } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { IconColorSubModal } from './submodals';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ isOpen, onClose, categoryId }) => {
  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('Folder');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);

  const { categories, updateCategory } = useData();

  // Load existing category data
  React.useEffect(() => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setName(category.name);
      setColor(category.color);
      setIconName(category.iconName);
      setNote(category.note || '');
    }
  }, [categoryId, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) return;

    updateCategory(categoryId, {
      name,
      color,
      iconName,
      note
    });

    onClose();
  };

  return (
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Category"
    >
      <div className="grid grid-cols-12">
        <Input
          className="flex items-center gap-2 h-12 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
          placeholder='Category Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid col-span-2">
          <button
              type="button"
              onClick={() => setShowIconModal(true)}
              className="h-full ml-3 rounded-xl border border-border bg-input-background hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
              title="Edit icon"
            >
            <TargetIcon size={18} />
          </button>
        </div>
      </div>

      <div className="my-4 h-px w-full bg-border/60" />

      <div className="space-y-4">
        <div className="space-y-2">
          {/* Note */}
          <button
            type="button"
            onClick={() => setShowNoteModal(true)}
            className="w-full rounded-xl border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-2 p-4 text-sm font-semibold shadow-sm"
            title="Edit note"
          >
            <MessageSquare size={18} />
            <span className="text-muted-foreground">
              {note ? 'Edit note' : 'Add note'}
            </span>
          </button>
        </div>
      </div>

      {/* Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
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
