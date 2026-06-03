import React, { useState, useEffect } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useModalStackLayer } from '../../../core/state/ModalStackContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { modalBackdropProps, modalShellProps } from '../../lib/modalLayer';

interface CurrencySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (code: string) => void;
}

export const CurrencySelectionModal: React.FC<CurrencySelectionModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
}) => {
  const layer = useModalStackLayer(isOpen);
  const { enabledCurrencyOptions, mainCurrency, availableToAdd, addEnabledCurrency } =
    useCurrency();
  const [showAddPanel, setShowAddPanel] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowAddPanel(false);
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    onClose();
  };

  const handleAddCurrency = (code: (typeof availableToAdd)[number]['code']) => {
    addEnabledCurrency(code);
    if (availableToAdd.length <= 1) setShowAddPanel(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            {...modalBackdropProps(layer)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            {...modalShellProps(layer)}
          >
            <div className="bg-card border border-border rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/30 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  <X size={16} />
                </button>
                <h2 className="font-semibold text-sm text-center flex-1">Account currency</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-primary/15 rounded-lg transition-colors text-primary"
                >
                  <Check size={16} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
                {enabledCurrencyOptions.map((currency) => {
                  const selected = value === currency.code;
                  const isMain = currency.code === mainCurrency;
                  return (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => handleSelect(currency.code)}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        selected
                          ? 'border-primary/40 bg-primary/8 ring-1 ring-primary/20'
                          : 'border-border/60 bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {currency.code}
                          {isMain && (
                            <span className="ml-1.5 text-[9px] font-medium text-muted-foreground">
                              · main
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{currency.label}</p>
                      </div>
                      {selected && (
                        <span className="text-[10px] font-medium text-primary">Selected</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="shrink-0 border-t border-border/60 p-3">
                {availableToAdd.length > 0 ? (
                  !showAddPanel ? (
                    <button
                      type="button"
                      onClick={() => setShowAddPanel(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/30 hover:text-foreground"
                    >
                      <Plus size={14} />
                      Add currency
                    </button>
                  ) : (
                    <div className="space-y-1 max-h-52 overflow-y-auto overscroll-contain">
                      <p className="pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                        Add to your list
                      </p>
                      {availableToAdd.map((currency) => (
                        <button
                          key={currency.code}
                          type="button"
                          onClick={() => handleAddCurrency(currency.code)}
                          className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{currency.code}</p>
                            <p className="text-[10px] text-muted-foreground">{currency.label}</p>
                          </div>
                          <Plus size={14} className="shrink-0 text-muted-foreground" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowAddPanel(false)}
                        className="w-full py-2 text-center text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  )
                ) : (
                  <p className="text-center text-[10px] text-muted-foreground">
                    All catalog currencies are enabled
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
