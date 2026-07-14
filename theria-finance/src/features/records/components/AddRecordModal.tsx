import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MessageSquare, TrendingUp, TrendingDown, ArrowLeftRight, Wallet, Target } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Calculator, CalculatorKeypad } from '../../../shared/components/Calculator';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { PickerRow, PickerTile } from '../../../shared/components/PickerRow';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { SelectionModal, SelectionSubModal, NoteModal } from '../../../shared/components/submodals';
import { CalendarSubModal } from '../../../shared/components/submodals/CalendarSubModal';
import { IconComponent } from '../../../shared/components/IconComponent';
import { AddStreamModal } from '../../streams/components/AddStreamModal';
import { AddAccountModal } from '../../account_management/components/AddAccountModal';

const TYPE_COLORS = {
  income: '#10B981',
  expense: '#EF4444',
  transfer: '#3B82F6',
} as const;

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense' | 'transfer';
  editId?: string | null;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  initialType,
  editId = null,
}) => {
  const { streams, accounts, categories, records, addRecord, updateRecord } = useData();
  const { showAddAlert, showUpdateAlert } = useAlert();
  const categoryNameFor = (categoryId?: string) =>
    categories.find((c) => c.id === categoryId)?.name || 'Other';
  const { formatMoney, mainCurrencySymbol } = useCurrency();
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [streamId, setStreamId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
  );
  const [showNoteModal, setShowNoteModal] = useState(false);
  
  // Submodal states
  const [showFromAccountModal, setShowFromAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAddStreamModal, setShowAddStreamModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [calcKeyboardOpen, setCalcKeyboardOpen] = useState(false);

  const amountDisplayColor = useMemo((): 'green' | 'red' | 'blue' => {
    if (type === 'expense') return 'red';
    if (type === 'transfer') return 'blue';
    return 'green';
  }, [type]);

  // Helper functions
  const getCurrentDate = () => new Date(date);
  const formatDateDisplay = () => {
    const dateObj = getCurrentDate();
    const dateLabel = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return time ? `${dateLabel} · ${formatTimeDisplay(time)}` : dateLabel;
  };

  /** '14:30' → '2:30 PM' for display. */
  const formatTimeDisplay = (value: string) => {
    const [h, m] = value.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return value;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const getFromAccountDetails = () => {
    const account = accounts.find(acc => acc.id === fromAccountId);
    return account || { iconName: 'Wallet', color: '#6B7280' };
  };

  const getToAccountDetails = () => {
    const account = accounts.find(acc => acc.id === toAccountId);
    return account || { iconName: 'Wallet', color: '#6B7280' };
  };

  const getStreamDetails = () => {
    const stream = streams.find(s => s.id === streamId);
    return stream || { iconName: 'Target', color: '#6B7280' };
  };

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (!isOpen) {
      setCalcKeyboardOpen(false);
      return;
    }

    if (editId) {
      const record = records.find((r) => r.id === editId);
      if (record) {
        setType(record.type as 'income' | 'expense' | 'transfer');
        setAmount(record.amount.toString());
        setStreamId(record.streamId);
        setFromAccountId(record.fromAccountId || '');
        setToAccountId(record.toAccountId || '');
        setNote(record.note || '');
        setDate(record.date);
        setTime(
          record.time ||
            new Date(record.createdAt).toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
            }),
        );
      }
      return;
    }

    setType(initialType ?? 'expense');
    setAmount('');
    setStreamId('');
    setFromAccountId('');
    setToAccountId('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  }, [editId, initialType, isOpen, records]);

  // Handler functions for selections
  const handleSelectFromAccount = (id: string) => {
    setFromAccountId(id);
    setShowFromAccountModal(false);
  };

  const handleSelectToAccount = (id: string) => {
    setToAccountId(id);
    setShowToAccountModal(false);
  };

  const handleSelectStream = (id: string) => {
    setStreamId(id);
    setShowStreamModal(false);
  };

  // Helper functions to get display names
  const getFromAccountName = () => {
    const account = accounts.find(acc => acc.id === fromAccountId);
    return account ? account.name : 'From account';
  };

  const getToAccountName = () => {
    const account = accounts.find(acc => acc.id === toAccountId);
    return account ? account.name : 'To account';
  };

  const getStreamName = () => {
    const stream = streams.find(s => s.id === streamId);
    return stream ? stream.name : 'Stream';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if ((type === 'income' || type === 'expense') && !streamId) {
      alert('Please select a stream');
      return;
    }
    
    if (type === 'expense' && !fromAccountId) {
      alert('Please select a from account');
      return;
    }
    
    if (type === 'income' && !toAccountId) {
      alert('Please select a to account');
      return;
    }
    
    if (type === 'transfer' && (!fromAccountId || !toAccountId)) {
      alert('Please select both from and to accounts');
      return;
    }
    
    const recordData = {
      type: type as any,
      amount: parseFloat(amount) || 0,
      streamId,
      note,
      date,
      time,
      ...(type === 'income' && { toAccountId }),
      ...(type === 'expense' && { fromAccountId }),
      ...(type === 'transfer' && { fromAccountId, toAccountId }),
    };

    const streamName = streams.find(s => s.id === streamId)?.name || 'Unknown stream';
    const formattedAmount = formatMoney(parseFloat(amount) || 0);

    if (editId) {
      updateRecord(editId, recordData);
      showUpdateAlert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} Record`,
        `${formattedAmount} - ${streamName}${note ? ` (${note})` : ''}`,
      );
    } else {
      addRecord(recordData);
      showAddAlert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} Record`,
        `${formattedAmount} - ${streamName}${note ? ` (${note})` : ''}`,
      );
    }

    if (!editId) {
      setType('expense');
      setAmount('');
      setStreamId('');
      setFromAccountId('');
      setToAccountId('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }
    onClose();
  };

  return (
    <>
      <CompactFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={`${editId ? 'Edit' : 'Add'} ${type.charAt(0).toUpperCase() + type.slice(1)} Record`}
        accent={TYPE_COLORS[type]}
        headerTint="#3b82f6"
      >
        <div className="space-y-4">
          <Calculator
            variant="record"
            value={amount}
            onChange={setAmount}
            currencySymbol={mainCurrencySymbol}
            displayColor={amountDisplayColor}
            keyboardOpen={calcKeyboardOpen}
            onKeyboardOpenChange={setCalcKeyboardOpen}
          />

          {/* While the keypad is open it temporarily replaces the rest of the form */}
          <AnimatePresence initial={false} mode="wait">
          {calcKeyboardOpen ? (
            <motion.div
              key="record-keypad"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <CalculatorKeypad value={amount} onChange={setAmount} />
            </motion.div>
          ) : (
            <motion.div
              key="record-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-4"
            >
          {/* Type selector — icon-only capsule; the header spells out the type */}
          <CapsuleSelector
            id="record-type"
            iconOnly
            value={type}
            onChange={(next) => setType(next)}
            options={[
              { value: 'income', label: 'Income', icon: <TrendingUp size={16} />, color: TYPE_COLORS.income },
              { value: 'expense', label: 'Expense', icon: <TrendingDown size={16} />, color: TYPE_COLORS.expense },
              { value: 'transfer', label: 'Transfer', icon: <ArrowLeftRight size={16} />, color: TYPE_COLORS.transfer },
            ]}
          />

          {/* Fields — bento grid */}
          <div className="grid grid-cols-2 gap-2">
            {(type === 'expense' || type === 'transfer') && (
              <PickerTile
                icon={
                  fromAccountId ? (
                    <IconComponent name={getFromAccountDetails().iconName} size={17} />
                  ) : (
                    <Wallet size={17} />
                  )
                }
                label="From account"
                value={fromAccountId ? getFromAccountName() : undefined}
                placeholder="Choose account"
                color={getFromAccountDetails().color}
                onClick={() => setShowFromAccountModal(true)}
              />
            )}

            {(type === 'transfer' || type === 'income') && (
              <PickerTile
                icon={
                  toAccountId ? (
                    <IconComponent name={getToAccountDetails().iconName} size={17} />
                  ) : (
                    <Wallet size={17} />
                  )
                }
                label="To account"
                value={toAccountId ? getToAccountName() : undefined}
                placeholder="Choose account"
                color={getToAccountDetails().color}
                onClick={() => setShowToAccountModal(true)}
              />
            )}

            {(type === 'income' || type === 'expense') && (
              <PickerTile
                icon={
                  streamId ? (
                    <IconComponent name={getStreamDetails().iconName} size={17} />
                  ) : (
                    <Target size={17} />
                  )
                }
                label="Stream"
                value={streamId ? getStreamName() : undefined}
                placeholder="Choose stream"
                color={getStreamDetails().color}
                onClick={() => setShowStreamModal(true)}
              />
            )}

            <PickerRow
              className="col-span-2"
              icon={<CalendarDays size={17} />}
              label="Date & time"
              value={formatDateDisplay()}
              onClick={() => setShowCalendarModal(true)}
            />

            <PickerRow
              className="col-span-2"
              icon={<MessageSquare size={17} />}
              label="Note"
              value={note || undefined}
              placeholder="Add a note (optional)"
              color="#10B981"
              onClick={() => setShowNoteModal(true)}
            />
          </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </CompactFormModal>

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        note={note}
        onNoteChange={setNote}
      />

      {/* From Account Modal */}
      <SelectionSubModal
        isOpen={showFromAccountModal}
        onClose={() => setShowFromAccountModal(false)}
        onSubmit={() => {}}
        title="Choose From Account"
        items={accounts.map(acc => ({ ...acc, balance: acc.balance, category: categoryNameFor(acc.categoryId) }))}
        selectedItem={fromAccountId}
        onSelectItem={handleSelectFromAccount}
        showCategories={true}
        onAddItem={() => setShowAddAccountModal(true)}
        addItemLabel="Add Account"
      />

      {/* To Account Modal */}
      <SelectionSubModal
        isOpen={showToAccountModal}
        onClose={() => setShowToAccountModal(false)}
        onSubmit={() => {}}
        title="Choose To Account"
        items={accounts.map(acc => ({ ...acc, balance: acc.balance, category: categoryNameFor(acc.categoryId) }))}
        selectedItem={toAccountId}
        onSelectItem={handleSelectToAccount}
        showCategories={true}
        onAddItem={() => setShowAddAccountModal(true)}
        addItemLabel="Add Account"
      />

      {/* Stream Modal */}
      <SelectionModal
        isOpen={showStreamModal}
        onClose={() => setShowStreamModal(false)}
        title="Choose Stream"
        items={streams
          .filter((s) => !s.isSystem && s.type === type)
          .map(stream => ({ ...stream, category: categoryNameFor(stream.categoryId) }))}
        selectedItem={streamId}
        onSelectItem={handleSelectStream}
        showCategories={true}
        onAddItem={() => setShowAddStreamModal(true)}
        addItemLabel="Add Stream"
      />

      {/* Calendar Modal */}
      <CalendarSubModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={handleDateSelect}
        selectedDate={getCurrentDate()}
        showTime
        time={time}
        onTimeChange={setTime}
      />

      {/* Add Stream Modal */}
      <AddStreamModal
        isOpen={showAddStreamModal}
        onClose={() => setShowAddStreamModal(false)}
        initialType={type === 'transfer' ? 'expense' : type}
      />

      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
      />
    </>
  );
};
