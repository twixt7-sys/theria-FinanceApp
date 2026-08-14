import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { SimpleFormModal } from './SimpleFormModal';

interface DetailsModalAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  /** Overrides the default bg-primary styling, e.g. 'bg-emerald-500 hover:bg-emerald-600'. */
  className?: string;
}

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  /**
   * Extra evenly-sized action buttons shown after Edit/Delete (e.g. quick "Add income"/"Add
   * expense" shortcuts). Providing any switches Edit to a square icon button matching Delete,
   * freeing up the row for these.
   */
  extraActions?: DetailsModalAction[];
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onEdit,
  onDelete,
  showActions = true,
  extraActions,
}) => {
  const compact = !!extraActions?.length;

  const editButton = onEdit && (
    compact ? (
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        aria-label="Edit"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-colors"
      >
        <Edit size={16} />
      </button>
    ) : (
      <button
        type="button"
        onClick={onEdit}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
      >
        <Edit size={16} />
        Edit
      </button>
    )
  );

  const deleteButton = onDelete && (
    <button
      type="button"
      onClick={onDelete}
      title="Delete"
      aria-label="Delete"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
    >
      <Trash2 size={16} />
    </button>
  );

  return (
    <SimpleFormModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-3">
        {children}
        {showActions && (onDelete || onEdit || compact) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/80">
            {compact ? (
              <>
                {editButton}
                {deleteButton}
              </>
            ) : (
              <>
                {deleteButton}
                {editButton}
              </>
            )}
            {extraActions?.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                  action.className ?? 'bg-primary hover:bg-primary/90'
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </SimpleFormModal>
  );
};
