import React, { useState } from 'react';
import { Check, Plus, Star, X } from 'lucide-react';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { getCurrencyMeta, type CurrencyCode } from '../../../shared/lib/currencies';
import { SettingsGroup, SettingsPageHeader } from '../components/SettingsNav';
import { cn } from '../../../shared/lib/utils';

interface SettingsCurrencyPageProps {
  onBack: () => void;
}

export const SettingsCurrencyPage: React.FC<SettingsCurrencyPageProps> = ({ onBack }) => {
  const {
    mainCurrency,
    enabledCurrencies,
    availableToAdd,
    setMainCurrency,
    addEnabledCurrency,
    removeEnabledCurrency,
  } = useCurrency();
  const [showAddPanel, setShowAddPanel] = useState(false);

  return (
    <div>
      <SettingsPageHeader
        title="Currencies"
        subtitle="Main currency for summaries; add others for accounts"
        onBack={onBack}
      />

      <SettingsGroup title="Main currency">
        {enabledCurrencies.map((code) => {
          const meta = getCurrencyMeta(code);
          const isMain = code === mainCurrency;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setMainCurrency(code as CurrencyCode)}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold',
                  isMain ? 'bg-primary/15 text-primary' : 'bg-muted/60 text-muted-foreground',
                )}
              >
                {meta?.symbol?.slice(0, 2) ?? code.slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                  {code}
                  {isMain && (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                      <Star size={9} fill="currentColor" />
                      Main
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-muted-foreground">{meta?.label}</span>
              </span>
              {isMain && <Check size={16} className="shrink-0 text-primary" />}
            </button>
          );
        })}
      </SettingsGroup>

      <div className="mt-4">
        <SettingsGroup title="Additional currencies">
          {enabledCurrencies
            .filter((code) => code !== mainCurrency)
            .map((code) => {
              const meta = getCurrencyMeta(code);
              return (
                <div
                  key={code}
                  className="flex items-center gap-3 px-3.5 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-[11px] font-semibold text-muted-foreground">
                    {code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground">{meta?.label ?? code}</p>
                    <p className="text-[11px] text-muted-foreground">Available in account pickers</p>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEnabledCurrency(code as CurrencyCode)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${code}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          {enabledCurrencies.length <= 1 && (
            <p className="px-3.5 py-3 text-[11px] text-muted-foreground">
              Add currencies below to use them on accounts.
            </p>
          )}
        </SettingsGroup>
      </div>

      {availableToAdd.length > 0 && (
        <div className="mt-4">
          {!showAddPanel ? (
            <button
              type="button"
              onClick={() => setShowAddPanel(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-3 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/30 hover:text-foreground"
            >
              <Plus size={14} />
              Add currency
            </button>
          ) : (
            <SettingsGroup title="Add to your list">
              {availableToAdd.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => {
                    addEnabledCurrency(currency.code);
                    if (availableToAdd.length <= 1) setShowAddPanel(false);
                  }}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-[11px] font-semibold text-muted-foreground">
                    {currency.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground">{currency.label}</p>
                    <p className="text-[11px] text-muted-foreground">{currency.symbol}</p>
                  </span>
                  <Plus size={14} className="shrink-0 text-muted-foreground" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAddPanel(false)}
                className="w-full px-3.5 py-2.5 text-center text-[11px] text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </SettingsGroup>
          )}
        </div>
      )}
    </div>
  );
};
