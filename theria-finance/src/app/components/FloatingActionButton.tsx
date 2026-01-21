import React, { useState } from 'react';
import {
  Plus,
  Target,
  PiggyBank,
  Wallet,
  Send,
  FolderPlus,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingActionButtonProps {
  onAddStream: () => void;
  onAddRequest: () => void;
  onAddAccount: () => void;
  onAddBudget: () => void;
  onAddSavings: () => void;
  onAddCategory: () => void;
  onToggle?: (isOpen: boolean) => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddStream,
  onAddRequest,
  onAddAccount,
  onAddBudget,
  onAddSavings,
  onAddCategory,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const primaryActions = [
    {
      icon: Wallet,
      label: 'Add Account',
      action: onAddAccount,
      button: 'bg-amber-600 hover:bg-amber-600/90',
    },
    {
      icon: FolderPlus,
      label: 'Add Category',
      action: onAddCategory,
      button: 'bg-purple-600 hover:bg-purple-600/90',
    },
    {
      icon: TrendingUp,
      label: 'Add Stream',
      action: onAddStream,
      button: 'bg-blue-600 hover:bg-blue-600/90',
    },
    {
      icon: Send,
      label: 'Add Record',
      action: onAddRequest,
      button: 'bg-blue-600 hover:bg-blue-600/90',
    },
  ];

  const secondaryActions = [
    {
      icon: Target,
      label: 'Add Budget',
      action: onAddBudget,
      button: 'bg-orange-500 hover:bg-orange-500/90',
    },
    {
      icon: PiggyBank,
      label: 'Add Savings',
      action: onAddSavings,
      button: 'bg-pink-500 hover:bg-pink-500/90',
    },
  ];

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay when FAB is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            style={{ marginTop: 'var(--top-nav-height, 60px)', marginBottom: 'var(--bottom-nav-height, 60px)' }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

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
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${item.button}`}
                    >
                      <Icon
                        size={16}
                        className="opacity-95"
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
              className="absolute bottom-0 right-16 flex gap-2 items-center"
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white shadow-md transition-all ${item.button}`}
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
        onClick={handleToggle}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`w-12 h-12 rounded-full text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center ${
          isOpen ? 'bg-destructive' : 'bg-blue-600'
        }`}
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>
    </div>
    </>
  );
};
