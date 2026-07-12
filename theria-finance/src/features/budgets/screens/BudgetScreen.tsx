import React, { useMemo, useState } from 'react';
import { AlertTriangle, Target } from 'lucide-react';
import { motion } from 'motion/react';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { TimeFilter } from '../../../shared/components/TimeFilter';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { AddBudgetModal } from '../components/AddBudgetModal';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FinanceBuddy, type BuddyMood } from '../../../shared/components/FinanceBuddy';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';
import { computeStreamExpenseTotal, filterRecordsByTimeFilter } from '../../../shared/lib/recordFilters';

interface BudgetScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

const ORANGE = '#F97316';

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = true,
}) => {
  const { budgets, streams, records, deleteBudget } = useData();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  // Session-only: Terry returns the next time the page is opened.
  const [buddyDismissed, setBuddyDismissed] = useState(false);

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;
  const activeDate = currentDate ?? new Date();

  const filteredRecords = useMemo(
    () => filterRecordsByTimeFilter(records, activeTimeFilter, activeDate),
    [records, activeTimeFilter, activeDate]
  );

  const getBudgetSpent = (streamId: string | undefined) =>
    computeStreamExpenseTotal(filteredRecords, streamId);

  const { formatMoney: formatCurrency } = useCurrency();

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getBudgetSpent(b.streamId), 0);
  const overallPct = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
  const overBudget = budgets.filter((b) => getBudgetSpent(b.streamId) > b.limit);
  const onTrackCount = budgets.length - overBudget.length;

  // Terry keeps an eye on the limits
  const buddyMood: BuddyMood =
    budgets.length === 0 ? 'neutral' : overBudget.length > 0 ? 'concerned' : 'happy';
  const buddyLines: string[] = [];
  if (budgets.length === 0) {
    buddyLines.push('No budgets yet — tap the + button and give your spending some guardrails!');
    buddyLines.push('Start with one budget for your biggest expense. Groceries is a classic.');
  } else {
    buddyLines.push(
      `You've used **${formatCurrency(totalSpent)}** of **${formatCurrency(totalBudget)}** budgeted — that's **${Math.round(overallPct * 100)}%**.`,
    );
    if (overBudget.length > 0) {
      buddyLines.push(
        `Careful — **${overBudget.length}** ${overBudget.length === 1 ? 'budget is' : 'budgets are'} over the limit. Let's rein it in!`,
      );
    } else {
      buddyLines.push(`All **${budgets.length}** budgets are within their limits. Look at you go!`);
    }
    buddyLines.push('Tip: a budget you never bust might be ready for a lower limit.');
  }

  // Overview progress ring geometry
  const RING_R = 40;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="budget" />

      {/* Terry watches the limits */}
      {!buddyDismissed && (
        <FinanceBuddy lines={buddyLines} mood={buddyMood} onDismiss={() => setBuddyDismissed(true)} />
      )}

      {/* Budget overview — orange take on the dashboard balance widget */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-orange-100/80 p-4 shadow-sm dark:bg-orange-950/40 sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-orange-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative flex items-center gap-4 sm:gap-5">
          {/* Ring — overall budget usage */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="rounded-full border border-border/40 bg-card/40 p-1.5 shadow-sm">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r={RING_R} fill="var(--card)" stroke="var(--muted)" strokeWidth="8" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r={RING_R}
                    fill="none"
                    stroke={overBudget.length > 0 ? '#EF4444' : ORANGE}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    initial={{ strokeDashoffset: RING_C }}
                    animate={{ strokeDashoffset: RING_C * (1 - overallPct) }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Used
                  </span>
                  <span className="text-xl font-bold tabular-nums text-foreground">
                    {Math.round(overallPct * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Spent + Left — plain, no boxes */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">Spent</p>
              <p
                className="whitespace-nowrap text-base font-bold tabular-nums text-orange-600 dark:text-orange-400"
                title={formatCurrency(totalSpent)}
              >
                {formatCompactCurrency(totalSpent, formatCurrency)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">Left to spend</p>
              <p
                className="whitespace-nowrap text-base font-bold tabular-nums text-foreground"
                title={formatCurrency(Math.max(totalBudget - totalSpent, 0))}
              >
                {formatCompactCurrency(Math.max(totalBudget - totalSpent, 0), formatCurrency)}
              </p>
            </div>
          </div>

          {/* Counts — the single box */}
          <div className="flex shrink-0 flex-col justify-center gap-2 rounded-2xl bg-card/70 px-3.5 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Target size={13} strokeWidth={2.25} className="text-orange-500" aria-hidden />
              <p className="text-[11px] font-medium text-muted-foreground">
                Budgets <span className="font-bold tabular-nums text-foreground">{budgets.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} strokeWidth={2.25} className="text-red-500" aria-hidden />
              <p className="text-[11px] font-medium text-muted-foreground">
                Over <span className="font-bold tabular-nums text-foreground">{overBudget.length}</span>
              </p>
            </div>
            <p className="text-[10px] font-medium leading-tight text-muted-foreground">
              {onTrackCount}/{budgets.length} on track
            </p>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      {showInlineFilter && (
        <div className="w-full">
          <TimeFilter
            value={activeTimeFilter}
            onChange={handleTimeChange}
            currentDate={currentDate}
            onNavigateDate={onNavigateDate}
          />
        </div>
      )}

      {/* Budget Cards */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {budgets.map((budget, index) => {
          const stream = streams.find(s => s.id === budget.streamId);
          const spent = getBudgetSpent(budget.streamId);

          const pct = budget.limit > 0 ? Math.min(spent / budget.limit, 1) : 0;
          const isOverBudget = spent > budget.limit;
          const remaining = budget.limit - spent;
          const accent = stream?.color || ORANGE;

          return (
            <motion.button
              key={budget.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBudgetId(budget.id)}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-3.5 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/25"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl"
                style={{ backgroundColor: `${accent}24` }}
              />

              <div className="relative space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                      style={{ backgroundColor: `${accent}1f` }}
                    >
                      <IconComponent name={stream?.iconName || 'Target'} size={18} style={{ color: accent }} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                        {budget.name}
                      </p>
                      <p className="text-[11px] capitalize text-muted-foreground">{budget.period}</p>
                    </div>
                  </div>
                  {isOverBudget && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                      <AlertTriangle size={10} strokeWidth={2.5} aria-hidden />
                      Over
                    </span>
                  )}
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: isOverBudget ? '#EF4444' : accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(pct * 100, 3)}%` }}
                    transition={{ duration: 0.7, delay: 0.15 + index * 0.05, ease: 'easeOut' }}
                  />
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-[12px] tabular-nums text-foreground">
                    <span className="font-bold">{formatCurrency(spent)}</span>
                    <span className="text-muted-foreground"> of {formatCurrency(budget.limit)}</span>
                  </p>
                  <span
                    className="shrink-0 text-[12px] font-bold tabular-nums"
                    style={{ color: isOverBudget ? '#EF4444' : accent }}
                  >
                    {Math.round(pct * 100)}%
                  </span>
                </div>

                <p className="text-[11px] leading-snug text-muted-foreground">
                  {isOverBudget
                    ? `Over by ${formatCurrency(Math.abs(remaining))} — time to slow down.`
                    : `${formatCurrency(remaining)} left in this budget.`}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <EmptyState
          title="No budgets for this period"
          hint="Use the + button to add one"
        />
      )}

      {/* Details Modal */}
      {selectedBudgetId && (() => {
        const budget = budgets.find(b => b.id === selectedBudgetId);
        const stream = streams.find(s => s.id === budget?.streamId);
        if (!budget) return null;
        const spent = getBudgetSpent(budget.streamId);
        const remaining = budget.limit - spent;
        const pct = budget.limit > 0 ? Math.min(spent / budget.limit, 1) : 0;
        const isOverBudget = spent > budget.limit;
        const accent = stream?.color || ORANGE;
        return (
          <DetailsModal
            isOpen={!!selectedBudgetId}
            onClose={() => setSelectedBudgetId(null)}
            title="Budget Details"
            onEdit={() => {
              setEditId(selectedBudgetId);
              setSelectedBudgetId(null);
            }}
            onDelete={() => setDeleteId(selectedBudgetId)}
          >
            <div className="space-y-2.5">
              <div
                className="flex items-center gap-3 rounded-2xl border border-border/50 p-3"
                style={{ background: `linear-gradient(135deg, ${accent}24, ${accent}08)` }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card shadow-sm">
                  <IconComponent name={stream?.iconName || 'Target'} size={22} style={{ color: accent }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{budget.name}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">{budget.period} period</p>
                </div>
                <span
                  className="shrink-0 text-sm font-bold tabular-nums"
                  style={{ color: isOverBudget ? '#EF4444' : accent }}
                >
                  {Math.round(pct * 100)}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${Math.max(pct * 100, 3)}%`,
                    backgroundColor: isOverBudget ? '#EF4444' : accent,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">Limit</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(budget.limit)}</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(spent)}</p>
                </div>
                <div className="col-span-2 rounded-xl bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">{remaining < 0 ? 'Over by' : 'Remaining'}</p>
                  <p className={`text-sm font-semibold tabular-nums ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </p>
                </div>
              </div>
            </div>
          </DetailsModal>
        );
      })()}

      <AddBudgetModal
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        editId={editId}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete budget</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteBudget(deleteId);
                }
                setDeleteId(null);
                setSelectedBudgetId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
