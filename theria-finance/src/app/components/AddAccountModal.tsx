import React, { useState, useMemo } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';
import { IconComponent } from './IconComponent';
import { Calculator } from './Calculator';
import { IconColorModal, SelectionModal, NoteModal, BankInformationModal } from './submodals';
import { AddCategoryModal } from './AddCategoryModal';
import { MessageSquare } from 'lucide-react';

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
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, categories } = useData();
  const { showAddAlert } = useAlert();
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

  const [note, setNote] = useState('');

  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
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
    });

    // Show alert
    const formattedBalance = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(balance));
    
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
        <div className="space-y-2">
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
                      {balance ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(parseFloat(balance) || 0) : '$0.00'}
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

          <div className="my-2 h-px w-full bg-border/80" />

          {/* Account Name and Icon */}
          <div className="grid grid-cols-12">
            <Input
              className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
              placeholder='Account Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid col-span-2">
              <button
              type="button"
              onClick={() => setShowIconModal(true)}
              className="h-full ml-1.5 rounded-xl border border-border hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
              title="Choose icon"
              style={{ backgroundColor: (iconName !== 'Wallet' || color !== '#10B981') ? color : undefined, borderColor: (iconName !== 'Wallet' || color !== '#10B981') ? color : undefined }}
            >
              {iconName !== 'Wallet' || color !== '#10B981' ? (
                <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
              ) : (
                <IconComponent name="Wallet" size={14} className="text-muted-foreground" />
              )}
            </button>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowBankModal(true)}
            className={`w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl border border-border transition-all shadow-md ${
              bankName || accountNumber || routingNumber ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
            }`}
            title="Bank Information"
          >
            <IconComponent 
              name="Landmark"
              size={14} 
              className={bankName || accountNumber || routingNumber ? 'text-green-500' : 'text-muted-foreground'}
            />
            <span className={`text-[10px] font-semibold ${bankName || accountNumber || routingNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
              {bankName || 'Bank Information'}
            </span>
          </button>

          <div className="my-2 h-px w-full bg-border/80" />
          
          {/* Note, Category, and Savings Toggle */}
          <div className='grid grid-cols-3 gap-2'>
            {/* Note button - 1/3 ratio */}
            <div className='col-span-1'>
              <button
                type="button"
                onClick={() => setShowNoteModal(true)}
                className={`h-full rounded-xl border border-border transition-colors flex flex-col items-center justify-center gap-1 text-[10px] font-semibold shadow-sm w-full ${
                  note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
                }`}
                title="Add note"
              >
                <MessageSquare size={14} className={note ? 'text-green-500' : 'text-muted-foreground'} />
                <span className={`text-[8px] ${note ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                  {note ? 'Edit note' : 'Add note'}
                </span>
              </button>
            </div>

            {/* Category and Savings Toggle - 2/3 ratio */}
            <div className='col-span-2 space-y-2'>
              {/* Category */}
              <button
                className="flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full"
                type="button"
                onClick={() => setShowCategoryModal(true)}
                style={{ backgroundColor: categoryId ? accountCategories.find(c => c.id === categoryId)?.color + '20' : undefined, borderColor: categoryId ? accountCategories.find(c => c.id === categoryId)?.color : undefined }}
              >
                <div className="pl-6">
                  {categoryId ? (
                    <IconComponent name={accountCategories.find(c => c.id === categoryId)?.iconName || 'Folder'} className='mr-3' size={18} style={{ color: accountCategories.find(c => c.id === categoryId)?.color }} />
                  ) : (
                    <IconComponent name="Folder" className='mr-3' size={18} />
                  )}
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[8px] text-muted-foreground mb-0.5">Category</span>
                  <span className="text-[10px] font-medium truncate">{accountCategories.find(c => c.id === categoryId)?.name || 'Choose Category'}</span>
                </div>
              </button>

              {/* Savings Toggle */}
              <button
                type="button"
                onClick={() => setIsSavings(!isSavings)}
                className={`flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full transition-colors ${
                  isSavings ? 'bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/15' : 'bg-card hover:bg-muted'
                }`}
              >
                <div className="pl-6">
                  <IconComponent 
                    name={isSavings ? "PiggyBank" : "Wallet"} 
                    className={`mr-3 ${isSavings ? 'text-pink-500' : 'text-muted-foreground'}`} 
                    size={18} 
                  />
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[8px] text-muted-foreground mb-0.5">Savings Account</span>
                  <span className={`text-[10px] font-medium ${isSavings ? 'text-pink-500' : 'text-foreground'}`}>
                    {isSavings ? 'Yes' : 'No'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="my-2 h-px w-full bg-border/80" />

          {/* Calculator */}
          <div className="col-span-3">
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
        onAddCategory={() => setShowAddCategoryModal(true)}
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
        onSubmit={() => setShowBankModal(false)}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        highZIndex={true}
      />
    </>
  );
};
