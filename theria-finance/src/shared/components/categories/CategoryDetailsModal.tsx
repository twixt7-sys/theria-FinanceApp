import React, { useState } from 'react';
import { Archive, ArchiveRestore } from '@/shared/icons';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { CATEGORY_SCOPE_CONFIG } from '../../../core/domain/categoryScopes';
import type { Category } from '../../../core/domain/types';
import { IconComponent } from '../IconComponent';
import { DetailsModal } from '../DetailsModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AddCategoryModal } from './AddCategoryModal';

interface CategoryDetailsModalProps {
  /** The category to show, or null when nothing is selected. */
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Self-contained management panel for a single category, shared by every
 * surface that lets you tap a category (the streams/accounts boards, the
 * category manager). Handles edit, archive/restore, and a guarded delete —
 * so callers only need to pass the category and an onClose.
 */
export const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({
  category,
  isOpen,
  onClose,
}) => {
  const { deleteCategory, getCategoryUsage, updateCategory } = useData();
  const { showDeleteAlert } = useAlert();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!category) return null;
  const config = CATEGORY_SCOPE_CONFIG[category.scope];
  const usage = getCategoryUsage(category.id);
  const deleteBlocked = config.required && usage.total > 0;
  const isArchived = !!category.archived;

  const handleArchiveToggle = () => {
    updateCategory(category.id, { archived: !isArchived });
    onClose();
  };

  const handleDelete = () => {
    const result = deleteCategory(category.id);
    if (result.ok) {
      showDeleteAlert(
        `Category "${category.name}"`,
        result.clearedCount > 0
          ? `Removed from ${result.clearedCount} ${result.clearedCount === 1 ? 'item' : 'items'}`
          : 'Deleted successfully',
      );
      setConfirmingDelete(false);
      onClose();
    }
    // Blocked deletes leave the dialog open — the description explains why.
  };

  return (
    <>
      <DetailsModal
        isOpen={isOpen && !editing}
        onClose={onClose}
        title={category.name}
        onEdit={() => setEditing(true)}
        onDelete={() => setConfirmingDelete(true)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl shadow-md"
              style={{ backgroundColor: `${category.color}22` }}
            >
              {category.customSvg ? (
                <div dangerouslySetInnerHTML={{ __html: category.customSvg }} className="h-8 w-8" />
              ) : (
                <IconComponent name={category.iconName} size={32} style={{ color: category.color }} />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Used by</p>
              <p className="font-semibold capitalize">
                {usage.total} {config.noun}
                {usage.total === 1 ? '' : 's'}
              </p>
              {isArchived && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  <Archive size={11} strokeWidth={2.5} />
                  Archived
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Color</p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded border border-border"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-mono text-sm">{category.color}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Icon</p>
              <p className="font-semibold">{category.iconName}</p>
            </div>
          </div>

          {/* Archive / restore toggle */}
          <button
            type="button"
            onClick={handleArchiveToggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isArchived ? (
              <>
                <ArchiveRestore size={16} />
                Restore category
              </>
            ) : (
              <>
                <Archive size={16} />
                Archive category
              </>
            )}
          </button>
        </div>
      </DetailsModal>

      <AddCategoryModal
        isOpen={editing}
        onClose={() => {
          setEditing(false);
          onClose();
        }}
        editId={category.id}
        scope={category.scope}
      />

      <AlertDialog
        open={confirmingDelete}
        onOpenChange={(open) => {
          if (!open) setConfirmingDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteBlocked
                ? `This category is still used by ${usage.total} ${usage.total === 1 ? config.noun : `${config.noun}s`}. Every ${config.noun} needs a category, so reassign or remove those first.`
                : usage.total > 0
                  ? `This will remove it from ${usage.total} ${usage.total === 1 ? 'item' : 'items'}. This action cannot be undone.`
                  : 'Are you sure you want to delete this category? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{deleteBlocked ? 'Close' : 'Cancel'}</AlertDialogCancel>
            {!deleteBlocked && (
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
