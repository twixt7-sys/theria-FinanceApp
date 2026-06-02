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
          <div className="flex gap-2 pt-2 border-t border-border/80">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/15 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex flex-[1.2] items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                <Edit size={14} />
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </SimpleFormModal>
  );
};
