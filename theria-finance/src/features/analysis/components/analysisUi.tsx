import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../shared/components/ui/utils';
import { EmptyState } from '../../../shared/components/EmptyState';

export const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--card))',
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
};

export const chartGridStroke = 'hsl(var(--border) / 0.35)';

export function MetricCard({
  label,
  value,
  icon,
  tone = 'neutral',
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'neutral' | 'income' | 'expense' | 'primary' | 'balance';
  className?: string;
}) {
  const tones = {
    neutral: 'border-border/60 bg-card',
    income: 'border-emerald-500/25 bg-emerald-500/8',
    expense: 'border-destructive/25 bg-destructive/8',
    primary: 'border-primary/25 bg-primary/8',
    balance: 'border-amber-500/25 bg-amber-500/8',
  };
  const valueTones = {
    neutral: 'text-foreground',
    income: 'text-emerald-600 dark:text-emerald-400',
    expense: 'text-destructive',
    primary: 'text-primary',
    balance: 'text-amber-600 dark:text-amber-400',
  };

  return (
    <div className={cn('rounded-2xl border p-3.5 sm:p-4', tones[tone], className)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/60 shrink-0">
          {icon}
        </span>
      </div>
      <p className={cn('text-xl sm:text-2xl font-bold tracking-tight tabular-nums', valueTones[tone])}>
        {value}
      </p>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  heightClass = 'h-[240px] sm:h-[300px] lg:h-[320px]',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  heightClass?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/15 overflow-hidden',
        className,
      )}
    >
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-border/40">
        <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className={cn('w-full px-1 sm:px-2 pb-3 pt-1', heightClass)}>{children}</div>
    </div>
  );
}

export function InsightTile({
  label,
  title,
  value,
  valueClassName,
}: {
  label: string;
  title: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/25 p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-semibold text-sm text-foreground truncate">{title}</p>
      <p className={cn('text-sm font-bold mt-1 tabular-nums', valueClassName)}>{value}</p>
    </div>
  );
}

export function EmptyChart({
  message,
  hint = 'Try a different time period or add data with +',
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center px-4">
      <EmptyState title={message} hint={hint} className="py-8" />
    </div>
  );
}

type TabItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
};

export function AnalysisTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="relative -mx-1">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible sm:gap-2">
        {tabs.map((tab) => {
          const active = activeId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'snap-start shrink-0 flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold border transition-all sm:shrink',
                active
                  ? `${tab.activeClass} border-transparent shadow-md`
                  : 'bg-card/80 text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground',
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AnalysisHero({
  periodLabel,
  totalIncome,
  totalExpenses,
  netFlow,
  savingsRate,
  recordCount,
  formatCurrency,
}: {
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  savingsRate: number;
  recordCount: number;
  formatCurrency: (n: number) => string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-emerald-800" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />

      <div className="relative z-10 p-5 sm:p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/70">
              Financial insights
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Analysis dashboard</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
              {periodLabel}
            </span>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] text-white/70 mb-0.5">Net flow</p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
              {netFlow >= 0 ? '+' : ''}
              {formatCurrency(netFlow)}
            </p>
            <p className="text-[11px] text-white/75 mt-1">
              {savingsRate.toFixed(1)}% savings rate · {recordCount} records
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Income', value: formatCurrency(totalIncome), className: 'text-emerald-200' },
            { label: 'Expenses', value: formatCurrency(totalExpenses), className: 'text-red-200' },
            {
              label: 'Balance trend',
              value: netFlow >= 0 ? 'Positive' : 'Negative',
              className: netFlow >= 0 ? 'text-white' : 'text-red-200',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-2.5 sm:px-3 backdrop-blur-sm"
            >
              <p className="text-[10px] text-white/65">{item.label}</p>
              <p className={cn('text-xs sm:text-sm font-bold truncate tabular-nums', item.className)}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TabPanel({ tabKey, children }: { tabKey: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-4 sm:space-y-5 lg:space-y-6"
    >
      {children}
    </motion.div>
  );
}
