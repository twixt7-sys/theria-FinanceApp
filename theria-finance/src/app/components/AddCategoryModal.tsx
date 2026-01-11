import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { MessageSquare, TargetIcon, FolderOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { IconColorSubModal } from './submodals';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose }) => {
  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('FolderOpen');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);

  const { addCategory } = useData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) return;

    addCategory({
      name,
      color,
      iconName,
      scope: 'account',
      note
    });

    // Reset
    setName('');
    setNote('');
    setColor('#10B981');
    setIconName('FolderOpen');
    onClose();
  };

  return (
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add Category"
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
              title="Add icon"
            >
            <TargetIcon size={18} />
          </button>
        </div>
      </div>

      <div className="my-4 h-px w-full bg-border/60" />

      <div className="grid grid-cols-4 gap-2 items-start">
        <div className="col-span-3">
          <div className="w-full p-4 rounded-xl border border-border bg-input-background text-sm shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="font-semibold text-muted-foreground">Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen size={20} style={{ color }} />
              <span className="text-foreground">{name || 'Category Name'}</span>
            </div>
            {note && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{note}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNoteModal(true)}
          className="h-full rounded-xl border border-border bg-card hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
          title="Add note"
        >
          <MessageSquare size={18} />
          <span className="text-xs text-muted-foreground">
            {note ? 'Edit note' : 'Add note'}
          </span>
        </button>
      </div>

      {/* Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
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
