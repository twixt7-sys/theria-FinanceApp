import React, { useState } from 'react';
import { Target, Trash2 } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

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
  const { budgets, streams, deleteBudget } = useData();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Total Budget Card */}
      <div className="relative bg-[#FFB347] rounded-2xl p-6 text-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} strokeWidth={2.5} />
            <span className="text-sm font-medium text-white/90">Total Budget</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">{formatCurrency(totalBudget)}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/70 mb-1">Spent</p>
              <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-white/70 mb-1">Remaining</p>
              <p className={`text-xl font-bold ${totalRemaining >= 0 ? '' : 'text-red-200'}`}>
                {formatCurrency(Math.abs(totalRemaining))}
              </p>
            </div>
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
      <div className="grid gap-4">
        {budgets.map((budget) => {
          const stream = streams.find(s => s.id === budget.streamId);
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const isOverBudget = budget.spent > budget.limit;
          const remaining = budget.limit - budget.spent;

          return (
            <div
              key={budget.id}
              onClick={() => setSelectedBudgetId(budget.id)}
              className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              style={{ backgroundColor: `${stream?.color || '#6B7280'}12`, borderColor: `${stream?.color || '#6B7280'}30` }}
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

      {/* Details Dialog */}
      <Dialog open={!!selectedBudgetId} onOpenChange={() => setSelectedBudgetId(null)}>
        <DialogContent className="max-w-md">
          {selectedBudgetId && (
            <>
              <DialogHeader>
                <DialogTitle>Budget details</DialogTitle>
              </DialogHeader>
              {(() => {
                const budget = budgets.find(b => b.id === selectedBudgetId);
                const stream = streams.find(s => s.id === budget?.streamId);
                if (!budget) return null;
                const remaining = budget.limit - budget.spent;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stream?.color || '#6B7280'}22` }}
                      >
                        <IconComponent name={stream?.iconName || 'Target'} size={18} />
                      </div>
                      <div>
                        <p className="font-semibold">{stream?.name || 'Budget'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{budget.period} period</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-muted-foreground">Limit</p>
                        <p className="font-semibold">{formatCurrency(budget.limit)}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-muted-foreground">Spent</p>
                        <p className="font-semibold">{formatCurrency(budget.spent)}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3 col-span-2">
                        <p className="text-muted-foreground">Remaining</p>
                        <p className={`font-semibold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>
                          {formatCurrency(Math.abs(remaining))}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setDeleteId(selectedBudgetId)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete budget
                    </Button>
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

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