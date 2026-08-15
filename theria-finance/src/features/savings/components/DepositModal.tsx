import React, { useEffect, useState } from 'react';
import { PiggyBank, Sparkles, Wallet } from '@/shared/icons';
import { AnimatePresence, motion } from 'motion/react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Calculator, CalculatorKeypad } from '../../../shared/components/Calculator';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { PickerRow } from '../../../shared/components/PickerRow';
import { SelectionSubModal } from '../../../shared/components/submodals';
import { IconComponent } from '../../../shared/components/IconComponent';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { formatAccountCurrency } from '../../../shared/lib/currencies';
import { AddAccountModal } from '../../account_management/components/AddAccountModal';
import { AddCategoryModal } from '../../categories/components/AddCategoryModal';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The savings goal/fund being topped up. */
  savingsId: string | null;
}

const PINK = '#EC4899';

/**
 * Adds money toward a savings goal/fund. Earmark-only: the saved amount goes up
 * without touching account balances, either partitioned from an existing account
 * or by spinning up a fresh account dedicated to this goal.
 */
export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, savingsId }) => {
  const { savings, accounts, categories, updateSavings, addAccount } = useData();
  const { mainCurrency, mainCurrencySymbol } = useCurrency();

  const item = savings.find((s) => s.id === savingsId) || null;

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'existing' | 'new'>('existing');
  const [accountId, setAccountId] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [addAccountCategoryId, setAddAccountCategoryId] = useState<string | undefined>(undefined);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [calcKeyboardOpen, setCalcKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCalcKeyboardOpen(false);
      return;
    }
    setAmount('');
    setSource(accounts.length ? 'existing' : 'new');
    setAccountId(item?.accountId || accounts[0]?.id || '');
  }, [isOpen, savingsId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) return null;

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const categoryNameFor = (categoryId?: string) =>
    categories.find((c) => c.id === categoryId)?.name || 'Other';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) return;

    if (source === 'new') {
      const created = addAccount({
        name: item.name,
        initialBalance: value,
        categoryId: categories.find((c) => c.scope === 'account')?.id || '1',
        iconName: item.iconName || 'PiggyBank',
        color: item.color || PINK,
        isSavings: true,
        currency: mainCurrency,
        displayStyle: 'vault',
      });
      updateSavings(item.id, { accountId: created.id, current: item.current + value });
    } else {
      updateSavings(item.id, {
        current: item.current + value,
        ...(accountId ? { accountId } : {}),
      });
    }

    onClose();
  };

  return (
    <>
      <CompactFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={`Deposit to ${item.name}`}
        accent={PINK}
        headerTint="#ec4899"
        hideActions={calcKeyboardOpen}
      >
        <div className="space-y-4">
          <Calculator
            variant="record"
            value={amount}
            onChange={setAmount}
            label="Deposit amount"
            currencySymbol={mainCurrencySymbol}
            displayColor="green"
            keyboardOpen={calcKeyboardOpen}
            onKeyboardOpenChange={setCalcKeyboardOpen}
          />

          {/* While the keypad is open it temporarily replaces the rest of the form */}
          <AnimatePresence initial={false} mode="wait">
          {calcKeyboardOpen ? (
            <motion.div
              key="deposit-keypad"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <CalculatorKeypad value={amount} onChange={setAmount} />
            </motion.div>
          ) : (
            <motion.div
              key="deposit-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-4"
            >
          {/* Where the money comes from */}
          <CapsuleSelector
            id="deposit-source"
            value={source}
            onChange={(next: 'existing' | 'new') => setSource(next)}
            options={[
              { value: 'existing', label: 'From account', icon: <Wallet size={15} />, color: PINK },
              { value: 'new', label: 'New account', icon: <Sparkles size={15} />, color: PINK },
            ]}
          />

          {source === 'existing' ? (
            <PickerRow
              icon={
                selectedAccount ? (
                  <IconComponent name={selectedAccount.iconName} size={17} />
                ) : (
                  <Wallet size={17} />
                )
              }
              label="Partition from"
              value={selectedAccount?.name}
              placeholder="Choose account"
              color={selectedAccount?.color}
              onClick={() => setShowAccountPicker(true)}
            />
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-pink-500/30 bg-pink-500/5 px-3 py-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${item.color || PINK}20`, color: item.color || PINK }}
              >
                <PiggyBank size={17} />
              </span>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Creates a new savings account called{' '}
                <span className="font-semibold text-foreground">{item.name}</span>, dedicated to this{' '}
                {item.kind === 'savings' ? 'fund' : 'goal'}.
              </p>
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            This raises the saved amount — your account balances stay as they are.
          </p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </CompactFormModal>

      <SelectionSubModal
        isOpen={showAccountPicker}
        onClose={() => setShowAccountPicker(false)}
        onSubmit={() => setShowAccountPicker(false)}
        title="Partition from"
        items={accounts.map((a) => ({
          ...a,
          category: categoryNameFor(a.categoryId),
          categoryId: a.categoryId,
          subtitle: formatAccountCurrency(a.balance, a.currency),
        }))}
        selectedItem={accountId}
        onSelectItem={(id: string) => {
          setAccountId(id);
          setShowAccountPicker(false);
        }}
        showCategories
        onAddItem={(categoryId) => {
          setAddAccountCategoryId(categoryId);
          setShowAddAccountModal(true);
        }}
        addItemLabel="Add Account"
        onAddCategory={() => setShowAddCategoryModal(true)}
      />

      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => {
          setShowAddAccountModal(false);
          setAddAccountCategoryId(undefined);
        }}
        initialCategoryId={addAccountCategoryId}
      />

      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        scope="account"
      />
    </>
  );
};
