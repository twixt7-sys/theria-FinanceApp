import React from 'react';
import { AddCategoryModal } from './AddCategoryModal';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryId,
}) => (
  <AddCategoryModal isOpen={isOpen} onClose={onClose} editId={categoryId} />
);
