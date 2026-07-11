import React, { useEffect, useState } from 'react';
import { Reorder } from 'motion/react';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  GripVertical,
  PiggyBank,
  Plus,
  Settings2,
  SlidersHorizontal,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Waves,
  X,
} from 'lucide-react';
import { SimpleModeHint } from '../../shared/components/SimpleModeHint';
import { FinanceBuddy, type BuddyMood } from '../../shared/components/FinanceBuddy';
import {
  QuickActionsCarousel,
  type QuickAction,
} from '../../shared/components/QuickActionsCarousel';
import { formatTimeRangeDisplay, getTimeFilterLabel } from '../../shared/lib/timeRangeDisplay';
import {
  isDividerId,
  readSimpleDashboardLayout,
  writeSimpleDashboardLayout,
  type SimpleDashboardLayoutId,
  type SimpleDashboardWidgetId,
} from '../../core/lib/simpleDashboardLayoutStorage';
import type { TimeFilterValue } from '../../shared/components/TimeFilter';
import { useData, type Record as FinanceRecord, type Stream } from '../../core/state/DataContext';

interface SpendingCategorySummary {
  id: string;
  name: string;
  total: number;
  color: string;
}

interface SimpleDashboardProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  formatCurrency: (amount: number) => string;
  timeFilter: TimeFilterValue;
  currentDate: Date;
  onOpenTimeFilter?: () => void;
  records?: FinanceRecord[];
  streams?: Stream[];
  topSpending?: SpendingCategorySummary[];
  topIncome?: SpendingCategorySummary[];
  onNavigate?: (screen: string) => void;
  onQuickAddRecord?: (type: 'income' | 'expense' | 'transfer') => void;
}

const WIDGET_INFO: Record<SimpleDashboardWidgetId, { title: string; description: string }> = {
  buddy: { title: 'Terry the money buddy', description: 'Friendly tips about your money' },
  balance: { title: 'Balance & totals', description: 'Your balance, money in, out and left over' },
  quickActions: { title: 'Quick actions', description: 'Shortcuts for the things you do most' },
  spending: { title: 'Where your money went', description: 'Your top spending categories' },
  incomeSources: { title: 'Where it came from', description: 'Your top income sources' },
  activity: { title: 'Latest activity', description: 'Your most recent records' },
  budgets: { title: 'Budget check', description: 'How your budgets are holding up' },
  savings: { title: 'Savings goals', description: 'Progress toward your goals' },
  accounts: { title: 'My accounts', description: 'Your accounts at a glance' },
};

