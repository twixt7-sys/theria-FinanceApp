import React from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BankInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankName: string;
  onBankNameChange: (bankName: string) => void;
  cardType: 'debit' | 'credit' | 'checking' | 'savings' | 'none';
  onCardTypeChange: (cardType: 'debit' | 'credit' | 'checking' | 'savings' | 'none') => void;
  accountNumber: string;
  onAccountNumberChange: (accountNumber: string) => void;
  routingNumber: string;
  onRoutingNumberChange: (routingNumber: string) => void;
}

export const BankInformationModal: React.FC<BankInformationModalProps> = ({
  isOpen,
  onClose,
  bankName,
  onBankNameChange,
  cardType,
  onCardTypeChange,
  accountNumber,
  onAccountNumberChange,
  routingNumber,
  onRoutingNumberChange
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-2"
          >
            <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Header */}
              <motion.div
                className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50 shrink-0"
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  <X size={16} />
                </button>

                <h2 className="font-bold text-base text-center flex-1">Bank Information</h2>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                >
                  <Check size={16} />
                </button>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-4 space-y-2"
              >
                {/* Bank Name */}
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="e.g., Chase, Bank of America"
                    value={bankName}
                    onChange={(e) => onBankNameChange(e.target.value)}
                    className="shadow-md"
                  />
                </div>

                {/* Card Type */}
                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <Select value={cardType} onValueChange={(value: 'debit' | 'credit' | 'checking' | 'savings' | 'none') => onCardTypeChange(value)}>
                    <SelectTrigger className="shadow-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="debit">Debit Card</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="123456789"
                    value={accountNumber}
                    onChange={(e) => onAccountNumberChange(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="shadow-md font-mono"
                    maxLength={12}
                  />
                </div>

                {/* Routing Number */}
                <div className="space-y-2">
                  <Label>Routing Number</Label>
                  <Input
                    placeholder="123456789"
                    value={routingNumber}
                    onChange={(e) => onRoutingNumberChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="shadow-md font-mono"
                    maxLength={9}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
