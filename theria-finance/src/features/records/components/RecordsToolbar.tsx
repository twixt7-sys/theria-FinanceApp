import React, { useState } from 'react';
import { Circle, Grid3x3, LayoutGrid, Rows3, Search, Square, X } from 'lucide-react';
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
}) => {
  const { formatMoney: formatCurrency } = useCurrency();
  const [openStat, setOpenStat] = useState<StatKey | null>(null);

  const isLadderScope = (SCOPE_STEPS as readonly string[]).includes(timeScope);
  const scope = SCOPE_ICONS[isLadderScope ? (timeScope as Scope) : 'day'];
  const ScopeIcon = scope.Icon;
  const scopeWord = isLadderScope ? timeScope : 'range';
  const scopeLabel = isLadderScope ? scope.label : 'Custom range';

  // The middle chip follows the sign of the net flow.
  const netTone =
    net > 0
      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
      : net < 0
        ? 'bg-red-500/15 text-red-600 dark:text-red-400'
        : 'bg-muted text-muted-foreground';

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
      tone:
        net > 0
          ? 'text-emerald-600 dark:text-emerald-400'
          : net < 0
            ? 'text-destructive'
            : 'text-muted-foreground',
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
      <div className="flex flex-wrap items-center gap-2">
        <TerryToggle className="shrink-0" />

        {/* Time scope — steps one unit coarser and reveals the time filter */}
        <button
          type="button"
          onClick={onStepTimeScope}
          title={`Time scope: ${scopeLabel} — tap for the next unit`}
          aria-label={`Time scope: ${scopeLabel}. Tap for the next unit`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200/80 text-zinc-700 shadow-sm transition-all hover:bg-zinc-300/80 active:scale-95 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
        >
          <ScopeIcon size={scope.size} strokeWidth={2} aria-hidden />
        </button>

        {/* Search pill — filters as you type */}
        <div className="flex h-9 min-w-[8rem] flex-1 items-center gap-2 rounded-full border border-border/40 bg-muted px-3 shadow-sm">
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

        {/* Income / net / expenses — tap for the exact amount */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <StatChip
            label="Income"
            value={formatCompactCurrency(income, formatCurrency)}
            tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            onClick={() => setOpenStat('income')}
          />
          <StatChip
            label="Net flow"
            value={`${net > 0 ? '+' : ''}${formatCompactCurrency(net, formatCurrency)}`}
            tone={netTone}
            onClick={() => setOpenStat('net')}
          />
          <StatChip
            label="Expenses"
            value={formatCompactCurrency(expense, formatCurrency)}
            tone="bg-red-500/15 text-red-600 dark:text-red-400"
            onClick={() => setOpenStat('expense')}
          />
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

const StatChip: React.FC<{
  label: string;
  value: string;
  tone: string;
  onClick: () => void;
}> = ({ label, value, tone, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={`${label} — tap for the exact amount`}
    aria-label={`${label}: ${value}. Tap for the exact amount`}
    className={`flex h-9 min-w-0 flex-1 items-center justify-center rounded-xl px-2 text-[11px] font-bold tabular-nums shadow-sm transition-all hover:brightness-105 active:scale-95 sm:w-[4.5rem] sm:flex-none ${tone}`}
  >
    <span className="truncate">{value}</span>
  </button>
);