const widgetTitle = (id: SimpleDashboardLayoutId) =>
  isDividerId(id) ? 'Divider' : WIDGET_INFO[id as SimpleDashboardWidgetId].title;

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  totalBalance,
  totalIncome,
  totalExpenses,
  netFlow,
  formatCurrency,
  timeFilter,
  currentDate,
  onOpenTimeFilter,
  records = [],
  streams = [],
  topSpending = [],
  topIncome = [],
  onNavigate,
  onQuickAddRecord,
}) => {
  const { budgets, savings, accounts } = useData();
  const [layout, setLayout] = useState<SimpleDashboardLayoutId[]>(() =>
    readSimpleDashboardLayout(),
  );
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    writeSimpleDashboardLayout(layout);
  }, [layout]);

  const formattedBalance = formatCurrency(totalBalance);
  const balanceTextClass =
    formattedBalance.length > 12
      ? 'text-[13px]'
      : formattedBalance.length > 9
        ? 'text-base'
        : 'text-xl';

  const flows = [
    {
      label: 'Money in',
      value: totalIncome,
      icon: TrendingUp,
      className: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Money out',
      value: totalExpenses,
      icon: TrendingDown,
      className: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  const leftOverPositive = netFlow >= 0;
  const leftOverText = 'text-blue-600 dark:text-blue-400';
  const leftOverBg = 'bg-blue-500/10';

  const hasActivity = records.length > 0;
  const periodLabel = getTimeFilterLabel(timeFilter).toLowerCase();

  const buddyMood: BuddyMood = !hasActivity ? 'neutral' : netFlow >= 0 ? 'happy' : 'concerned';

  const buddyLines: string[] = [];
  if (!hasActivity) {
    buddyLines.push(
      `Nothing logged for ${periodLabel} yet. Tap the + button and I'll keep track for you!`,
    );
  } else if (netFlow > 0) {
    buddyLines.push(`You kept ${formatCurrency(netFlow)} ${periodLabel}. That's how it's done!`);
  } else if (netFlow === 0) {
    buddyLines.push(`Perfectly balanced — money in matched money out ${periodLabel}.`);
  } else {
    buddyLines.push(
      `Heads up — you spent ${formatCurrency(Math.abs(netFlow))} more than you made ${periodLabel}. Let's ease up a little.`,
    );
  }
  if (topSpending[0] && totalExpenses > 0) {
    const share = Math.round((topSpending[0].total / totalExpenses) * 100);
    buddyLines.push(
      `Most of your spending went to ${topSpending[0].name} — about ${share}% of it.`,
    );
  }
  buddyLines.push(`Your total balance sits at ${formattedBalance}. I'm keeping an eye on it!`);
  buddyLines.push('Tip: logging records right after you spend keeps everything accurate.');

  const quickActions: QuickAction[] = [];
  if (onQuickAddRecord) {
    quickActions.push(
      {
        id: 'add-income',
        label: 'Money in',
        icon: TrendingUp,
        circleClass: 'bg-emerald-500 shadow-md shadow-emerald-500/30',
        iconClass: 'text-white',
        onClick: () => onQuickAddRecord('income'),
      },
      {
        id: 'add-expense',
        label: 'Money out',
        icon: TrendingDown,
        circleClass: 'bg-rose-500 shadow-md shadow-rose-500/30',
        iconClass: 'text-white',
        onClick: () => onQuickAddRecord('expense'),
      },
      {
        id: 'add-transfer',
        label: 'Transfer',
        icon: ArrowLeftRight,
        circleClass: 'bg-blue-500 shadow-md shadow-blue-500/30',
        iconClass: 'text-white',
        onClick: () => onQuickAddRecord('transfer'),
      },
    );
  }
  if (onNavigate) {
    quickActions.push(
      {
        id: 'go-records',
        label: 'Records',
        icon: FileText,
        circleClass: 'bg-violet-500 shadow-md shadow-violet-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('records'),
      },
      {
        id: 'go-analysis',
        label: 'Analysis',
        icon: BarChart3,
        circleClass: 'bg-cyan-500 shadow-md shadow-cyan-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('analysis'),
      },
      {
        id: 'go-activity',
        label: 'Activity',
        icon: Clock,
        circleClass: 'bg-sky-500 shadow-md shadow-sky-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('activity'),
      },
      {
        id: 'go-accounts',
        label: 'Accounts',
        icon: Wallet,
        circleClass: 'bg-amber-500 shadow-md shadow-amber-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('accounts'),
      },
      {
        id: 'go-savings',
        label: 'Savings',
        icon: PiggyBank,
        circleClass: 'bg-pink-500 shadow-md shadow-pink-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('savings'),
      },
      {
        id: 'go-budget',
        label: 'Budget',
        icon: Target,
        circleClass: 'bg-indigo-500 shadow-md shadow-indigo-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('budget'),
      },
      {
        id: 'go-streams',
        label: 'Streams',
        icon: Waves,
        circleClass: 'bg-teal-500 shadow-md shadow-teal-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('streams'),
      },
      {
        id: 'go-categories',
        label: 'Categories',
        icon: FolderOpen,
        circleClass: 'bg-orange-500 shadow-md shadow-orange-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('categories'),
      },
      {
        id: 'go-notifications',
        label: 'Notifs',
        icon: Bell,
        circleClass: 'bg-fuchsia-500 shadow-md shadow-fuchsia-500/30',
        iconClass: 'text-white',
        onClick: () => onNavigate('notifications'),
      },
    );
  }

  const recordVisuals = (record: FinanceRecord) => {
    switch (record.type) {
      case 'income':
        return {
          icon: TrendingUp,
          className: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10',
          amount: `+${formatCurrency(record.amount)}`,
        };
      case 'expense':
        return {
          icon: TrendingDown,
          className: 'text-destructive',
          bg: 'bg-destructive/10',
          amount: `-${formatCurrency(record.amount)}`,
        };
      case 'transfer':
        return {
          icon: ArrowLeftRight,
          className: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10',
          amount: formatCurrency(record.amount),
        };
      default:
        return {
          icon: SlidersHorizontal,
          className: 'text-muted-foreground',
          bg: 'bg-muted/60',
          amount: formatCurrency(record.amount),
        };
    }
  };

  const recordName = (record: FinanceRecord) => {
    const stream = streams.find((s) => s.id === record.streamId);
    if (stream?.name) return stream.name;
    if (record.type === 'transfer') return 'Transfer';
    if (record.type === 'alter') return 'Balance adjustment';
    return record.note || 'Record';
  };

  const recentRecords = [...records]
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 4);

  const spendingRows = topSpending.slice(0, 3);
  const spendingMax = Math.max(...spendingRows.map((c) => c.total), 1);

  const renderBalanceWidget = () => (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-slate-100 p-4 shadow-sm dark:bg-slate-800/60 sm:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl"
      />

      <div className="relative flex items-center gap-4 sm:gap-5">
        <div className="shrink-0 rounded-full border border-border/40 bg-card/40 p-1.5 shadow-sm transition-transform duration-300 hover:scale-[1.03] active:scale-95">
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[6px] border-primary bg-card px-3 text-center shadow-inner sm:h-32 sm:w-32">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Balance
            </span>
            <span
              className={`mt-0.5 w-full break-words font-bold tracking-tight tabular-nums text-foreground ${balanceTextClass}`}
            >
              {formattedBalance}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <button
            type="button"
            onClick={onOpenTimeFilter}
            disabled={!onOpenTimeFilter}
            className="group flex w-full items-center justify-between gap-2 rounded-xl bg-card/70 px-3 py-2 shadow-sm transition-colors hover:bg-primary/10 active:scale-[0.98] disabled:pointer-events-none"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {getTimeFilterLabel(timeFilter)}
            </span>
            <span className="flex min-w-0 items-center gap-1 text-xs font-semibold tabular-nums text-foreground">
              <span className="truncate">{formatTimeRangeDisplay(timeFilter, currentDate)}</span>
              {onOpenTimeFilter && (
                <ChevronDown
                  size={12}
                  strokeWidth={2.5}
                  className="shrink-0 text-primary transition-transform duration-200 group-hover:translate-y-0.5"
                />
              )}
            </span>
          </button>

          <div className="flex min-w-0 items-stretch gap-2.5">
            <div className="flex min-w-0 flex-[1.35] flex-col justify-center gap-2.5">
              {flows.map((flow) => {
                const Icon = flow.icon;
                return (
                  <div
                    key={flow.label}
                    className={`group flex flex-1 items-center gap-2.5 rounded-2xl px-3 py-2.5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${flow.bg}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card/80 shadow-sm transition-transform duration-200 group-hover:scale-110 ${flow.className}`}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium leading-tight text-muted-foreground">
                        {flow.label}
                      </p>
                      <p className={`truncate text-sm font-bold tabular-nums ${flow.className}`}>
                        {formatCurrency(flow.value)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${leftOverBg}`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-card/80 shadow-sm ${leftOverText}`}
              >
                <PiggyBank size={18} strokeWidth={2} />
              </span>
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">
                Left over
              </p>
              <p className={`w-full truncate text-sm font-bold tabular-nums ${leftOverText}`}>
                {leftOverPositive ? '+' : ''}
                {formatCurrency(netFlow)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpendingWidget = () => (
    <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Where your money went</p>
        {totalExpenses > 0 && (
          <p className="text-xs font-semibold tabular-nums text-muted-foreground">
            {formatCurrency(totalExpenses)}
          </p>
        )}
      </div>

      {spendingRows.length > 0 ? (
        <div className="mt-3 space-y-3">
          {spendingRows.map((cat) => {
            const share = totalExpenses > 0 ? cat.total / totalExpenses : 0;
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate text-[13px] text-foreground">{cat.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {Math.round(share * 100)}%
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${Math.max((cat.total / spendingMax) * 100, 4)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          No spending recorded for this period.
        </p>
      )}
    </div>
  );

  const renderActivityWidget = () => (
    <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Latest activity</p>
        {onNavigate && hasActivity && (
          <button
            type="button"
            onClick={() => onNavigate('records')}
            className="group flex shrink-0 items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            See all
            <ChevronRight
              size={13}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>
        )}
      </div>

      {recentRecords.length > 0 ? (
        <div className="mt-2 divide-y divide-border/40">
          {recentRecords.map((record) => {
            const visuals = recordVisuals(record);
            const Icon = visuals.icon;
            return (
              <div key={record.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${visuals.bg} ${visuals.className}`}
                >
                  <Icon size={16} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {recordName(record)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-[13px] font-semibold tabular-nums ${visuals.className}`}
                >
                  {visuals.amount}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          Records you add will show up here.
        </p>
      )}
    </div>
  );

  const sectionHeader = (title: string, screen?: string, linkLabel = 'See all') => (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {onNavigate && screen && (
        <button
          type="button"
          onClick={() => onNavigate(screen)}
          className="group flex shrink-0 items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          {linkLabel}
          <ChevronRight
            size={13}
            strokeWidth={2.5}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      )}
    </div>
  );

  const renderIncomeSourcesWidget = () => {
    const rows = topIncome.slice(0, 3);
    const rowMax = Math.max(...rows.map((c) => c.total), 1);
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">Where it came from</p>
          {totalIncome > 0 && (
            <p className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </p>
          )}
        </div>
        {rows.length > 0 ? (
          <div className="mt-3 space-y-3">
            {rows.map((cat) => {
              const share = totalIncome > 0 ? cat.total / totalIncome : 0;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate text-[13px] text-foreground">{cat.name}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {Math.round(share * 100)}%
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${Math.max((cat.total / rowMax) * 100, 4)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-muted-foreground">
            No income recorded for this period.
          </p>
        )}
      </div>
    );
  };

  const renderBudgetsWidget = () => {
    const rows = budgets.slice(0, 3);
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
        {sectionHeader('Budget check', 'budget', 'Manage')}
        {rows.length > 0 ? (
          <div className="mt-3 space-y-3">
            {rows.map((budget) => {
              const pct = budget.limit > 0 ? budget.spent / budget.limit : 0;
              const over = budget.spent > budget.limit;
              return (
                <div key={budget.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] text-foreground">{budget.name}</span>
                    <span
                      className={`shrink-0 text-[12px] font-semibold tabular-nums ${
                        over ? 'text-destructive' : 'text-muted-foreground'
                      }`}
                    >
                      {over
                        ? `Over by ${formatCurrency(budget.spent - budget.limit)}`
                        : `${formatCurrency(Math.max(budget.limit - budget.spent, 0))} left`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${
                        over ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(Math.max(pct * 100, 3), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-muted-foreground">
            No budgets yet. Set one up to keep spending in check.
          </p>
        )}
      </div>
    );
  };

  const renderSavingsWidget = () => {
    const rows = savings.slice(0, 3);
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
        {sectionHeader('Savings goals', 'savings')}
        {rows.length > 0 ? (
          <div className="mt-3 space-y-3">
            {rows.map((goal) => {
              const pct = goal.target > 0 ? Math.min(goal.current / goal.target, 1) : 0;
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] text-foreground">{goal.name}</span>
                    <span className="shrink-0 text-[12px] font-semibold tabular-nums text-muted-foreground">
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${Math.max(pct * 100, 3)}%`,
                        backgroundColor: goal.color || 'var(--primary)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-muted-foreground">
            No savings goals yet. Start one and watch it grow.
          </p>
        )}
      </div>
    );
  };

  const renderAccountsWidget = () => {
    const rows = accounts.slice(0, 4);
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
        {sectionHeader('My accounts', 'accounts')}
        {rows.length > 0 ? (
          <div className="mt-2 divide-y divide-border/40">
            {rows.map((account) => (
              <div key={account.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${account.color}1A` }}
                >
                  <Wallet size={16} strokeWidth={2} style={{ color: account.color }} />
                </span>
                <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                  {account.name}
                </p>
                <p className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-muted-foreground">
            No accounts yet. Add one to start tracking.
          </p>
        )}
      </div>
    );
  };

  const renderDivider = () => (
    <div className="flex items-center gap-3 px-2 py-1" aria-hidden>
      <span className="h-px flex-1 bg-border/70" />
      <span className="h-1.5 w-1.5 rounded-full bg-border" />
      <span className="h-px flex-1 bg-border/70" />
    </div>
  );

  const renderWidget = (id: SimpleDashboardLayoutId) => {
    if (isDividerId(id)) return renderDivider();
    switch (id as SimpleDashboardWidgetId) {
      case 'buddy':
        return <FinanceBuddy lines={buddyLines} mood={buddyMood} />;
      case 'balance':
        return renderBalanceWidget();
      case 'quickActions':
        return <QuickActionsCarousel actions={quickActions} />;
      case 'spending':
        return renderSpendingWidget();
      case 'incomeSources':
        return renderIncomeSourcesWidget();
      case 'activity':
        return renderActivityWidget();
      case 'budgets':
        return renderBudgetsWidget();
      case 'savings':
        return renderSavingsWidget();
      case 'accounts':
        return renderAccountsWidget();
      default:
        return null;
    }
  };

  const availableWidgets = (
    Object.keys(WIDGET_INFO) as SimpleDashboardWidgetId[]
  ).filter((id) => !layout.includes(id));

  const removeWidget = (id: SimpleDashboardLayoutId) => {
    setLayout((prev) => prev.filter((w) => w !== id));
  };

  const addWidget = (id: SimpleDashboardWidgetId) => {
    setLayout((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const addDivider = () => {
    setLayout((prev) => [...prev, `divider-${Date.now()}`]);
  };

  return (
    <div className="space-y-4">
      <SimpleModeHint page="dashboard" />

      {editing ? (
        <>
          <p className="text-center text-[11px] text-muted-foreground">
            Drag cards to reorder them. Tap ✕ to remove one.
          </p>
          <Reorder.Group
            axis="y"
            values={layout}
            onReorder={(next) => setLayout(next as SimpleDashboardLayoutId[])}
            className="space-y-3"
          >
            {layout.map((id) => (
              <Reorder.Item
                key={id}
                value={id}
                whileDrag={{ scale: 1.02 }}
                className="cursor-grab rounded-[26px] border border-dashed border-primary/40 bg-card/60 p-2 shadow-sm active:cursor-grabbing"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2 px-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <GripVertical size={14} className="text-primary" />
                    {widgetTitle(id)}
                  </span>
                  {id !== 'balance' && (
                    <button
                      type="button"
                      onClick={() => removeWidget(id)}
                      aria-label={`Remove ${widgetTitle(id)}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
                <div className="pointer-events-none opacity-80">{renderWidget(id)}</div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-3.5">
            <p className="text-xs font-semibold text-foreground">Add widgets</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableWidgets.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => addWidget(id)}
                  title={WIDGET_INFO[id].description}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  <Plus size={13} strokeWidth={2.5} className="text-primary" />
                  {WIDGET_INFO[id].title}
                </button>
              ))}
              <button
                type="button"
                onClick={addDivider}
                title="A line to separate sections — add as many as you like"
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <Plus size={13} strokeWidth={2.5} className="text-primary" />
                Divider
              </button>
            </div>
          </div>
        </>
      ) : (
        layout.map((id) => <div key={id}>{renderWidget(id)}</div>)
      )}

      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            editing
              ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
              : 'border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground'
          }`}
        >
          {editing ? (
            <>
              <Check size={13} strokeWidth={2.5} />
              Done
            </>
          ) : (
            <>
              <Settings2 size={13} strokeWidth={2} />
              Customize
            </>
          )}
        </button>
      </div>
    </div>
  );
};
