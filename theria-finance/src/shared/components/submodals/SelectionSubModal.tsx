import React from 'react';
import { SelectionModal, type SelectionModalItem } from './SelectionModal';

interface SelectionSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  items: SelectionModalItem[];
  selectedItem: string;
  onSelectItem: (id: string) => void;
  showCategories?: boolean;
  onAddItem?: (categoryId?: string) => void;
  addItemLabel?: string;
  onAddCategory?: () => void;
  addCategoryLabel?: string;
}

/** @deprecated Prefer SelectionModal — kept for callers still passing onSubmit. */
export const SelectionSubModal: React.FC<SelectionSubModalProps> = ({
  onSubmit,
  onClose,
  ...rest
}) => (
  <SelectionModal
    {...rest}
    onClose={onClose}
    onConfirm={() => {
      onSubmit({ preventDefault: () => {} } as React.FormEvent);
      onClose();
    }}
  />
);
