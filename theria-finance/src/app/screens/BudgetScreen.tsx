import React, { useState } from 'react';
import { Target, Trash2, List, Grid, Square } from 'lucide-react';
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
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  return (
    <div className="space-y-4">
      {/* Budget Overview Card */}
      <div 
        className="relative bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-white overflow-hidden transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #fb923cdd, #f9731699)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-white/20"></div>
          <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full border-2 border-white/15"></div>
          <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border-2 border-white/10"></div>
        </div>
        
        {/* Background icon */}
        <div className="absolute -top-6 right-2 w-24 h-24 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
          <Target size={96} style={{ color: 'white', transform: 'scaleX(-1)' }} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 mb-0.5 text-sm">Total Budget</p>
            <h2 className="text-2xl font-bold mb-0.5">{formatCurrency(totalBudget)}</h2>
            <p className="text-white/70 text-sm">{budgets.length} budgets</p>
          </div>
          
          {/* Layout Selection Buttons */}
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
              className="bg-card border border-border rounded-2xl p-4 space-y-3 transition-shadow cursor-pointer"
              style={{ backgroundColor: `${stream?.color || '#6B7280'}12`, borderColor: `${stream?.color || '#6B7280'}30` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stream?.color || '#6B7280'}20` }}
                  >
                    <IconComponent
                      name={stream?.iconName || 'Target'}
                      className="text-foreground"
                      size={18}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{stream?.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Limit</p>
                  <p className="font-bold text-sm">{formatCurrency(budget.limit)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={isOverBudget ? 'text-destructive font-medium' : 'text-foreground'}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className="h-2.5"
                  indicatorClassName={isOverBudget ? 'bg-destructive' : 'bg-primary'}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="font-bold text-sm">{formatCurrency(budget.spent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className={`font-bold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </p>
                </div>
              </div>

              {isOverBudget && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-2.5">
                  <p className="text-xs text-destructive font-medium">
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