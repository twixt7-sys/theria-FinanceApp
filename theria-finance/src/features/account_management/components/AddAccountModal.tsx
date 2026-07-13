import React, { useState, useMemo, useEffect } from 'react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { useAlert } from '../../../core/state/AlertContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { Calculator } from '../../../shared/components/Calculator';
import { IconColorModal, SelectionModal, NoteModal, BankInformationModal, CurrencySelectionModal } from '../../../shared/components/submodals';
import { AddCategoryModal } from '../../categories/components/AddCategoryModal';
import { MessageSquare, Coins } from 'lucide-react';
import { formatAccountCurrency } from '../../../shared/lib/currencies';

// Function to get opposite color based on hex color
const getOppositeColor = (hexColor: string): string => {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate opposite color
  const oppositeR = (255 - r).toString(16).padStart(2, '0');
  const oppositeG = (255 - g).toString(16).padStart(2, '0');
  const oppositeB = (255 - b).toString(16).padStart(2, '0');
  
  return `#${oppositeR}${oppositeG}${oppositeB}`;
};

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-marks the new account as a savings account (e.g. when opened from the savings flow). */
  initialIsSavings?: boolean;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  initialIsSavings = false,
}) => {
  const { addAccount, categories } = useData();
  const { showAddAlert } = useAlert();
  const { mainCurrency } = useCurrency();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [iconName, setIconName] = useState('PiggyBank');
  const [color, setColor] = useState('#10B981');
  const oppositeColor = useMemo(() => getOppositeColor(color), [color]);
  const [isSavings, setIsSavings] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [cardType, setCardType] = useState<'debit' | 'credit' | 'checking' | 'savings' | 'none'>('none');
  const [currency, setCurrency] = useState(mainCurrency);

  useEffect(() => {
    if (isOpen) {
      setCurrency(mainCurrency);
      setIsSavings(initialIsSavings);
    }
  }, [isOpen, mainCurrency, initialIsSavings]);

  const [note, setNote] = useState('');

  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

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

    addAccount({
      name,
      balance: parseFloat(balance),
      categoryId: categoryId || accountCategories[0]?.id || '1',
      iconName,
      color,
      isSavings,
      bankName,
      accountNumber,
      routingNumber,
      ...(cardType !== 'none' && { cardType }),
      currency,
    });

    const formattedBalance = formatAccountCurrency(parseFloat(balance), currency);
    
    showAddAlert(`Account "${name}"`, `Starting balance: ${formattedBalance}`);

    // Reset
    setName('');
    setBalance('');
    setCategoryId('');
    setIconName('PiggyBank');
    setColor('#10B981');
    setIsSavings(false);
    setBankName('');
    setAccountNumber('');
    setRoutingNumber('');
    setCardType('none');
    setCurrency(mainCurrency);
    onClose();
  };

  return (
    <>
      <CompactFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title="Add Account"
      >
        <div className="space-y-4">
          {/* Account Card Preview */}
          <div 
            className="flex items-center justify-center p-2 rounded-lg border transition-all duration-300"
            style={{ 
              background: `radial-gradient(circle at 90% 98%, ${color}22, transparent 35%), radial-gradient(circle at 10% 15%, ${color}14, transparent 20%), radial-gradient(circle at 25% 75%, ${oppositeColor}17, transparent 35%), radial-gradient(circle at 75% 25%, ${oppositeColor}15, transparent 30%), linear-gradient(135deg, ${color}18, transparent)`,
              backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 200% 200%',
              backgroundPosition: 'center, center, center, center, 0% 0%'
            }}
          >
            <div 
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-md p-2 my-2 transition-all cursor-pointer min-h-[80px] max-w-[160px] w-full overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${color}dd, ${color}99)`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-white/20"></div>
                <div className="absolute bottom-1 left-1 w-6 h-6 rounded-full border-2 border-white/15"></div>
                <div className="absolute top-1/2 right-1/4 w-4 h-4 rounded-full border-2 border-white/10"></div>
              </div>
              
              <div className="absolute -top-2 right-1 w-10 h-10 opacity-8 transform translate-x-3 translate-y-1 scale-[2] rotate-12">
                <IconComponent
                  name={iconName}
                  size={40}
                  style={{ color: 'white', transform: 'scaleX(-1)' }}
                />
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center shadow-md backdrop-blur-sm"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <IconComponent
                        name={iconName}
                        size={8}
                        style={{ color: 'white' }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-[10px] truncate">{name || 'Account Name'}</h3>
                      {bankName && (
                        <p className="text-white/80 text-[8px]">{bankName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {cardType && cardType !== 'none' && (
                        <span className="px-0.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[6px] rounded-full font-medium">
                          {cardType === 'checking' ? 'Checking' : 
                           cardType === 'savings' ? 'Savings' : 
                           cardType === 'debit' ? 'Debit' : 'Credit'}
                        </span>
                      )}
                      {isSavings && (
                        <span className="px-0.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[6px] rounded-full font-medium">
                          Savings
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  {accountNumber && (
                    <div className="text-white/90 font-mono text-[8px] tracking-wider">
                      •••• •••• •••• {accountNumber.slice(-4)}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/70 text-[6px] mb-0.5">Balance</p>
                    <p className="text-white font-bold text-[10px]">
                      {balance
                        ? formatAccountCurrency(parseFloat(balance) || 0, currency)
                        : formatAccountCurrency(0, currency)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {accountCategories.find(c => c.id === categoryId) && (
                      <p className="text-white/60 text-[6px]">
                        {accountCategories.find(c => c.id === categoryId)?.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="my-4 h-px w-full bg-border/80" />

          {/* Account Name and Icon */}
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowBankModal(true)}
              className={`flex-1 h-12 flex items-center justify-center gap-2 px-3 rounded-xl border transition-all shadow-md ${
                bankName || accountNumber || routingNumber
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-card border-border hover:bg-muted'
              }`}
              title="Bank Information"
            >
              <IconComponent
                name="Landmark"
                size={18}
                className={
                  bankName || accountNumber || routingNumber
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                }
              />
              <span
                className={`text-sm font-semibold truncate ${
                  bankName || accountNumber || routingNumber
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                }`}
              >
                {bankName || 'Bank Info'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowCurrencyModal(true)}
              className={`flex-1 h-12 flex items-center justify-center gap-2 px-3 rounded-xl border transition-all shadow-md ${
                currency !== mainCurrency
                  ? 'bg-primary/10 border-primary/25'
                  : 'bg-card border-border hover:bg-muted'
              }`}
              title="Account currency"
            >
              <Coins
                size={18}
                className={
                  currency !== mainCurrency
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }
              />
              <span
                className={`text-sm font-semibold ${
                  currency !== mainCurrency
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {currency}
              </span>
            </button>
          </div>

          <div className="my-4 h-px w-full bg-border/80" />

          {/* Note, Category, and Savings cluster */}
          <div className='grid grid-cols-3 gap-3'>
            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className={`h-20 rounded-xl border border-border transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm ${
                note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
              }`}
              title="Add note"
            >
              <MessageSquare size={18} className={note ? 'text-green-500' : 'text-muted-foreground'} />
              <span className={`text-xs ${note ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                {note ? 'Edit note' : 'Note'}
              </span>
            </button>

            {/* Category */}
            <button
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center shadow-sm transition-colors"
              type="button"
              onClick={() => setShowCategoryModal(true)}
              style={{ backgroundColor: categoryId ? accountCategories.find(c => c.id === categoryId)?.color + '20' : undefined, borderColor: categoryId ? accountCategories.find(c => c.id === categoryId)?.color : 'var(--border)' }}
              title="Choose category"
            >
              {categoryId ? (
                <IconComponent name={accountCategories.find(c => c.id === categoryId)?.iconName || 'Folder'} size={18} style={{ color: accountCategories.find(c => c.id === categoryId)?.color }} />
              ) : (
                <IconComponent name="Folder" size={18} className="text-muted-foreground" />
              )}
              <span className="w-full truncate text-xs font-medium text-foreground">{accountCategories.find(c => c.id === categoryId)?.name || 'Category'}</span>
            </button>

            {/* Savings Toggle */}
            <button
              type="button"
              onClick={() => setIsSavings(!isSavings)}
              className={`flex h-20 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center shadow-sm transition-colors ${
                isSavings ? 'bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/15' : 'bg-card border-border hover:bg-muted'
              }`}
              title="Mark as savings account"
            >
              <IconComponent
                name={isSavings ? "PiggyBank" : "Wallet"}
                className={isSavings ? 'text-pink-500' : 'text-muted-foreground'}
                size={18}
              />
              <span className={`w-full truncate text-xs font-medium ${isSavings ? 'text-pink-500' : 'text-foreground'}`}>
                {isSavings ? 'Savings' : 'Not savings'}
              </span>
            </button>
          </div>

          <div className="my-4 h-px w-full bg-border/80" />

          {/* Calculator */}
          <div>
            <Calculator value={balance} onChange={setBalance} label="Amount" />
          </div>
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
