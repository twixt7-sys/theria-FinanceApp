import React from 'react';
import { motion } from 'motion/react';
import {
  Archive,
  Eye,
  EyeOff,
  FolderOpen,
  Wallet,
} from '@/shared/icons';
import { TerryToggle } from '../../../shared/components/TerryToggle';

/** Which slice of the accounts module the screen is currently showing. */
export type AccountsView = 'accounts' | 'archived' | 'categories';

/** One category's positive holdings, used for the allocation strip. */
export interface AllocationSlice {
  name: string;
  color: string;
  value: number;
}

interface BalanceOverviewCardProps {
  /** Exact total balance for the current view (active or archived accounts). */
  totalBalance: number;
  /** Full (non-compact) currency formatter for the main currency. */
  formatCurrency: (amount: number) => string;
  /** Number of active (non-archived) accounts. */
  accountCount: number;
  /** Number of archived accounts. */
  archivedCount: number;
  /** Number of account categories. */
  categoryCount: number;
  /** Positive holdings per category, pre-sorted descending. */
  allocation: AllocationSlice[];
  /** Which sub-view is active — drives both the balance label and the pill. */
  activeView: AccountsView;
  onViewChange: (view: AccountsView) => void;
  hidden: boolean;
  onToggleHidden: () => void;
}

const MASK = '••••••';

/** The three destinations of the accounts module, as an icon-only pill. */
const VIEW_OPTIONS: { key: AccountsView; icon: typeof Wallet; label: string }[] = [
  { key: 'accounts', icon: Wallet, label: 'Accounts' },
  { key: 'archived', icon: Archive, label: 'Archived' },
  { key: 'categories', icon: FolderOpen, label: 'Categories' },
];

/**
 * The accounts module's hero. A subtle orange take on the dashboard balance
 * widget, matching the savings (pink) and budget (orange) overview cards.
 * Terry lives top-left, the privacy toggle top-right, and a neutral card
 * holds the exact total alongside the accounts/archive/categories pill, with
 * a compact icon-only count row underneath.
 */
export const BalanceOverviewCard: React.FC<BalanceOverviewCardProps> = ({
  totalBalance,
  formatCurrency,
  accountCount,
  archivedCount,
  categoryCount,
  allocation,
  activeView,
  onViewChange,
  hidden,
  onToggleHidden,
}) => {
  const allocationTotal = allocation.reduce((sum, slice) => sum + slice.value, 0);
  // Legend stays readable: name the biggest few, roll the rest into "Other".
  const LEGEND_MAX = 4;
  const legend = allocation.slice(0, LEGEND_MAX);
  const legendRest = allocation.slice(LEGEND_MAX);
  const restValue = legendRest.reduce((sum, slice) => sum + slice.value, 0);

  const pct = (value: number) =>
    allocationTotal > 0 ? Math.round((value / allocationTotal) * 100) : 0;

  const balanceLabel = activeView === 'archived' ? 'Archived balance' : 'Total balance';
  // The allocation strip only speaks to the live accounts view.
  const showAllocation = activeView === 'accounts' && allocationTotal > 0;

  const counts: { key: AccountsView; icon: typeof Wallet; value: number; label: string }[] = [
    { key: 'accounts', icon: Wallet, value: accountCount, label: 'accounts' },
    { key: 'archived', icon: Archive, value: archivedCount, label: 'archived' },
    { key: 'categories', icon: FolderOpen, value: categoryCount, label: 'categories' },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-orange-100/80 p-4 shadow-sm dark:bg-orange-950/40 sm:p-5">
      {/* Soft colour blooms for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-orange-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="relative">
        {/* Header — Terry + balance eyebrow left, view pill right */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <TerryToggle className="h-8 w-8" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {balanceLabel}
            </p>
          </div>

          {/* accounts / archive / categories switcher */}
          <div className="flex shrink-0 items-center rounded-full bg-card/70 p-1 shadow-sm">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = activeView === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onViewChange(option.key)}
                  aria-pressed={active}
                  title={option.label}
                  aria-label={option.label}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    active ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="accounts-view-pill"
                      className="absolute inset-0 rounded-full bg-muted shadow-sm"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon size={15} strokeWidth={2.25} className="relative z-10" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Neutral card — balance + counts left, privacy eye centered right */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-card/70 p-3.5 shadow-sm ring-1 ring-border/50 sm:p-4">
          <div className="min-w-0">
            <p
              className="min-w-0 truncate text-3xl font-bold leading-none tracking-tight tabular-nums text-foreground sm:text-4xl"
              title={hidden ? 'Amount hidden' : formatCurrency(totalBalance)}
            >
              {hidden ? MASK : formatCurrency(totalBalance)}
            </p>

            {/* Icon-only counts: accounts · archived · categories */}
            <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-muted-foreground">
              {counts.map((count) => {
                const Icon = count.icon;
                return (
                  <span
                    key={count.key}
                    className="inline-flex items-center gap-1.5 tabular-nums"
                    title={`${count.value} ${count.label}`}
                    aria-label={`${count.value} ${count.label}`}
                  >
                    <Icon size={13} strokeWidth={2.25} />
                    {count.value}
                  </span>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleHidden}
            aria-pressed={hidden}
            title={hidden ? 'Show balance' : 'Hide balance'}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-muted text-foreground shadow-sm transition-all hover:bg-muted/70 active:scale-95"
          >
            {hidden ? <EyeOff size={18} strokeWidth={2.25} /> : <Eye size={18} strokeWidth={2.25} />}
          </button>
        </div>

        {/* Allocation strip — where the live money actually sits */}
        {showAllocation && (
          <div className="mt-4">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-orange-500/15">
              {allocation.map((slice, index) => (
                <div
                  key={`${slice.name}-${index}`}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(slice.value / allocationTotal) * 100}%`,
                    backgroundColor: slice.color,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                  }}
                  title={`${slice.name} · ${pct(slice.value)}%`}
                />
              ))}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
              {legend.map((slice, index) => (
                <span
                  key={`${slice.name}-${index}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground"
                >
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-border/60"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="max-w-[9rem] truncate">{slice.name}</span>
                  <span className="tabular-nums text-muted-foreground">{hidden ? '••' : `${pct(slice.value)}%`}</span>
                </span>
              ))}
              {legendRest.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 ring-1 ring-border/60" />
                  <span>Other</span>
                  <span className="tabular-nums text-muted-foreground">{hidden ? '••' : `${pct(restValue)}%`}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
