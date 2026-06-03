import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { TimeFilter } from '../../../shared/components/TimeFilter';
import { useData } from '../../../core/state/DataContext';
import { useTheme } from '../../../core/state/ThemeContext';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { IconComponent } from '../../../shared/components/IconComponent';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-shrink-0 space-y-4">
        <SimpleModeHint page="records" />
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

        <div
          className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 text-white overflow-hidden transition-all"
          style={{
            background: 'linear-gradient(135deg, #2563ebdd, #1e40af99)',
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-white/20" />
            <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full border-2 border-white/15" />
            <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border-2 border-white/10" />
          </div>

          <div className="absolute -top-6 right-2 w-24 h-24 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
            <TrendingUp size={96} style={{ color: 'white', transform: 'scaleX(-1)' }} />
          </div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-white/80 mb-0.5 text-sm">Net Flow</p>
              <h2 className="text-2xl font-bold mb-0.5">
                {totalIncome - totalExpenses >= 0 ? '+' : ''}
                {formatCurrency(totalIncome - totalExpenses)}
              </h2>
              <p className="text-white/70 text-sm">{filteredRecords.length} records</p>
            </div>

            <div />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp size={12} className="text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-700">{formatCurrency(totalIncome)}</p>
            </div>
          </div>

          <div className="bg-red-500/10 text-red-700 border border-red-200/50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1">
              <TrendingDown size={12} className="text-red-600" />
              <p className="text-sm font-semibold text-red-700">{formatCurrency(totalExpenses)}</p>
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
              className="group relative w-full overflow-hidden rounded-lg border border-border/60 bg-card/60 shadow-sm transition-all cursor-pointer hover:border-border/80 hover:shadow active:scale-[0.995] dark:border-border/40 dark:bg-zinc-950/45"
            >
              {isDark && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-70 transition-opacity group-hover:opacity-85"
                  style={{ background: gradient }}
                />
              )}
              <div className="relative flex items-center gap-2.5 px-2.5 py-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card/50"
                  style={{
                    backgroundColor: isDark ? `${iconColor}16` : `${iconColor}18`,
                  }}
                >
                  {isTransfer ? (
                    <ArrowLeftRight size={15} style={{ color: iconColor }} />
                  ) : (
                    <IconComponent
                      name={stream?.iconName || 'Circle'}
                      size={15}
                      style={{ color: iconColor }}
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
