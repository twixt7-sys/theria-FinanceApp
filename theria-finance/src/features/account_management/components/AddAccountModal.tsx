import React, { useState, useMemo, useEffect } from 'react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { useAlert } from '../../../core/state/AlertContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { Calculator, CalculatorKeypad } from '../../../shared/components/Calculator';
import { PickerRow } from '../../../shared/components/PickerRow';
import { IconColorModal, SelectionModal, NoteModal, BankInformationModal, CurrencySelectionModal } from '../../../shared/components/submodals';
import { AddCategoryModal } from '../../categories/components/AddCategoryModal';
import { MessageSquare, Coins, Landmark, Folder, CreditCard, Wallet, Vault } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatAccountCurrency, getCurrencyMeta } from '../../../shared/lib/currencies';
import { AccountCardVisual, type AccountDisplayStyle } from '../../../shared/components/AccountCardVisual';

const DISPLAY_STYLES: { value: AccountDisplayStyle; label: string; icon: typeof CreditCard }[] = [
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'wallet', label: 'Wallet', icon: Wallet },
  { value: 'vault', label: 'Vault', icon: Vault },
];

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-marks the new account as a savings account (e.g. when opened from the savings flow). */
  initialIsSavings?: boolean;
  /** When set, the modal edits that account instead of adding a new one. */
  editId?: string | null;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  initialIsSavings = false,
  editId = null,
}) => {
  const { addAccount, updateAccount, accounts, categories } = useData();
  const { showAddAlert } = useAlert();
  const { mainCurrency } = useCurrency();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [iconName, setIconName] = useState('PiggyBank');
  const [color, setColor] = useState('#10B981');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [cardType, setCardType] = useState<'debit' | 'credit' | 'checking' | 'savings' | 'none'>('none');
  const [currency, setCurrency] = useState(mainCurrency);
  const [displayStyle, setDisplayStyle] = useState<AccountDisplayStyle>('card');
  // A "savings account" is now expressed through the Bank details card type.
  const isSavings = cardType === 'savings';

  useEffect(() => {
    if (!isOpen) {
      setCalcKeyboardOpen(false);
      return;
    }
    if (editId) {
      const existing = accounts.find((a) => a.id === editId);
      if (existing) {
        setName(existing.name);
        setBalance(existing.balance.toString());
        setCategoryId(existing.categoryId);
        setIconName(existing.iconName);
        setColor(existing.color);
        setBankName(existing.bankName || '');
        setAccountNumber(existing.accountNumber || '');
        setRoutingNumber(existing.routingNumber || '');
        setCardType(existing.cardType || (existing.isSavings ? 'savings' : 'none'));
        setCurrency(existing.currency || mainCurrency);
        setDisplayStyle(existing.displayStyle || 'card');
      }
      return;
    }
    // Add-mode defaults
    setName('');
    setBalance('');
    setCategoryId('');
    setIconName('PiggyBank');
    setColor('#10B981');
    setBankName('');
    setAccountNumber('');
    setRoutingNumber('');
    setCardType(initialIsSavings ? 'savings' : 'none');
    setCurrency(mainCurrency);
    setDisplayStyle('card');
    setNote('');
  }, [isOpen, editId, accounts, mainCurrency, initialIsSavings]);

  const [note, setNote] = useState('');

  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [calcKeyboardOpen, setCalcKeyboardOpen] = useState(false);

  const accountCategories = categories.filter(c => c.scope === 'account');
  
  const groupedByCategory = useMemo(() => {
    const categoryGroups: { [key: string]: { category: { id: string; name: string; color?: string }, items: any[] } } = accountCategories.reduce((acc, category) => {
      const categoryName = category.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: { id: categoryName, name: categoryName, color: category.color },
          items: []
        };
      }
      acc[categoryName].items.push(category);
      return acc;
    }, {} as { [key: string]: { category: { id: string; name: string; color?: string }, items: any[] } });
    
    return Object.values(categoryGroups);
  }, [accountCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !balance) return;

    const payload = {
      name,
      balance: parseFloat(balance),
      categoryId: categoryId || accountCategories[0]?.id || '1',
      iconName,
      color,
      isSavings,
      bankName,
      accountNumber,
      routingNumber,
      ...(cardType !== 'none' ? { cardType } : { cardType: undefined }),
      currency,
      displayStyle,
    };

    const formattedBalance = formatAccountCurrency(parseFloat(balance), currency);

    if (editId) {
      updateAccount(editId, payload);
      showAddAlert(`Account "${name}"`, `Updated · ${formattedBalance}`);
    } else {
      addAccount(payload);
      showAddAlert(`Account "${name}"`, `Starting balance: ${formattedBalance}`);
    }

    onClose();
  };

  return (
    <>
      <CompactFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={editId ? 'Edit Account' : 'Add Account'}
        accent={color}
        headerTint="#b45309"
      >
        <div className="space-y-4">
          {/* Account Card Preview — stays visible above the balance while typing.
              The three icons pick how this account's card is drawn everywhere. */}
          <div
            className="flex items-center gap-2.5 p-3 rounded-lg border transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${color}18, transparent)` }}
          >
            <div className="flex min-w-0 flex-1 justify-center">
              <div className="w-full max-w-[190px]">
                <AccountCardVisual
                  size="preview"
                  displayStyle={displayStyle}
                  name={name}
                  bankName={bankName}
                  balanceText={formatAccountCurrency(balance ? parseFloat(balance) || 0 : 0, currency)}
                  categoryName={accountCategories.find((c) => c.id === categoryId)?.name}
                  accountNumber={accountNumber}
                  iconName={iconName}
                  color={color}
                  cardType={cardType}
                  isSavings={isSavings}
                />
              </div>
            </div>

            {/* Display-style chooser — vertical, on the right of the card */}
            <div className="flex shrink-0 flex-col items-center gap-1.5 rounded-full border border-border bg-card/80 p-1 shadow-sm">
              {DISPLAY_STYLES.map((option) => {
                const Icon = option.icon;
                const active = displayStyle === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDisplayStyle(option.value)}
                    title={option.label}
                    aria-label={`${option.label} style`}
                    aria-pressed={active}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      active ? 'text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
                    }`}
                    style={active ? { backgroundColor: color } : undefined}
                  >
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starting balance with a compact currency selector to its left */}
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => setShowCurrencyModal(true)}
              title="Account currency"
              aria-label="Account currency"
              className="flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-border bg-card text-muted-foreground shadow-md transition-colors hover:bg-muted"
            >
              <Coins size={15} />
              <span className="text-[10px] font-semibold text-foreground">{currency}</span>
            </button>
            <div className="min-w-0 flex-1">
              <Calculator
                variant="record"
                value={balance}
                onChange={setBalance}
                label="Starting Balance"
                currencySymbol={getCurrencyMeta(currency)?.symbol ?? currency}
                displayColor="green"
                keyboardOpen={calcKeyboardOpen}
                onKeyboardOpenChange={setCalcKeyboardOpen}
              />
            </div>
          </div>

          {/* While the keypad is open it temporarily replaces the rest of the form */}
          <AnimatePresence initial={false} mode="wait">
          {calcKeyboardOpen ? (
            <motion.div
              key="account-keypad"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <CalculatorKeypad value={balance} onChange={setBalance} />
            </motion.div>
          ) : (
            <motion.div
              key="account-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-4"
            >
          <div className="my-4 h-px w-full bg-border/80" />

          {/* Name + icon chooser */}
          <div className="flex gap-2">
            <Input
              className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-input-background px-4 text-sm shadow-md"
              placeholder='Account Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowIconModal(true)}
              title="Choose icon"
              aria-label="Choose icon"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-md transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: (iconName !== 'Wallet' || color !== '#10B981') ? color : undefined, borderColor: (iconName !== 'Wallet' || color !== '#10B981') ? color : 'var(--border)' }}
            >
              {iconName !== 'Wallet' || color !== '#10B981' ? (
                <IconComponent name={iconName} size={18} style={{ color: '#ffffff' }} />
              ) : (
                <IconComponent name="Wallet" size={18} className="text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Fields — bento grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Bank details takes the full-width top slot (swapped with Category) */}
            <PickerRow
              className="col-span-2"
              icon={<Landmark size={17} />}
              label="Bank details"
              value={
                bankName ||
                (accountNumber || routingNumber || cardType !== 'none' ? 'Details added' : undefined)
              }
              placeholder="Add bank info (optional)"
              color="#10B981"
              onClick={() => setShowBankModal(true)}
            />

            <PickerRow
              className="col-span-2"
              icon={
                categoryId ? (
                  <IconComponent
                    name={accountCategories.find(c => c.id === categoryId)?.iconName || 'Folder'}
                    size={17}
                  />
                ) : (
                  <Folder size={17} />
                )
              }
              label="Category"
              value={accountCategories.find(c => c.id === categoryId)?.name}
              placeholder="Choose a category"
              color={accountCategories.find(c => c.id === categoryId)?.color}
              onClick={() => setShowCategoryModal(true)}
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

      {/* Note Modal */}
      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        note={note}
        onNoteChange={setNote}
      />

      {/* Icon Modal */}
      <IconColorModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        title="Icon"
        selectedIcon={iconName}
        selectedColor={color}
        onIconChange={setIconName}
        onColorChange={setColor}
      />

      {/* Category Modal */}
      <SelectionModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Choose Category"
        items={groupedByCategory.flatMap((group: any) => group.items)}
        selectedItem={categoryId}
        onSelectItem={setCategoryId}
        showCategories={true}
        onAddItem={() => setShowAddCategoryModal(true)}
        addItemLabel="Add Category"
      />

      <CurrencySelectionModal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        value={currency}
        onChange={setCurrency}
      />

      {/* Bank Information Modal */}
      <BankInformationModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        bankName={bankName}
        onBankNameChange={setBankName}
        cardType={cardType}
        onCardTypeChange={setCardType}
        accountNumber={accountNumber}
        onAccountNumberChange={setAccountNumber}
        routingNumber={routingNumber}
        onRoutingNumberChange={setRoutingNumber}
        onSubmit={(e) => {
          e.preventDefault();
          setShowBankModal(false);
        }}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
      />
    </>
  );
};
