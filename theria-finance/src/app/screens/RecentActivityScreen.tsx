import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';

interface RecentActivityScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

export const RecentActivityScreen: React.FC<RecentActivityScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = true,
}) => {
  const { records, streams, accounts } = useData();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());

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

  const filterRecordsByDate = () => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const now = activeCurrentDate;
      
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
    });
  };

  const filteredRecords = filterRecordsByDate()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalIncome = filteredRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = filteredRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const getRecordIcon = (record: typeof records[0]) => {
    switch (record.type) {
      case 'income':
        return <ArrowDownRight size={20} className="text-income" />;
      case 'expense':
        return <ArrowUpRight size={20} className="text-expense" />;
      case 'transfer':
        return <RefreshCw size={20} className="text-primary" />;
      default:
        return <RefreshCw size={20} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Time Filter */}
      {showInlineFilter && (
        <div className="flex items-center justify-start">
          <TimeFilter
            value={activeTimeFilter}
            onChange={handleTimeChange}
            currentDate={activeCurrentDate}
            onNavigateDate={handleNavigateDate}
          />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowDownRight className="text-income" size={20} />
            </div>
            <span className="font-semibold text-muted-foreground">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ArrowUpRight className="text-expense" size={20} />
            </div>
            <span className="font-semibold text-muted-foreground">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <RefreshCw className="text-accent" size={20} />
            </div>
            <span className="font-semibold text-muted-foreground">Net Flow</span>
          </div>
          <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold">Activity History</h3>
          <p className="text-sm text-muted-foreground">{filteredRecords.length} transactions found</p>
        </div>

        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No activity found for this period</p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const stream = streams.find(s => s.id === record.streamId);
              const isIncome = record.type === 'income';
              const isExpense = record.type === 'expense';
              const fromAccount = accounts.find(a => a.id === record.fromAccountId);
              const toAccount = accounts.find(a => a.id === record.toAccountId);
              
              return (
                <div
                  key={record.id}
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: `${stream?.color || '#6B7280'}20` }}
                    >
                      <IconComponent
                        name={stream?.iconName || 'Circle'}
                        style={{ color: stream?.color || '#6B7280' }}
                        size={20}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getRecordIcon(record)}
                        <p className="font-semibold truncate">{stream?.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {record.note || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {fromAccount && (
                          <span className="text-xs text-muted-foreground">
                            From: {fromAccount.name}
                          </span>
                        )}
                        {toAccount && (
                          <span className="text-xs text-muted-foreground">
                            To: {toAccount.name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        isIncome ? 'text-income' : isExpense ? 'text-expense' : 'text-foreground'
                      }`}>
                        {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(record.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.date)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
