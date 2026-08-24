import React, { useState, useEffect } from 'react';
import { CompactFormModal } from '../CompactFormModal';
import { Input } from '../ui/input';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { MessageSquare } from '@/shared/icons';
import { IconColorModal, NoteModal } from '../submodals';
import { IconComponent } from '../IconComponent';
import { CATEGORY_SCOPE_CONFIG } from '../../../core/domain/categoryScopes';
import type { CategoryScope } from '../../../core/domain/types';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which module this category belongs to — fixed by the caller. Every
   *  owning screen creates categories in its own scope, so this is not a
   *  choice the user makes inside the modal. */
  scope?: CategoryScope;
  /** For stream categories only: whether the new category organizes income or
   *  expense streams, so the two tabs keep separate sets. */
  streamKind?: 'income' | 'expense';
  editId?: string | null;
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  scope = 'account',
  streamKind,
  editId = null,
}) => {
  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('FolderOpen');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const { categories, addCategory, updateCategory } = useData();
  const { showAddAlert, showUpdateAlert } = useAlert();
  const isEditing = !!editId;

  // The edited category keeps its original scope even if a caller somehow
  // passed a different one; new categories always take the caller's scope.
  const activeScope = isEditing
    ? (categories.find((c) => c.id === editId)?.scope ?? scope)
    : scope;

  useEffect(() => {
    if (!isOpen) return;

    if (editId) {
      const category = categories.find((c) => c.id === editId);
      if (category) {
        setName(category.name);
        setColor(category.color);
        setIconName(category.iconName);
        setNote(category.note || '');
      }
      return;
    }

    setName('');
    setNote('');
    setColor('#10B981');
    setIconName('FolderOpen');
  }, [editId, isOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) return;

    if (editId) {
      updateCategory(editId, { name, iconName, color, note });
      showUpdateAlert(
        `Category "${name}"`,
        note ? `With description: ${note}` : 'Updated successfully',
      );
    } else {
      addCategory({
        name,
        color,
        iconName,
        scope,
        note,
        ...(scope === 'stream' && streamKind ? { streamKind } : {}),
      });
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
        title={`${isEditing ? 'Edit' : 'Add'} ${capitalize(CATEGORY_SCOPE_CONFIG[activeScope].noun)} Category`}
        accent={color}
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
