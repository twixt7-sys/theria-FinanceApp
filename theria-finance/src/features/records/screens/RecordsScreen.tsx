import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowLeftRight, List, Grid, Square } from 'lucide-react';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { TimeFilter } from '../../../shared/components/TimeFilter';
import { useData } from '../../../core/state/DataContext';
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
  const { records, streams, deleteRecord } = useData();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');
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

  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="space-y-4 flex-shrink-0">
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

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                  viewLayout === 'list'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                }`}
                title="List View"
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewLayout('small')}
                className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                  viewLayout === 'small'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                }`}
                title="Small Card View"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewLayout('full')}
                className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                  viewLayout === 'full'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                }`}
                title="Full Card View"
              >
                <Square size={15} />
              </button>
            </div>
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

      <div className="flex-1 overflow-y-auto space-y-2 mt-4">
        {filteredRecords.map((record) => {
          const stream = streams.find(s => s.id === record.streamId);
          const isIncome = record.type === 'income';
          const isTransfer = record.type === 'transfer';
          const leftIconBg = isTransfer ? '#3B82F6' : (stream?.color || '#6B7280');

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
              className={`rounded-2xl p-3 pr-4 flex items-center gap-3 transition-all group cursor-pointer active:scale-[0.99] ${
                isIncome
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/25'
                  : isTransfer
                    ? 'bg-blue-500/20 hover:bg-blue-500/25'
                    : 'bg-red-500/20 hover:bg-red-500/25'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: leftIconBg }}
              >
                {isTransfer ? (
                  <ArrowLeftRight size={18} className="text-white" />
                ) : (
                  <IconComponent
                    name={stream?.iconName || 'Circle'}
                    style={{ color: 'white' }}
                    size={18}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate text-xs">{stream?.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {record.note || 'No description'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p
                      className={`font-bold text-base ${
                        isIncome
                          ? 'text-primary'
                          : isTransfer
                            ? 'text-blue-500'
                            : 'text-destructive'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                      {formatCurrency(record.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.type === 'transfer'
                        ? 'Transfer'
                        : isIncome
                          ? 'Incoming'
                          : 'Outgoing'}
                    </p>
                  </div>
                  {isIncome ? (
                    <TrendingUp size={18} className="text-primary" />
                  ) : isTransfer ? (
                    <ArrowLeftRight size={18} className="text-blue-500" />
                  ) : (
                    <TrendingDown size={18} className="text-destructive" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No records for this period</p>
            <p className="text-sm mt-1">Use the + button to add one</p>
          </div>
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
