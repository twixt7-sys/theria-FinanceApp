import React, { useState } from 'react';
import {
  Circle,
  Filter,
  FolderOpen,
  Grid3x3,
  LayoutGrid,
  List,
  Rows3,
  Scale,
  Search,
  Square,
  TrendingDown,
  TrendingUp,
  X,
} from '@/shared/icons';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';
import { SimpleFormModal } from '../../../shared/components/SimpleFormModal';
import { TerryToggle } from '../../../shared/components/TerryToggle';

/** The scopes the time button steps through, coarsest last. */
const SCOPE_STEPS = ['day', 'week', 'month', 'quarter', 'year'] as const;

type Scope = (typeof SCOPE_STEPS)[number];

/** One step coarser; a custom range has no place in the ladder, so it restarts. */
export const nextTimeScope = (value: TimeFilterValue): Scope => {
  const index = SCOPE_STEPS.indexOf(value as Scope);
  if (index === -1) return 'day';
  return SCOPE_STEPS[(index + 1) % SCOPE_STEPS.length];
};

/** Each scope draws its own shape: one cell, stacked rows, then denser grids. */
const SCOPE_ICONS: Record<Scope, { Icon: typeof Square; size: number; label: string }> = {
  day: { Icon: Square, size: 11, label: 'Day' },
  week: { Icon: Rows3, size: 16, label: 'Week' },
  month: { Icon: Grid3x3, size: 16, label: 'Month' },
  quarter: { Icon: LayoutGrid, size: 16, label: 'Quarter' },
  year: { Icon: Circle, size: 20, label: 'Year' },
};

type StatKey = 'income' | 'net' | 'expense';
export type RecordsTab = 'records' | 'categories';

interface RecordsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  timeScope: TimeFilterValue;
  /** Opens the time filter and moves the scope one step coarser. */
  onStepTimeScope: () => void;
  income: number;
  net: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
  recordCount: number;
  /** Whether the shell's time-filter panel is currently open. */
  filterOpen: boolean;
  /** Opens/closes the shell's time-filter panel. */
  onToggleFilter: () => void;
  activeTab: RecordsTab;
  /** Swaps between the records list and the category manager. */
  onToggleTab: () => void;
}

