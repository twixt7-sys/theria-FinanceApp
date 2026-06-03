import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { SimpleModeHint } from '../../shared/components/SimpleModeHint';
import { DashboardTimeRange } from '../../shared/components/DashboardTimeRange';
import type { TimeFilterValue } from '../../shared/components/TimeFilter';

interface SimpleDashboardProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  formatCurrency: (amount: number) => string;
  timeFilter: TimeFilterValue;
  currentDate: Date;
  onOpenTimeFilter?: () => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  totalBalance,
  totalIncome,
  totalExpenses,
  netFlow,
  formatCurrency,
  timeFilter,
  currentDate,
  onOpenTimeFilter,
}) => {
  const rows = [
    {
      label: 'Money in',
      value: totalIncome,
      icon: ArrowDownLeft,
      className: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/8',
    },
    {
      label: 'Money out',
      value: totalExpenses,
      icon: ArrowUpRight,
      className: 'text-destructive',
      bg: 'bg-destructive/8',
    },
    {
      label: 'Left over',
      value: netFlow,
      icon: Wallet,
      className: netFlow >= 0 ? 'text-primary' : 'text-destructive',
      bg: netFlow >= 0 ? 'bg-primary/8' : 'bg-destructive/8',
    },
  ];

  return (
    <div className="space-y-4">
      <SimpleModeHint page="dashboard" />

      <DashboardTimeRange
        timeFilter={timeFilter}
        currentDate={currentDate}
        onChangeClick={onOpenTimeFilter}
      />

      <div className="rounded-2xl border border-border/50 bg-card px-5 py-6 text-center">
        <p className="text-sm text-muted-foreground">Your balance</p>
        <p className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-foreground">
          {formatCurrency(totalBalance)}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">Totals below are for this period</p>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden divide-y divide-border/40">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${row.bg}`}>
                  <Icon size={16} className={row.className} />
                </span>
                <span className="text-sm text-muted-foreground">{row.label}</span>
              </div>
              <span className={`text-sm font-semibold tabular-nums shrink-0 ${row.className}`}>
                {row.label === 'Left over' && netFlow >= 0 ? '+' : ''}
                {formatCurrency(row.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
