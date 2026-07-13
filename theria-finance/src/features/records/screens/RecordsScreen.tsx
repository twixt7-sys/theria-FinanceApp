import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { TimeFilter } from '../../../shared/components/TimeFilter';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { useTheme } from '../../../core/state/ThemeContext';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { IconComponent } from '../../../shared/components/IconComponent';
import { FinanceBuddy, type BuddyMood } from '../../../shared/components/FinanceBuddy';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';
import { RecordDetailsModal } from '../components/RecordDetailsModal';
import { AddRecordModal } from '../components/AddRecordModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/components/ui/alert-dialog';

interface RecordsScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = true,
}) => {
  const { records, streams, accounts, deleteRecord } = useData();
  const { isDark } = useTheme();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Session-only: Terry returns the next time the page is opened.
  const [buddyDismissed, setBuddyDismissed] = useState(false);

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const activeCurrentDate = currentDate ?? localCurrentDate;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;
  const handleNavigateDate = onNavigateDate ?? ((direction: 'prev' | 'next') => {
    const newDate = new Date(activeCurrentDate);

    switch (activeTimeFilter) {
      case 'day':
        newDate.setDate(activeCurrentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(activeCurrentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(activeCurrentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(activeCurrentDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(activeCurrentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }

    setLocalCurrentDate(newDate);
  });

  const getFilteredRecords = () => {
    const now = activeCurrentDate;
    return records.filter(r => {
      const recordDate = new Date(r.date);
      switch (activeTimeFilter) {
        case 'day':
          return recordDate.toDateString() === now.toDateString();
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return recordDate >= weekStart && recordDate <= weekEnd;
        }
        case 'month':
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        case 'quarter': {
          const quarter = Math.floor(now.getMonth() / 3);
          const recordQuarter = Math.floor(recordDate.getMonth() / 3);
          return recordQuarter === quarter && recordDate.getFullYear() === now.getFullYear();
        }
        case 'year':
          return recordDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const filteredRecords = getFilteredRecords();

  const handleDelete = () => {
    if (deleteId) {
      deleteRecord(deleteId);
      setDeleteId(null);
      setDetailsId(null);
    }
  };

  const { formatMoney: formatCurrency } = useCurrency();

  const getTypeColor = (type: string) => {
    if (type === 'income') return '#10B981';
    if (type === 'transfer') return '#3B82F6';
    return '#EF4444';
  };

  const getRecordTitle = (record: (typeof records)[number]) => {
    if (record.type === 'transfer') {
      const fromName =
        accounts.find((a) => a.id === record.fromAccountId)?.name || 'Unknown account';
      const toName =
        accounts.find((a) => a.id === record.toAccountId)?.name || 'Unknown account';
      return `${fromName} → ${toName}`;
    }
    const stream = streams.find((s) => s.id === record.streamId);
    return stream?.name || 'Unknown';
  };

  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const transferCount = filteredRecords.filter((r) => r.type === 'transfer').length;

  // Terry reads the period's cashflow
  const buddyMood: BuddyMood =
    filteredRecords.length === 0 ? 'neutral' : netFlow >= 0 ? 'happy' : 'concerned';
  const buddyLines: string[] = [];
  if (filteredRecords.length === 0) {
    buddyLines.push('No records for this period — tap the + button and log your first one!');
    buddyLines.push('Logging right after you spend takes 30 seconds. Future you says thanks.');
  } else {
    buddyLines.push(
      netFlow >= 0
        ? `Nice — you're **${formatCurrency(netFlow)}** ahead this period. Money in beat money out!`
        : `Heads up — you spent **${formatCurrency(Math.abs(netFlow))}** more than you earned this period.`,
    );
    buddyLines.push(
      `That's **${filteredRecords.length}** ${filteredRecords.length === 1 ? 'record' : 'records'}: **${formatCurrency(totalIncome)}** in, **${formatCurrency(totalExpenses)}** out.`,
    );
    buddyLines.push('Tap any record to see its full story — or fix a typo.');
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-shrink-0 space-y-4">
        <SimpleModeHint page="records" />

        {/* Terry reads the cashflow */}
        {!buddyDismissed && (
          <FinanceBuddy lines={buddyLines} mood={buddyMood} onDismiss={() => setBuddyDismissed(true)} />
        )}

        {showInlineFilter && (
          <div className="w-full">
            <TimeFilter
              value={activeTimeFilter}
              onChange={handleTimeChange}
              currentDate={activeCurrentDate}
              onNavigateDate={handleNavigateDate}
            />
          </div>
        )}

        {/* Records overview — blue take on the dashboard balance widget */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-blue-100/80 p-4 shadow-sm dark:bg-blue-950/40 sm:p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl"
          />

          <div className="relative flex items-center gap-4 sm:gap-5">
            {/* Net flow circle */}
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="rounded-full border border-border/40 bg-card/40 p-1.5 shadow-sm">
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[6px] border-blue-500 bg-card px-3 text-center shadow-inner sm:h-32 sm:w-32">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Net flow
                  </span>
                  <span
                    className={`mt-0.5 w-full whitespace-nowrap text-base font-bold tracking-tight tabular-nums ${
                      netFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-destructive'
                    }`}
                    title={formatCurrency(netFlow)}
                  >
                    {netFlow >= 0 ? '+' : ''}
                    {formatCompactCurrency(netFlow, formatCurrency)}
                  </span>
                </div>
              </div>
              <p className="max-w-32 text-center text-[10px] font-medium leading-tight text-muted-foreground sm:max-w-36">
                {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} this period
              </p>
            </div>

            {/* Income / Expenses rows — mirrors the dashboard widget */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-emerald-500/10 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium leading-tight text-muted-foreground">Income</p>
                  <p
                    className="whitespace-nowrap text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400"
                    title={formatCurrency(totalIncome)}
                  >
                    {formatCompactCurrency(totalIncome, formatCurrency)}
                  </p>
                </div>
                <TrendingUp size={16} className="shrink-0 text-emerald-500" aria-hidden />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-destructive/10 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium leading-tight text-muted-foreground">Expenses</p>
                  <p
                    className="whitespace-nowrap text-sm font-bold tabular-nums text-destructive"
                    title={formatCurrency(totalExpenses)}
                  >
                    {formatCompactCurrency(totalExpenses, formatCurrency)}
                  </p>
                </div>
                <TrendingDown size={16} className="shrink-0 text-red-500" aria-hidden />
              </div>
              {transferCount > 0 && (
                <p className="px-1 text-[10px] font-medium text-muted-foreground">
                  + {transferCount} {transferCount === 1 ? 'transfer' : 'transfers'} between accounts
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-1.5">
        {filteredRecords.map((record) => {
          const stream = streams.find(s => s.id === record.streamId);
          const isIncome = record.type === 'income';
          const isTransfer = record.type === 'transfer';
          const fromAccount = isTransfer
            ? accounts.find((a) => a.id === record.fromAccountId)
            : undefined;
          const iconColor = isTransfer
            ? fromAccount?.color || '#3B82F6'
            : stream?.color || '#6B7280';
          const recordTitle = getRecordTitle(record);
          const typeColor = getTypeColor(record.type);
          const TypeIcon = isTransfer ? ArrowLeftRight : isIncome ? TrendingUp : TrendingDown;
          const dateLabel = new Date(record.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const gradient = isDark
            ? `linear-gradient(95deg, ${iconColor}20 0%, transparent 40%, ${typeColor}18 72%, transparent 100%)`
            : 'none';

          return (
            <div
              key={record.id}
              role="button"
              tabIndex={0}
              onClick={() => setDetailsId(record.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setDetailsId(record.id);
                }
              }}
              className="group relative w-full overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all cursor-pointer hover:border-primary/25 hover:shadow-md active:scale-[0.995] dark:border-border/40 dark:bg-zinc-950/45"
            >
              {isDark && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-70 transition-opacity group-hover:opacity-85"
                  style={{ background: gradient }}
                />
              )}
              <div className="relative flex items-center gap-2.5 px-2.5 py-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md shadow-sm"
                  style={{ backgroundColor: iconColor }}
                >
                  {isTransfer ? (
                    <ArrowLeftRight size={15} style={{ color: '#ffffff' }} />
                  ) : (
                    <IconComponent
                      name={stream?.iconName || 'Circle'}
                      size={15}
                      style={{ color: '#ffffff' }}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {recordTitle}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md"
                        style={{
                        backgroundColor: `${typeColor}${isDark ? '16' : '12'}`,
                          color: typeColor,
                        }}
                        title={isTransfer ? 'Transfer' : isIncome ? 'Incoming' : 'Outgoing'}
                      >
                        <TypeIcon size={11} strokeWidth={2.5} />
                      </span>
                      <p
                        className="text-xs font-bold tabular-nums leading-none"
                        style={{ color: typeColor }}
                      >
                        {isTransfer ? '' : isIncome ? '+' : '−'}
                        {formatCurrency(record.amount)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
                    {record.note || 'No description'}
                    <span className="mx-1 text-border">·</span>
                    {dateLabel}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <EmptyState
            title="No records for this period"
            hint="Use the + button to add one"
          />
        )}
      </div>

      <RecordDetailsModal
        recordId={detailsId}
        onClose={() => setDetailsId(null)}
        onEdit={(id) => {
          setDetailsId(null);
          setEditId(id);
        }}
        onDelete={(id) => {
          setDetailsId(null);
          setDeleteId(id);
        }}
      />

      <AddRecordModal
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        editId={editId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
