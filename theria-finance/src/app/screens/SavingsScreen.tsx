import React, { useState } from 'react';
import { PiggyBank } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Progress } from '../components/ui/progress';

export const SavingsScreen: React.FC = () => {
  const { savings, accounts } = useData();
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Savings Goals
        </h1>
        <p className="text-muted-foreground mt-1">Track your financial targets</p>
      </div>

      {/* Time Filter */}
      <div className="w-full">
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
      </div>

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
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
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
    </div>
  );
};