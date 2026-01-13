import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimpleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SimpleFormModal: React.FC<SimpleFormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`bg-card border border-border rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${className || ''}`}>
              {/* Header */}
              <motion.div
                className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50 shrink-0"
              >
                <div className="w-8" />
                <h2 className="font-bold text-lg text-center flex-1">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  <X size={20} />
                </button>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
