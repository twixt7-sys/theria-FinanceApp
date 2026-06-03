import React from 'react';
import { SelectionModal } from './SelectionModal';

interface SelectionSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  items: Array<{
    id: string;
    name: string;
    color?: string;
    iconName?: string;
    type?: string;
    balance?: number;
  }>;
  selectedItem: string;
  onSelectItem: (id: string) => void;
  showCategories?: boolean;
  onAddItem?: () => void;
  addItemLabel?: string;
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
