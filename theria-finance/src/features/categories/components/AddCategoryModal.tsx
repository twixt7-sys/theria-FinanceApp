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
          <div className="grid grid-cols-12">
            <Input
              className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
              placeholder="Category Name"
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
                    iconName !== 'FolderOpen' || color !== '#10B981' ? color : undefined,
                  borderColor:
                    iconName !== 'FolderOpen' || color !== '#10B981' ? color : undefined,
                }}
              >
                {iconName !== 'FolderOpen' || color !== '#10B981' ? (
                  <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
                ) : (
                  <IconComponent name="FolderOpen" size={14} className="text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {!isEditing && (
            <>
              <div className="my-2 h-px w-full bg-border/80" />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveScope('account')}
                  className={`h-14 rounded-xl border text-[10px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    activeScope === 'account'
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Wallet size={16} />
                  Account
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScope('stream')}
                  className={`h-14 rounded-xl border text-[10px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    activeScope === 'stream'
                      ? 'bg-secondary/10 text-secondary border-secondary/30'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Folder size={16} />
                  Stream
                </button>
              </div>
            </>
          )}

          <div className="my-2 h-px w-full bg-border/80" />

          <button
            type="button"
            onClick={() => setShowNoteModal(true)}
            className={`w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl border border-border transition-all shadow-md ${
              note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
            }`}
            title="Add description"
          >
            <MessageSquare
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
