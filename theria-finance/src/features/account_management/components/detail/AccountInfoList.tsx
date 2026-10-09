import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  CalendarDays,
  Clock,
  Coins,
  CreditCard,
  Eye,
  EyeOff,
  Flag,
  FolderOpen,
  Hash,
  Landmark,
  Palette,
  PiggyBank,
  Route,
  Wallet,
} from '@/shared/icons';
import type { AccountView, Category } from '../../../../core/domain/types';
import { getCurrencyLabel } from '../../../../shared/lib/currencies';
import { DetailSection } from './DetailSection';

const DISPLAY_STYLE_LABELS = { card: 'Card', wallet: 'Wallet', vault: 'Vault' } as const;

/** parseISO reads a bare 'yyyy-MM-dd' as local midnight (not UTC), so record days don't slip a day. */
const formatDay = (value: string) => format(parseISO(value), 'MMM d, yyyy');

interface AccountInfoListProps {
  account: AccountView;
  category?: Category;
  /** Account's resolved currency (its own, else the app's main one). */
  currency: string;
  /** Date of the newest record touching the account, if any. */
  lastActivity?: string;
  formatCurrency: (amount: number) => string;
}

/** Everything stored about the account, laid out as labelled rows. */
export const AccountInfoList: React.FC<AccountInfoListProps> = ({
  account,
  category,
  currency,
  lastActivity,
  formatCurrency,
}) => (
  <DetailSection title="Account information" bodyClassName="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-1">
    <InfoRow
      icon={<FolderOpen size={14} />}
      label="Category"
      value={
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: category?.color || '#6B7280' }}
            aria-hidden
          />
          {category?.name || 'Uncategorized'}
        </span>
      }
    />
    {account.bankName && <InfoRow icon={<Landmark size={14} />} label="Bank" value={account.bankName} />}
    {account.accountNumber && (
      <SensitiveRow icon={<Hash size={14} />} label="Account number" value={account.accountNumber} />
    )}
    {account.routingNumber && (
      <SensitiveRow icon={<Route size={14} />} label="Routing number" value={account.routingNumber} />
    )}
    {account.cardType && (
      <InfoRow icon={<CreditCard size={14} />} label="Card type" value={<span className="capitalize">{account.cardType}</span>} />
    )}
    <InfoRow
      icon={account.isSavings ? <PiggyBank size={14} /> : <Wallet size={14} />}
      label="Type"
      value={account.isSavings ? 'Savings' : 'Standard'}
    />
    <InfoRow icon={<Coins size={14} />} label="Currency" value={`${currency} · ${getCurrencyLabel(currency)}`} />
    <InfoRow
      icon={<Palette size={14} />}
      label="Card style"
      value={DISPLAY_STYLE_LABELS[account.displayStyle ?? 'card']}
    />
    <InfoRow icon={<Flag size={14} />} label="Starting balance" value={formatCurrency(account.initialBalance)} />
    <InfoRow icon={<CalendarDays size={14} />} label="Added" value={formatDay(account.createdAt)} />
    <InfoRow
      icon={<Clock size={14} />}
      label="Last activity"
      value={lastActivity ? formatDay(lastActivity) : 'No records yet'}
    />
  </DetailSection>
);

/** Same row recipe as the record details panel. */
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; trailing?: React.ReactNode }> = ({
  icon,
  label,
  value,
  trailing,
}) => (
  <div className="flex items-start gap-2 py-1.5">
    <div className="mt-0.5 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-[13px] font-medium leading-snug text-foreground break-words">{value}</div>
    </div>
    {trailing}
  </div>
);

/** Masked down to the last four digits until the eye is tapped. */
const SensitiveRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <InfoRow
      icon={icon}
      label={label}
      value={<span className="font-mono tracking-wide">{revealed ? value : `•••• ${value.slice(-4)}`}</span>}
      trailing={
        <button
          type="button"
          onClick={() => setRevealed((open) => !open)}
          aria-pressed={revealed}
          title={revealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-label={revealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      }
    />
  );
};
