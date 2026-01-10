import React, { useState } from 'react';
import {
  Plus,
  Target,
  PiggyBank,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingActionButtonProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddRequest: () => void;
  onAddAccount: () => void;
  onAddBudget: () => void;
  onAddSavings: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddIncome,
  onAddExpense,
  onAddRequest,
  onAddAccount,
  onAddBudget,
  onAddSavings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const primaryActions = [
    {
      icon: Wallet,
      label: 'Add Account',
      action: onAddAccount,
      tint: 'text-amber-700',
      border: 'border-amber-600/50',
    },
    {
      icon: ArrowDownRight,
      label: 'Add Income',
      action: onAddIncome,
      tint: 'text-yellow-500',
      border: 'border-yellow-400/60',
    },
    {
      icon: ArrowUpRight,
      label: 'Add Expense',
      action: onAddExpense,
      tint: 'text-yellow-500',
      border: 'border-yellow-400/60',
    },
    {
      icon: Send,
      label: 'Add Record',
      action: onAddRequest,
      tint: 'text-blue-500',
      border: 'border-blue-400/60',
    },
  ];

  const secondaryActions = [
    {
      icon: Target,
      label: 'Add Budget',
      action: onAddBudget,
      tint: 'text-orange-300',
    },
    {
      icon: PiggyBank,
      label: 'Add Savings',
      action: onAddSavings,
      tint: 'text-pink-500',
    },
  ];

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Vertical actions collapsing upwards as circular icon buttons with labels */}
            <div className="mb-3 flex flex-col items-end gap-2 mr-2">
              {primaryActions.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{
                      delay: index * 0.04,
                      type: 'spring',
                      stiffness: 420,
                      damping: 28,
                    }}
                    onClick={() => handleAction(item.action)}
                    className="group flex items-center gap-2"
                    title={item.label}
                  >
                    <div className="px-3 py-1.5 rounded-xl bg-card/95 border border-border shadow-sm text-[11px] font-medium text-muted-foreground group-hover:bg-muted/90 group-hover:text-foreground transition-all">
                      {item.label}
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-card border shadow-md ${item.border}`}
                    >
                      <Icon
                        size={18}
                        className={`${item.tint} opacity-90`}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Horizontal actions beside FAB */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute bottom-0 right-20 flex gap-2 items-center"
            >
              {secondaryActions.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleAction(item.action)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted shadow-sm transition-all ${item.tint || 'text-muted-foreground hover:text-foreground'}`}
                    title={item.label}
                  >
                    <Icon size={16} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`w-14 h-14 rounded-full text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center ${
          isOpen ? 'bg-destructive' : 'bg-blue-600'
        }`}
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};
