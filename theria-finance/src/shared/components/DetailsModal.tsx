import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { SimpleFormModal } from './SimpleFormModal';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onEdit,
  onDelete,
  showActions = true
}) => {
  return (
    <SimpleFormModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-3">
        {children}
        {showActions && (onDelete || onEdit) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/80">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                title="Delete"
                aria-label="Delete"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </SimpleFormModal>
  );
};
