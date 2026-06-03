import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useModalStackLayer } from '../../core/state/ModalStackContext';
import { modalBackdropProps, modalShellProps } from '../lib/modalLayer';

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
  const layer = useModalStackLayer(isOpen);

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
            {...modalBackdropProps(layer)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            {...modalShellProps(layer)}
          >
            <div className={`bg-card border border-border rounded-2xl w-90 max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-2xl ${className || ''}`}>
              {/* Header */}
              <motion.div
                className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50 shrink-0"
              >
                <div className="w-7" />
                <h2 className="font-bold text-base text-center flex-1">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  <X size={16} />
                </button>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-4 space-y-2"
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
