import React, { useState } from 'react';
import { PiggyBank, Trash2, List, Grid, Square, Edit2 } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { AddSavingsModal } from '../components/AddSavingsModal';

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
  const [editId, setEditId] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Savings Overview Card */}
      <div 
        className="relative bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-4 text-white overflow-hidden transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #ec4899dd, #db277799)'
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
          <PiggyBank size={96} style={{ color: 'white', transform: 'scaleX(-1)' }} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 mb-0.5 text-sm">Total Savings Goals</p>
            <h2 className="text-2xl font-bold mb-0.5">{savings.length}</h2>
            <p className="text-white/70 text-sm">{accounts.length} accounts</p>
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
              className="bg-card border border-border rounded-2xl p-4 space-y-3 transition-shadow cursor-pointer"
              style={{ backgroundColor: `${account?.color || '#6B7280'}12`, borderColor: `${account?.color || '#6B7280'}30` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${account?.color || '#6B7280'}20` }}
                  >
                    <IconComponent
                      name={account?.iconName || 'PiggyBank'}
                      className="text-foreground"
                      size={18}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{account?.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{savingsItem.period} Goal</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-bold text-sm">{formatCurrency(savingsItem.target)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={isComplete ? 'text-primary font-medium' : 'text-foreground'}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className="h-2.5"
                  indicatorClassName="bg-primary"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="font-bold text-sm">{formatCurrency(savingsItem.current)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className={`font-bold ${isComplete ? 'text-primary' : 'text-foreground'}`}>
                    {formatCurrency(Math.max(remaining, 0))}
                  </p>
                </div>
              </div>

              {isComplete && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5">
                  <p className="text-xs text-primary font-medium">
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
                <DialogTitle>Savings Goal Details</DialogTitle>
              </DialogHeader>
              {(() => {
                const goal = savings.find(s => s.id === selectedSavingsId);
                const account = accounts.find(a => a.id === goal?.accountId);
                if (!goal) return null;
                const remaining = goal.target - goal.current;
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                const isComplete = goal.current >= goal.target;
                return (
                  <div className="space-y-4">
                    {/* Account Info */}
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: account?.color || '#6B7280' }}
                      >
                        <IconComponent name={account?.iconName || 'PiggyBank'} size={18} style={{ color: 'white' }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{account?.name || 'Goal'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{goal.period} cadence</p>
                      </div>
                    </div>

                    {/* Progress Status */}
                    {isComplete && (
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <p className="text-sm text-primary font-medium text-center">
                          🎉 Goal achieved! You've reached your savings target!
                        </p>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Target</p>
                        <p className="font-semibold text-foreground">{formatCurrency(goal.target)}</p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Current</p>
                        <p className="font-semibold text-foreground">{formatCurrency(goal.current)}</p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">Progress</p>
                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={percentage}
                          className="h-2"
                          indicatorClassName="bg-primary"
                        />
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                        <p className={`font-semibold ${remaining <= 0 ? 'text-primary' : 'text-foreground'}`}>
                          {formatCurrency(Math.max(remaining, 0))}
                        </p>
                      </div>
                    </div>

                    {/* Note Display */}
                    {goal.note && (
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Note</p>
                        <p className="text-sm text-foreground">{goal.note}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setDeleteId(selectedSavingsId)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Goal
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const goal = savings.find(s => s.id === selectedSavingsId);
                          if (goal) {
                            setEditId(selectedSavingsId);
                            setSelectedSavingsId(null);
                          }
                        }}
                      >
                        <Edit2 size={16} className="mr-2" />
                        Edit Goal
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Savings Modal */}
      <AddSavingsModal
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        editId={editId}
      />

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