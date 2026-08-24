import React from 'react';
import { SimpleFormModal } from '../SimpleFormModal';
import { CategoryManager } from './CategoryManager';
import type { CategoryScope } from '../../../core/domain/types';

interface CategoriesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: CategoryScope;
  /** For stream scope: which tab's categories to manage (income vs expense). */
  streamKind?: 'income' | 'expense';
  title?: string;
}

/**
 * A pop-up wrapper around {@link CategoryManager}, so a screen can open its
 * category management surface (add / edit / archive / reorder) from a small
 * button without navigating away — used by the round category button beside
 * the Streams income/expense tabs.
 */
export const CategoriesManagerModal: React.FC<CategoriesManagerModalProps> = ({
  isOpen,
  onClose,
  scope,
  streamKind,
  title = 'Categories',
}) => (
  <SimpleFormModal isOpen={isOpen} onClose={onClose} title={title}>
    <CategoryManager scope={scope} streamKind={streamKind} />
  </SimpleFormModal>
);
