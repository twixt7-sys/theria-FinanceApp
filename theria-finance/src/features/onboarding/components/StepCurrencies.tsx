import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';
import { CURRENCY_CATALOG, type CurrencyCode } from '../../../shared/lib/currencies';
import { StepHeading, SelectedBadge } from './onboardingUi';

interface StepCurrenciesProps {
  enabled: CurrencyCode[];
  main: CurrencyCode;
  onToggle: (code: CurrencyCode) => void;
  onSetMain: (code: CurrencyCode) => void;
}

export const StepCurrencies: React.FC<StepCurrenciesProps> = ({
  enabled,
  main,
  onToggle,
  onSetMain,
}) => (
  <div>
    <StepHeading
      title="Which currencies do you use?"
      subtitle="Turn on every currency you touch, then crown one as your main — that's what totals are shown in."
    />

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {CURRENCY_CATALOG.map((currency) => {
        const isEnabled = enabled.includes(currency.code);
        const isMain = currency.code === main;
        return (
          <motion.div
            key={currency.code}
            layout
            whileTap={{ scale: 0.96 }}
            className={`relative rounded-xl border transition-colors duration-200 ${
              isMain
                ? 'border-primary/60 bg-primary/10 shadow-sm'
                : isEnabled
                  ? 'border-primary/30 bg-card shadow-sm'
                  : 'border-border/70 bg-card/60 hover:bg-card'
            }`}
          >
            {isEnabled && !isMain && <SelectedBadge color="#10B981" />}
            <button
              type="button"
              onClick={() => onToggle(currency.code)}
              aria-pressed={isEnabled}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  isEnabled ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {currency.symbol}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-bold ${
                    isEnabled ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {currency.code}
                </span>
                <span className="block truncate text-[10px] text-muted-foreground/80">
                  {currency.label}
                </span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-2.5">
                    <button
                      type="button"
                      onClick={() => onSetMain(currency.code)}
                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold transition-colors ${
                        isMain
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary'
                      }`}
                    >
                      <Star size={11} fill={isMain ? 'currentColor' : 'none'} />
                      {isMain ? 'Main currency' : 'Set as main'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  </div>
);
