import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingCustomPeriodButtonProps {
  isVisible: boolean;
  onClick: () => void;
  onClose?: () => void;
}

export const FloatingCustomPeriodButton: React.FC<FloatingCustomPeriodButtonProps> = ({
  isVisible,
  onClick,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
            <button
              onClick={onClick}
              className="flex-1 px-3 py-1.5 bg-card/95 text-foreground rounded-full text-xs font-semibold hover:bg-card transition-colors"
              title="Select Period"
            >
              Select Period
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                title="Close"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
