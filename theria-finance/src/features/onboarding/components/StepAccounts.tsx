import React from 'react';
import { ACCOUNT_TEMPLATES, ACCOUNT_CATEGORY_TEMPLATES } from '../lib/onboardingTemplates';
import { StepHeading, QuickSelectRow, TemplateToggleCard } from './onboardingUi';

interface StepAccountsProps {
  selected: Set<string>;
  balances: Record<string, string>;
  currencySymbol: string;
  onToggle: (id: string) => void;
  onBalanceChange: (id: string, value: string) => void;
  onSelectPopular: () => void;
  onClear: () => void;
}

const categoryName = (id: string) =>
  ACCOUNT_CATEGORY_TEMPLATES.find((c) => c.id === id)?.name ?? '';

/** Keep only digits and a single decimal point while the user types. */
const sanitizeAmount = (raw: string) => {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
};

export const StepAccounts: React.FC<StepAccountsProps> = ({
  selected,
  balances,
  currencySymbol,
  onToggle,
  onBalanceChange,
  onSelectPopular,
  onClear,
}) => (
  <div>
    <StepHeading
      title="Where does your money live?"
      subtitle="Pick the wallets, banks, and cards you actually use. Add a starting balance if you know it — 0 is fine too."
    />
    <QuickSelectRow onSelectPopular={onSelectPopular} onClear={onClear} />

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ACCOUNT_TEMPLATES.map((account) => (
        <TemplateToggleCard
          key={account.id}
          name={account.name}
          iconName={account.iconName}
          color={account.color}
          selected={selected.has(account.id)}
          onToggle={() => onToggle(account.id)}
          subtitle={categoryName(account.categoryId)}
        >
          <label className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/70 px-2 py-1.5">
            <span className="text-[10px] font-bold text-muted-foreground">{currencySymbol}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Starting balance"
              value={balances[account.id] ?? ''}
              onChange={(e) => onBalanceChange(account.id, sanitizeAmount(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-[11px] font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/60"
            />
          </label>
        </TemplateToggleCard>
      ))}
    </div>
  </div>
);
