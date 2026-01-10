import React, { useState } from 'react';
import { PiggyBank, Trash2 } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

interface SavingsScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

export const SavingsScreen: React.FC<SavingsScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = true,
}) => {
  const { savings, accounts, deleteSavings } = useData();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [selectedSavingsId, setSelectedSavingsId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalTarget = savings.reduce((sum, s) => sum + s.target, 0);
  const totalCurrent = savings.reduce((sum, s) => sum + s.current, 0);
  const totalRemaining = totalTarget - totalCurrent;
  const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Total Savings Card */}
      <div className="relative bg-[#FF69B4] rounded-2xl p-6 text-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank size={20} strokeWidth={2.5} />
            <span className="text-sm font-medium text-white/90">Total Savings Goal</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">{formatCurrency(totalTarget)}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/70 mb-1">Saved</p>
              <p className="text-xl font-bold">{formatCurrency(totalCurrent)}</p>
            </div>
            <div>
              <p className="text-xs text-white/70 mb-1">Progress</p>
              <p className="text-xl font-bold">{totalProgress.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.min(totalProgress, 100)}%` }}
            />
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

      {/* Savings Cards */}
      <div className="grid gap-4">
        {savings.map((savingsItem) => {
          const account = accounts.find(a => a.id === savingsItem.accountId);
          const percentage = Math.min((savingsItem.current / savingsItem.target) * 100, 100);
          const isComplete = savingsItem.current >= savingsItem.target;
          const remaining = savingsItem.target - savingsItem.current;

          return (
            <div
              key={savingsItem.id}
              onClick={() => setSelectedSavingsId(savingsItem.id)}
              className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              style={{ backgroundColor: `${account?.color || '#6B7280'}12`, borderColor: `${account?.color || '#6B7280'}30` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account?.color || '#6B7280'}20` }}
                  >
                    <IconComponent
                      name={account?.iconName || 'PiggyBank'}
                      className="text-foreground"
                      size={20}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">{account?.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{savingsItem.period} Goal</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="font-bold">{formatCurrency(savingsItem.target)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={isComplete ? 'text-primary font-medium' : 'text-foreground'}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className="h-3"
                  indicatorClassName="bg-primary"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="font-bold">{formatCurrency(savingsItem.current)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`font-bold ${isComplete ? 'text-primary' : 'text-foreground'}`}>
                    {formatCurrency(Math.max(remaining, 0))}
                  </p>
                </div>
              </div>

              {isComplete && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                  <p className="text-sm text-primary font-medium">
                    🎉 Goal achieved! You've reached your savings target!
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {savings.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <PiggyBank size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold mb-2">No Savings Goals Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first savings goal to start tracking</p>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedSavingsId} onOpenChange={() => setSelectedSavingsId(null)}>
        <DialogContent className="max-w-md">
          {selectedSavingsId && (
            <>
              <DialogHeader>
                <DialogTitle>Savings goal</DialogTitle>
              </DialogHeader>
              {(() => {
                const goal = savings.find(s => s.id === selectedSavingsId);
                const account = accounts.find(a => a.id === goal?.accountId);
                if (!goal) return null;
                const remaining = goal.target - goal.current;
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${account?.color || '#6B7280'}22` }}
                      >
                        <IconComponent name={account?.iconName || 'PiggyBank'} size={18} />
                      </div>
                      <div>
                        <p className="font-semibold">{account?.name || 'Goal'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{goal.period} cadence</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="border border-border rounded-lg p-3">
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-semibold">{formatCurrency(goal.target)}</p>
                      </div>
                      <div className="border border-border rounded-lg p-3">
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-semibold">{formatCurrency(goal.current)}</p>
                      </div>
                      <div className="border border-border rounded-lg p-3 col-span-2">
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-semibold">{percentage.toFixed(1)}%</p>
                      </div>
                      <div className="border border-border rounded-lg p-3 col-span-2">
                        <p className="text-muted-foreground">Remaining</p>
                        <p className={`font-semibold ${remaining <= 0 ? 'text-primary' : 'text-foreground'}`}>
                          {formatCurrency(Math.max(remaining, 0))}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setDeleteId(selectedSavingsId)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete goal
                    </Button>
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete savings goal</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteSavings(deleteId);
                }
                setDeleteId(null);
                setSelectedSavingsId(null);
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