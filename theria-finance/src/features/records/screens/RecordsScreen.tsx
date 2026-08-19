import React, { useEffect, useMemo, useState } from 'react';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { CategoryManager } from '../../../shared/components/categories/CategoryManager';
import { TerryPanel } from '../../../features/terry/TerryPanel';
import { buildRecordsTerry } from '../../../features/terry/terryLines';
import { RecordDetailsModal } from '../components/RecordDetailsModal';
import { AddRecordModal } from '../components/AddRecordModal';
import { RecordTimeline } from '../components/RecordTimeline';
import { RecordsToolbar, nextTimeScope, type RecordsTab } from '../components/RecordsToolbar';
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
  /** Opens/closes the shell's time filter panel. */
  onToggleFilter?: () => void;
  /** Whether the shell's time-filter panel is open — also expands the
   *  Categories tab's icon-filter bar. */
  filterOpen?: boolean;
}

/**
 * Records opens on the day view. The scope itself is shared app state, so this
 * only claims it the first time Records is opened — coming back later keeps
 * whatever scope the user picked in the meantime.
 */
let dayScopeApplied = false;

export const RecordsScreen: React.FC<RecordsScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  onToggleFilter,
  filterOpen = false,
}) => {
  const { records, streams, accounts, deleteRecord } = useData();
  const [activeTab, setActiveTab] = useState<RecordsTab>('records');
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('day');
  const [localCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const activeCurrentDate = currentDate ?? localCurrentDate;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;

  useEffect(() => {
    if (dayScopeApplied) return;
    dayScopeApplied = true;
    handleTimeChange('day');
    // Claiming the default is a mount-time action, not a reaction to changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRecordTitle = React.useCallback(
    (record: (typeof records)[number]) => {
      if (record.type === 'transfer') {
        const fromName =
          accounts.find((a) => a.id === record.fromAccountId)?.name || 'Unknown account';
        const toName =
          accounts.find((a) => a.id === record.toAccountId)?.name || 'Unknown account';
        return `${fromName} → ${toName}`;
      }
      const stream = streams.find((s) => s.id === record.streamId);
      return stream?.name || 'Unknown';
    },
    [accounts, streams],
  );

  const filteredRecords = useMemo(() => {
    const now = activeCurrentDate;
    const query = searchQuery.trim().toLowerCase();

    return records
      .filter((r) => {
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
      })
      .filter((r) => {
        if (!query) return true;
        return (
          getRecordTitle(r).toLowerCase().includes(query) ||
          (r.note || '').toLowerCase().includes(query) ||
          String(r.amount).includes(query)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
        // The timeline reads by clock, so time of day orders a shared date.
        if ((a.time || '') !== (b.time || '')) {
          return (b.time || '').localeCompare(a.time || '');
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [records, activeTimeFilter, activeCurrentDate, searchQuery, getRecordTitle]);

  const handleDelete = () => {
    if (deleteId) {
      deleteRecord(deleteId);
      setDeleteId(null);
      setDetailsId(null);
    }
  };

  const { formatMoney: formatCurrency } = useCurrency();

  const incomeRecords = filteredRecords.filter((r) => r.type === 'income');
  const expenseRecords = filteredRecords.filter((r) => r.type === 'expense');
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenseRecords.reduce((sum, r) => sum + r.amount, 0);
  const netFlow = totalIncome - totalExpenses;

  // The scope button just steps one unit coarser — it no longer opens the
  // shell's time filter panel, which now has its own dedicated toggle.
  const handleStepTimeScope = () => {
    handleTimeChange(nextTimeScope(activeTimeFilter));
  };

  // Terry reads the period's cashflow
  const terry = buildRecordsTerry({
    count: filteredRecords.length,
    netFlow,
    income: totalIncome,
    expenses: totalExpenses,
    money: formatCurrency,
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-shrink-0 space-y-4">
        <SimpleModeHint page="records" />

        {/* Terry reads the cashflow */}
        <TerryPanel content={terry} />

        {activeTab !== 'categories' && (
          <RecordsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            timeScope={activeTimeFilter}
            onStepTimeScope={handleStepTimeScope}
            income={totalIncome}
            net={netFlow}
            expense={totalExpenses}
            incomeCount={incomeRecords.length}
            expenseCount={expenseRecords.length}
            recordCount={filteredRecords.length}
            filterOpen={!!filterOpen}
            onToggleFilter={() => onToggleFilter?.()}
            activeTab={activeTab}
            onToggleTab={() => setActiveTab(activeTab === 'records' ? 'categories' : 'records')}
          />
        )}
      </div>

      {activeTab === 'categories' ? (
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <CategoryManager scope="record" filterOpen={filterOpen} />
        </div>
      ) : (
        /* pr-3 gives the timeline's right-edge badge room to bleed into —
            overflow-y-auto here implicitly clips the x axis too, so without
            it the badge would be cut off flush against this container's edge. */
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-3">
          <RecordTimeline
            records={filteredRecords}
            scope={activeTimeFilter}
            onSelect={setDetailsId}
          />

          {filteredRecords.length === 0 && (
            <EmptyState
              title={searchQuery.trim() ? 'No records match your search' : 'No records for this period'}
              hint={searchQuery.trim() ? 'Try a different word or amount' : 'Use the + button to add one'}
            />
          )}
        </div>
      )}

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
