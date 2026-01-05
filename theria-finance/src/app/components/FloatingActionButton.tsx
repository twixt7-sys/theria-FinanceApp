import React, { useState } from 'react';
import {
  Plus,
  FileText,
  Target,
  PiggyBank,
  Wallet,
  Mail,
  Star,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingActionButtonProps {
  onShowRecordModal: () => void;
  onShowBudgetModal: () => void;
  onShowSavingsModal: () => void;
  onShowAccountModal: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onShowRecordModal,
  onShowBudgetModal,
  onShowSavingsModal,
  onShowAccountModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const primaryActions = [
    {
      icon: FileText,
      label: 'Add Record',
      action: onShowRecordModal,
      highlighted: true,
      tint: 'text-blue-500',
      border: 'border-blue-400/60',
    },
    {
      icon: Target,
      label: 'Add Budget',
      action: onShowBudgetModal,
      tint: 'text-primary',
      border: 'border-primary/40',
    },
    {
      icon: PiggyBank,
      label: 'Add Savings',
      action: onShowSavingsModal,
      tint: 'text-secondary',
      border: 'border-secondary/40',
    },
    {
      icon: Wallet,
      label: 'Add Account',
      action: onShowAccountModal,
      tint: 'text-orange-500',
      border: 'border-orange-400/50',
    },
  ];

  const secondaryActions = [
    {
      icon: MessageCircle,
      label: 'Contact',
      action: () => window.open('mailto:support@theria.app', '_blank'),
    },
    {
      icon: Star,
      label: 'Rate',
      action: () => alert('Rate us feature coming soon!'),
    },
    {
      icon: Mail,
      label: 'Email',
      action: () => window.open('mailto:feedback@theria.app', '_blank'),
    },
  ];

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <div className="mb-4 space-y-2 flex flex-col items-end">
            {primaryActions.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 14, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.9 }}
                  transition={{
                    delay: index * 0.04,
                    type: 'spring',
                    stiffness: 420,
                    damping: 26,
                  }}
                  onClick={() => handleAction(item.action)}
                  className={`group flex items-center justify-end gap-2 px-3 ${
                    item.highlighted ? 'h-12' : 'h-10'
                  } rounded-xl bg-card border ${
                    item.border
                  } shadow-sm hover:bg-muted transition-all ${
                    item.highlighted ? 'ring-1 ring-blue-400/40' : ''
                  }`}
                  title={item.label}
                >
                  <span
                    className={`text-xs font-medium ${item.tint} opacity-80 group-hover:opacity-100 text-right`}
                  >
                    {item.label}
                  </span>
                  <Icon
                    size={18}
                    className={`${item.tint} opacity-80 group-hover:opacity-100`}
                  />
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-0 right-20 flex gap-2 mb-1"
          >
            {secondaryActions.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleAction(item.action)}
                  className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm transition-all"
                  title={item.label}
                >
                  <Icon size={18} />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`w-14 h-14 rounded-xl text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center ${
          isOpen ? 'bg-destructive' : 'bg-blue-600'
        }`}
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};