export const RecordsToolbar: React.FC<RecordsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  timeScope,
  onStepTimeScope,
  income,
  net,
  expense,
  incomeCount,
  expenseCount,
  recordCount,
  filterOpen,
  onToggleFilter,
  activeTab,
  onToggleTab,
}) => {
  const { formatMoney: formatCurrency } = useCurrency();
  const [openStat, setOpenStat] = useState<StatKey | null>(null);

  const isLadderScope = (SCOPE_STEPS as readonly string[]).includes(timeScope);
  const scope = SCOPE_ICONS[isLadderScope ? (timeScope as Scope) : 'day'];
  const ScopeIcon = scope.Icon;
  const scopeWord = isLadderScope ? timeScope : 'range';
  const scopeLabel = isLadderScope ? scope.label : 'Custom range';

  // Net is the only grey segment; its text follows the sign of the flow.
  const netText =
    net > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : net < 0
        ? 'text-destructive'
        : 'text-muted-foreground';

  const stats: Record<StatKey, { title: string; amount: number; sign: string; tone: string; hint: string }> = {
    income: {
      title: 'Income',
      amount: income,
      sign: income > 0 ? '+' : '',
      tone: 'text-emerald-600 dark:text-emerald-400',
      hint: `${incomeCount} ${incomeCount === 1 ? 'income record' : 'income records'} in this ${scopeWord}`,
    },
    net: {
      title: 'Net flow',
      amount: net,
      sign: net > 0 ? '+' : '',
      tone: netText,
      hint: `Income minus expenses across ${recordCount} ${recordCount === 1 ? 'record' : 'records'}`,
    },
    expense: {
      title: 'Expenses',
      amount: expense,
      sign: expense > 0 ? '−' : '',
      tone: 'text-destructive',
      hint: `${expenseCount} ${expenseCount === 1 ? 'expense record' : 'expense records'} in this ${scopeWord}`,
    },
  };

  const activeStat = openStat ? stats[openStat] : null;

  return (
    <>
      <div className="space-y-2">
        {/* Search sits beside Terry and filters as you type */}
        <div className="flex items-center gap-2">
          <TerryToggle className="shrink-0" />
          <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-border/40 bg-muted px-3 shadow-sm">
            <Search size={14} className="shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search records"
              aria-label="Search records"
              className="min-w-0 flex-1 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Time scope — a passive label capsule capped by the button that
              steps it one unit coarser. Doesn't touch the time filter panel
              at all; that has its own dedicated toggle just to the right. */}
          <div className="flex h-9 shrink-0 items-center">
            <span className="flex h-full items-center whitespace-nowrap rounded-l-full bg-zinc-200/80 pl-3 pr-2 text-[11px] font-semibold text-zinc-700 shadow-sm dark:bg-zinc-800/80 dark:text-zinc-200">
              {scopeLabel}
            </span>
            <button
              type="button"
              onClick={onStepTimeScope}
              title={`Time scope: ${scopeLabel} — tap for the next unit`}
              aria-label={`Time scope: ${scopeLabel}. Tap for the next unit`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200/80 text-zinc-700 shadow-sm transition-all hover:bg-zinc-300/80 active:scale-95 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
            >
              <ScopeIcon size={scope.size} strokeWidth={2} aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleFilter}
            title="Toggle time filter"
            aria-label="Toggle time filter"
            aria-pressed={filterOpen}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-all active:scale-95 ${
              filterOpen
                ? 'bg-primary text-white'
                : 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300/80 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700/80'
            }`}
          >
            <Filter size={16} strokeWidth={2} aria-hidden />
          </button>
        </div>

        {/* Income · net · expense, then the categories toggle */}
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-1">
            <StatSegment
              icon={TrendingUp}
              label="Income"
              value={formatCompactCurrency(income, formatCurrency)}
              tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              rounding="rounded-md rounded-l-2xl"
              onClick={() => setOpenStat('income')}
            />
            <StatSegment
              icon={Scale}
              label="Net flow"
              value={`${net > 0 ? '+' : ''}${formatCompactCurrency(net, formatCurrency)}`}
              tone={`bg-muted ${netText}`}
              rounding="rounded-md"
              onClick={() => setOpenStat('net')}
            />
            <StatSegment
              icon={TrendingDown}
              label="Expenses"
              value={formatCompactCurrency(expense, formatCurrency)}
              tone="bg-red-500/10 text-red-600 dark:text-red-400"
              rounding="rounded-md rounded-r-2xl"
              onClick={() => setOpenStat('expense')}
            />
          </div>

          {/* Categories toggle — swaps the list below between records and
              the category manager; replaces the old Records/Categories
              segmented control. */}
          <button
            type="button"
            onClick={onToggleTab}
            title={activeTab === 'categories' ? 'Back to records' : 'View categories'}
            aria-label={activeTab === 'categories' ? 'Back to records' : 'View categories'}
            aria-pressed={activeTab === 'categories'}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-all active:scale-95 ${
              activeTab === 'categories'
                ? 'bg-primary text-white'
                : 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300/80 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700/80'
            }`}
          >
            {activeTab === 'categories' ? (
              <List size={16} strokeWidth={2} aria-hidden />
            ) : (
              <FolderOpen size={16} strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </div>

      <SimpleFormModal
        isOpen={!!activeStat}
        onClose={() => setOpenStat(null)}
        title={activeStat?.title ?? ''}
        className="max-w-[min(100%,20rem)]"
      >
        {activeStat && (
          <div className="space-y-1.5 py-2 text-center">
            <p className={`text-2xl font-bold tabular-nums leading-none ${activeStat.tone}`}>
              {activeStat.sign}
              {formatCurrency(Math.abs(activeStat.amount))}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">{activeStat.hint}</p>
          </div>
        )}
      </SimpleFormModal>
    </>
  );
};

const StatSegment: React.FC<{
  icon: typeof TrendingUp;
  label: string;
  value: string;
  tone: string;
  rounding: string;
  onClick: () => void;
}> = ({ icon: Icon, label, value, tone, rounding, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={`${label} — tap for the exact amount`}
    aria-label={`${label}: ${value}. Tap for the exact amount`}
    className={`flex h-8 min-w-0 flex-1 items-center justify-center gap-1 px-1.5 text-[11px] font-bold tabular-nums transition-all hover:brightness-105 active:scale-95 ${rounding} ${tone}`}
  >
    <Icon size={12} strokeWidth={2.5} className="shrink-0" aria-hidden />
    <span className="truncate">{value}</span>
  </button>
);
