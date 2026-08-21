import React from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  Eye,
  EyeOff,
  FolderOpen,
  LayoutGrid,
  List,
  PiggyBank,
  Wallet,
} from '@/shared/icons';
import { TerryToggle } from '../../../shared/components/TerryToggle';

export type AccountsViewLayout = 'list' | 'small' | 'full';

/** One category's positive holdings, used for the allocation strip. */
export interface AllocationSlice {
  name: string;
  color: string;
  value: number;
}

interface BalanceOverviewCardProps {
  /** Exact total balance for the current filter. */
  totalBalance: number;
  /** Full (non-compact) currency formatter for the main currency. */
  formatCurrency: (amount: number) => string;
  accountCount: number;
  filteredCount: number;
  savingsAccountCount: number;
  /** True when a single category is filtered (vs. "all"). */
  filterActive: boolean;
  /** Positive holdings per category, pre-sorted descending. */
  allocation: AllocationSlice[];
  viewLayout: AccountsViewLayout;
  onViewChange: (layout: AccountsViewLayout) => void;
  /** Jump to the category manager. */
  onOpenCategories: () => void;
  hidden: boolean;
  onToggleHidden: () => void;
}

const MASK = '••••••';

const VIEW_OPTIONS: { key: AccountsViewLayout; icon: typeof List; label: string }[] = [
  { key: 'list', icon: List, label: 'List' },
  { key: 'small', icon: LayoutGrid, label: 'Grid' },
  { key: 'full', icon: CreditCard, label: 'Cards' },
];

/**
 * The accounts module's hero. A bold amber statement card, benchmarked on the
 * coloured balance cards fintech apps (Revolut, N26, Apple Card) lead with:
 * the exact total up top with a privacy toggle, a category allocation strip,
 * and a segmented layout switcher along the bottom. Deliberately unlike the
 * old circular-ring widget — left-aligned, horizontal, and card-forward.
 */
export const BalanceOverviewCard: React.FC<BalanceOverviewCardProps> = ({
  totalBalance,
  formatCurrency,
  accountCount,
  filteredCount,
  savingsAccountCount,
  filterActive,
  allocation,
  viewLayout,
  onViewChange,
  onOpenCategories,
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

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-4 text-white shadow-lg shadow-orange-900/20 sm:p-5">
      {/* Soft light blooms for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-amber-300/25 blur-3xl"
      />

      <div className="relative">
        {/* Header — eyebrow left, Terry + categories jump right */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Wallet size={16} strokeWidth={2.25} />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
                {filterActive ? 'Category balance' : 'Total balance'}
              </p>
              <p className="text-[11px] font-medium text-white/70">
                {filterActive
                  ? `${filteredCount} ${filteredCount === 1 ? 'account' : 'accounts'} shown`
                  : `${accountCount} ${accountCount === 1 ? 'account' : 'accounts'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <TerryToggle />
            <button
              type="button"
              onClick={onOpenCategories}
              title="Manage categories"
              aria-label="Manage categories"
              className="flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95"
            >
              <FolderOpen size={14} strokeWidth={2.25} />
              <span>Categories</span>
            </button>
          </div>
        </div>

        {/* Hero — exact balance with the privacy toggle */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p
              className="truncate text-3xl font-bold leading-none tracking-tight tabular-nums sm:text-4xl"
              title={hidden ? 'Amount hidden' : formatCurrency(totalBalance)}
            >
              {hidden ? MASK : formatCurrency(totalBalance)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-white/80">
              <span className="inline-flex items-center gap-1">
                <Wallet size={12} strokeWidth={2.25} />
                {accountCount} {accountCount === 1 ? 'account' : 'accounts'}
              </span>
              <span className="inline-flex items-center gap-1">
                <PiggyBank size={12} strokeWidth={2.25} />
                {savingsAccountCount} savings
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleHidden}
            aria-pressed={hidden}
            title={hidden ? 'Show balance' : 'Hide balance'}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95"
          >
            {hidden ? <EyeOff size={18} strokeWidth={2.25} /> : <Eye size={18} strokeWidth={2.25} />}
          </button>
        </div>

        {/* Allocation strip — where the money actually sits */}
        {allocationTotal > 0 && (
          <div className="mt-4">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/25">
              {allocation.map((slice, index) => (
                <div
                  key={`${slice.name}-${index}`}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(slice.value / allocationTotal) * 100}%`,
                    backgroundColor: slice.color,
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)',
                  }}
                  title={`${slice.name} · ${pct(slice.value)}%`}
                />
              ))}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
              {legend.map((slice, index) => (
                <span
                  key={`${slice.name}-${index}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/85"
                >
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-white/40"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="max-w-[9rem] truncate">{slice.name}</span>
                  <span className="tabular-nums text-white/60">{hidden ? '••' : `${pct(slice.value)}%`}</span>
                </span>
              ))}
              {legendRest.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/85">
                  <span className="h-2 w-2 rounded-full bg-white/50 ring-1 ring-white/40" />
                  <span>Other</span>
                  <span className="tabular-nums text-white/60">{hidden ? '••' : `${pct(restValue)}%`}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Layout switcher — segmented control with a sliding pill */}
        <div className="mt-4 flex items-center rounded-2xl bg-white/15 p-1 backdrop-blur-sm">
          {VIEW_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = viewLayout === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onViewChange(option.key)}
                aria-pressed={active}
                title={`${option.label} view`}
                className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold transition-colors ${
                  active ? 'text-orange-700' : 'text-white/80 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="accounts-view-pill"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={14} strokeWidth={2.25} />
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
