import React from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';
import { Edit, Trash2 } from 'lucide-react';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {showActions && (
            <div className="flex items-center gap-2">
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
