import React from 'react';
import { AddRecordModal } from '../../features/records/components/AddRecordModal';
import { AddBudgetModal } from '../../features/budgets/components/AddBudgetModal';
import { AddSavingsModal } from '../../features/savings/components/AddSavingsModal';
import { AddAccountModal } from '../../features/account_management/components/AddAccountModal';
import { AddStreamModal } from '../../features/streams/components/AddStreamModal';
import { AddCategoryModal } from '../../features/categories/components/AddCategoryModal';
import { CustomDateRangeModal } from '../../shared/components/CustomDateRangeModal';
import { useUi } from '../state/UiContext';

/** The add modals reachable from anywhere via the FAB or the sidebar. */
export const GlobalModals: React.FC = () => {
  const { openModal, closeModal, recordType, streamType, applyCustomDateRange } = useUi();

  return (
    <>
      <CustomDateRangeModal
        isOpen={openModal === 'customDate'}
        onClose={closeModal}
        onSelectRange={applyCustomDateRange}
      />
      <AddRecordModal isOpen={openModal === 'record'} onClose={closeModal} initialType={recordType} />
      <AddBudgetModal isOpen={openModal === 'budget'} onClose={closeModal} />
      <AddSavingsModal isOpen={openModal === 'savings'} onClose={closeModal} />
      <AddAccountModal isOpen={openModal === 'account'} onClose={closeModal} />
      <AddStreamModal isOpen={openModal === 'stream'} onClose={closeModal} initialType={streamType} />
      <AddCategoryModal isOpen={openModal === 'category'} onClose={closeModal} />
    </>
  );
};
