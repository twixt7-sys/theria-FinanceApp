import React from 'react';
import { PiggyBank } from '@/shared/icons';
import { IconComponent } from '../../../shared/components/IconComponent';
import type { Savings } from '../../../core/domain/types';

interface AccountSavingsPartitionProps {
  /** Open savings held in the account — see `linkedSavingsFor`. */
  savings: Savings[];
  /** The account's live balance. */
  balance: number;
  /** Formats in the account's own currency. */
  formatCurrency: (amount: number) => string;
}

/**
 * Funds partitioned toward savings goals/funds linked to an account, and
 * what's left unreserved. Shared by the account's details panel and page.
 */
export const AccountSavingsPartition: React.FC<AccountSavingsPartitionProps> = ({
  savings,
  balance,
  formatCurrency,
}) => {
  if (savings.length === 0) return null;

  const partitioned = savings.reduce((sum, s) => sum + s.current, 0);
  const available = balance - partitioned;

  return (
    <div className="rounded-xl border border-pink-500/30 bg-pink-500/5 p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400">
          <PiggyBank size={13} strokeWidth={2.5} />
          Partitioned for savings
        </span>
        <span className="text-sm font-bold tabular-nums text-pink-600 dark:text-pink-400">
          {formatCurrency(partitioned)}
        </span>
      </div>
      <div className="space-y-1">
        {savings.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <IconComponent name={s.iconName || 'PiggyBank'} size={12} style={{ color: s.color }} />
              <span className="truncate">{s.name}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {formatCurrency(s.current)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-pink-500/20 pt-1.5 text-xs">
        <span className="text-muted-foreground">Available (unreserved)</span>
        <span className={`font-bold tabular-nums ${available < 0 ? 'text-destructive' : 'text-foreground'}`}>
          {formatCurrency(available)}
        </span>
      </div>
    </div>
  );
};
