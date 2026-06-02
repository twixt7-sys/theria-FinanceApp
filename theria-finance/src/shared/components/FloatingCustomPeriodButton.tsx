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
          className="fixed left-1/2 z-40 -translate-x-1/2 bottom-[calc(6rem+env(safe-area-inset-bottom,0px))]"
        >
          <motion.div
            animate={{
              borderColor: ['rgba(156,163,175,0.35)', 'rgba(156,163,175,0.75)', 'rgba(156,163,175,0.35)'],
              boxShadow: [
                '0 8px 20px rgba(0,0,0,0.16)',
                '0 8px 22px rgba(156,163,175,0.25)',
                '0 8px 20px rgba(0,0,0,0.16)',
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-card/95 backdrop-blur-sm border rounded-full shadow-lg px-4 py-2 flex items-center gap-2"
          >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
