import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';
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
  const { showAddAlert } = useAlert();

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

    // Show alert
    showAddAlert(`Category "${name}"`, note ? `With note: ${note}` : undefined);

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
      <div className="space-y-2">
        <div className="grid grid-cols-12">
          <Input
            className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm col-span-10"
            placeholder='Category Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="col-span-2">
            <button
              type="button"
              onClick={() => setShowIconModal(true)}
              className="h-full ml-1.5 rounded-xl border border-border bg-input-background hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
              title="Add icon"
            >
              <TargetIcon size={14} />
            </button>
          </div>
        </div>

      <div className="my-2 h-px w-full bg-border/60" />

      <div className="grid grid-cols-4 gap-1 items-start">
        <div className="col-span-3">
          <div className="w-full p-2 rounded-xl border border-border bg-input-background text-xs shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="font-semibold text-muted-foreground text-[9px]">Preview</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FolderOpen size={14} style={{ color }} />
              <span className="text-foreground">{name || 'Category Name'}</span>
            </div>
            {note && (
              <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{note}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNoteModal(true)}
          className="h-full rounded-xl border border-border bg-card hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-[10px] font-semibold shadow-sm"
          title="Add note"
        >
          <MessageSquare size={14} />
          <span className="text-[8px] text-muted-foreground">
            {note ? 'Edit note' : 'Add note'}
          </span>
        </button>
      </div>
      </div>

      {/* Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        {showNoteModal && (
          <div className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm pointer-events-none" />
        )}
        <DialogContent className="max-w-md z-[60]">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-32"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNote('')}
              className="flex-1 px-2.5 py-1 bg-muted text-muted-foreground rounded-lg font-semibold hover:bg-muted/80"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowNoteModal(false)}
              className="flex-1 px-2.5 py-1 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              Done
            </button>
          </div>
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
