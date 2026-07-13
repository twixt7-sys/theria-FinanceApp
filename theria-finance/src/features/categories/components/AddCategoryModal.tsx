import React, { useState, useEffect } from 'react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { MessageSquare, Wallet, Folder } from 'lucide-react';
import { IconColorModal, NoteModal } from '../../../shared/components/submodals';
import { IconComponent } from '../../../shared/components/IconComponent';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope?: 'account' | 'stream';
  editId?: string | null;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  scope = 'account',
  editId = null,
}) => {
  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('FolderOpen');
  const [name, setName] = useState('');
  const [activeScope, setActiveScope] = useState<'account' | 'stream'>(scope);
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const { categories, addCategory, updateCategory } = useData();
  const { showAddAlert, showUpdateAlert } = useAlert();
  const isEditing = !!editId;

  useEffect(() => {
    if (!isOpen) return;

    if (editId) {
      const category = categories.find((c) => c.id === editId);
      if (category) {
        setName(category.name);
        setColor(category.color);
        setIconName(category.iconName);
        setActiveScope(category.scope);
        setNote(category.note || '');
      }
      return;
    }

    setName('');
    setNote('');
    setColor('#10B981');
    setIconName('FolderOpen');
    setActiveScope(scope);
  }, [editId, isOpen, scope, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) return;

    if (editId) {
      updateCategory(editId, { name, scope: activeScope, iconName, color, note });
      showUpdateAlert(
        `Category "${name}"`,
        note ? `With description: ${note}` : 'Updated successfully',
      );
    } else {
      addCategory({ name, color, iconName, scope: activeScope, note });
      showAddAlert(`Category "${name}"`, note ? `With description: ${note}` : undefined);
    }

    setName('');
    setNote('');
    setColor('#10B981');
    setIconName('FolderOpen');
    onClose();
  };

  return (
    <>
      <CompactFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={isEditing ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          {/* Name + icon chooser */}
          <div className="flex gap-2">
            <Input
              className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-input-background px-4 text-sm shadow-md"
              placeholder="Category Name"
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
                  iconName !== 'FolderOpen' || color !== '#10B981' ? color : undefined,
                borderColor:
                  iconName !== 'FolderOpen' || color !== '#10B981' ? color : 'var(--border)',
              }}
            >
              {iconName !== 'FolderOpen' || color !== '#10B981' ? (
                <IconComponent name={iconName} size={18} style={{ color: '#ffffff' }} />
              ) : (
                <IconComponent name="FolderOpen" size={18} className="text-muted-foreground" />
              )}
            </button>
          </div>

          {!isEditing && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveScope('account')}
                className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                  activeScope === 'account'
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Wallet size={18} />
                Account
              </button>
              <button
                type="button"
                onClick={() => setActiveScope('stream')}
                className={`flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                  activeScope === 'stream'
                    ? 'bg-secondary/10 text-secondary border-secondary/30'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Folder size={18} />
                Stream
              </button>
            </div>
          )}

          <div className="my-4 h-px w-full bg-border/80" />

          {/* Description */}
          <button
            type="button"
            onClick={() => setShowNoteModal(true)}
            className={`w-full h-20 rounded-xl border border-border transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm ${
              note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
            }`}
            title="Add description"
          >
            <MessageSquare
              size={18}
              className={note ? 'text-green-500' : 'text-muted-foreground'}
            />
            <span
              className={`text-xs ${note ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}
            >
              {note ? 'Edit description' : 'Description'}
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

      <IconColorModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        title="Icon"
        selectedIcon={iconName}
        selectedColor={color}
        onIconChange={setIconName}
        onColorChange={setColor}
      />
    </>
  );
};
