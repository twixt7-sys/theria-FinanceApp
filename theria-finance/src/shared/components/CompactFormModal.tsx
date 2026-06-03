import React from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useModalStackLayer } from '../../core/state/ModalStackContext';
import { modalBackdropProps, modalShellProps } from '../lib/modalLayer';

interface CompactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  children: React.ReactNode;
  /** When false, renders a div instead of a form (avoids invalid nested forms inside other modals). */
  asForm?: boolean;
  /** Used when asForm is false: header check closes or confirms without submitting a parent form. */
  onHeaderCheck?: () => void;
}

export const CompactFormModal: React.FC<CompactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  asForm = true,
  onHeaderCheck,
}) => {
  const layer = useModalStackLayer(isOpen);
  const shellClass =
    'bg-card border border-border rounded-2xl w-90 max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-2xl';

  const handleHeaderCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (asForm) return;
    (onHeaderCheck ?? onClose)();
  };

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
            {asForm ? (
            <form
              onSubmit={onSubmit}
              className={shellClass}
            >
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

                <h2 className="font-bold text-base text-center flex-1">{title}</h2>

                <button
                  type="submit"
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
                {children}
              </motion.div>
            </form>
            ) : (
            <div className={shellClass}>
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

                <h2 className="font-bold text-base text-center flex-1">{title}</h2>

                <button
                  type="button"
                  onClick={handleHeaderCheck}
                  className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                >
                  <Check size={16} />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-4 space-y-2"
              >
                {children}
              </motion.div>
            </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
