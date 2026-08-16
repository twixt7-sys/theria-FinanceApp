import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CloudUpload, Merge } from '@/shared/icons';

type MigrationChoiceModalProps = {
  isOpen: boolean;
  onMerge: () => void;
  onKeepCloud: () => void;
};

/**
 * Shown only when this device and the account both hold data, which is the
 * one case the app cannot decide on the user's behalf. Deliberately has no
 * dismiss: closing it would leave the two copies unreconciled.
 */
export const MigrationChoiceModal: React.FC<MigrationChoiceModalProps> = ({
  isOpen,
  onMerge,
  onKeepCloud,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        key="migration-choice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="migration-choice-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
        >
          <h2 id="migration-choice-title" className="text-base font-bold text-foreground">
            You have data in both places
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            This device has finance data, and so does your account. Which would
            you like to keep?
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onMerge}
              className="flex items-center gap-3 rounded-xl border border-primary bg-primary/10 px-3.5 py-3 text-left transition-colors hover:bg-primary/15"
            >
              <Merge size={18} className="shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">Keep both</span>
                <span className="block text-xs text-muted-foreground">
                  Adds this device's data to your account. Nothing is deleted.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={onKeepCloud}
              className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3 text-left transition-colors hover:bg-muted"
            >
              <CloudUpload size={18} className="shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  Use my account only
                </span>
                <span className="block text-xs text-muted-foreground">
                  Discards the data held on this device.
                </span>
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
