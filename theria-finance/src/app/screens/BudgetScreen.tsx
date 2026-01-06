import React, { useState } from 'react';
import { Target } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Progress } from '../components/ui/progress';

interface BudgetScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = true,
}) => {
  const { budgets, streams } = useData();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
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
      <div className="grid gap-4">
        {budgets.map((budget) => {
          const stream = streams.find(s => s.id === budget.streamId);
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const isOverBudget = budget.spent > budget.limit;
          const remaining = budget.limit - budget.spent;

          return (
            <div
              key={budget.id}
              className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stream?.color || '#6B7280'}20` }}
                  >
                    <IconComponent
                      name={stream?.iconName || 'Target'}
                      className="text-foreground"
                      size={20}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">{stream?.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Limit</p>
                  <p className="font-bold">{formatCurrency(budget.limit)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={isOverBudget ? 'text-destructive font-medium' : 'text-foreground'}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className="h-3"
                  indicatorClassName={isOverBudget ? 'bg-destructive' : 'bg-primary'}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="font-bold">{formatCurrency(budget.spent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`font-bold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </p>
                </div>
              </div>

              {isOverBudget && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Over budget by {formatCurrency(Math.abs(remaining))}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <Target size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold mb-2">No Budgets Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first budget to track spending</p>
          </div>
        )}
      </div>
    </div>
  );
};