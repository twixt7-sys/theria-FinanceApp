import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Wallet, BarChart3, Activity } from 'lucide-react';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { TimeFilter } from '../../../shared/components/TimeFilter';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { formatAccountCurrency } from '../../../shared/lib/currencies';
import {
  AnalysisHero,
  AnalysisTabs,
  ChartCard,
  EmptyChart,
  InsightTile,
  MetricCard,
  TabPanel,
  chartGridStroke,
  chartTooltipStyle,
} from '../components/analysisUi';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { useSimpleMode } from '../../../core/state/SimpleModeContext';
import { BarChart, Bar, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar } from 'recharts';

const PERIOD_LABELS: Record<TimeFilterValue, string> = {
  day: 'Today',
  week: 'This week',
  month: 'This month',
  quarter: 'This quarter',
  year: 'This year',
  custom: 'Custom range',
};

interface AnalysisScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

type AnalysisTab = 'overview' | 'expense' | 'income' | 'budget' | 'savings' | 'accounts';

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = true,
}) => {
  const { records, streams, accounts, budgets, savings } = useData();
  const { mainCurrency } = useCurrency();
  const { simpleMode } = useSimpleMode();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;
  const activeDate = currentDate ?? new Date();

  const formatCurrency = (amount: number) => formatAccountCurrency(amount, mainCurrency);

  const chartTooltip = { contentStyle: chartTooltipStyle, formatter: (v: number) => formatCurrency(v) };
  const chartGrid = { strokeDasharray: '3 3', stroke: chartGridStroke, vertical: false };

  const filteredRecords = useMemo(() => {
    const now = activeDate;
    return records.filter(r => {
      const recordDate = new Date(r.date);
      switch (activeTimeFilter) {
        case 'day':
          return recordDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return recordDate >= weekAgo;
        case 'month':
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          const recordQuarter = Math.floor(recordDate.getMonth() / 3);
          return recordQuarter === quarter && recordDate.getFullYear() === now.getFullYear();
        case 'year':
          return recordDate.getFullYear() === now.getFullYear();
        case 'custom': {
          const customRange = sessionStorage.getItem('customDateRange');
          if (customRange) {
            try {
              const { startDate, endDate } = JSON.parse(customRange);
              const start = new Date(startDate);
              const end = new Date(endDate);
              return recordDate >= start && recordDate <= end;
            } catch (e) {
              return true;
            }
          }
          return true;
        }
        default:
          return true;
      }
    });
  }, [records, activeDate, activeTimeFilter]);

  // Data calculations
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (Math.max(netFlow, 0) / totalIncome) * 100 : 0;
  const avgTransaction = filteredRecords.length > 0
    ? filteredRecords.reduce((sum, r) => sum + r.amount, 0) / filteredRecords.length
    : 0;

  const expenseByStream = streams
    .filter(s => s.type === 'expense' && !s.isSystem)
    .map(stream => {
      const amount = filteredRecords
        .filter(r => r.streamId === stream.id && r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);
      return { name: stream.name, value: amount, color: stream.color };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const incomeByStream = streams
    .filter(s => s.type === 'income' && !s.isSystem)
    .map(stream => {
      const amount = filteredRecords
        .filter(r => r.streamId === stream.id && r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);
      return { name: stream.name, value: amount, color: stream.color };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const budgetData = budgets.map(budget => {
    const stream = streams.find(s => s.id === budget.streamId);
    
    // Calculate spent amount based on filtered records for time-aware budget tracking
    const spentInPeriod = filteredRecords
      .filter(r => r.streamId === budget.streamId && r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    
    return {
      name: stream?.name || 'Unknown',
      spent: spentInPeriod,
      limit: budget.limit,
      remaining: budget.limit - spentInPeriod,
      percentage: (spentInPeriod / budget.limit) * 100,
      color: stream?.color || '#6B7280',
    };
  });

  const recordsFlow = (() => {
    const groupedByDate: { [key: string]: { income: number; expense: number; timestamp: number } } = {};
    
    filteredRecords.forEach(record => {
      let date: string;
      const recordDate = new Date(record.date);
      
      // Format date based on time filter for better granularity
      switch (activeTimeFilter) {
        case 'day':
          // Show hours for day view
          date = recordDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          break;
        case 'week':
          // Show day names for week view
          date = recordDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          break;
        case 'month':
          // Show days for month view
          date = recordDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'quarter':
          // Show weeks for quarter view
          const weekOfMonth = Math.ceil(recordDate.getDate() / 7);
          date = `Week ${weekOfMonth}`;
          break;
        case 'year':
          // Show months for year view
          date = recordDate.toLocaleDateString('en-US', { month: 'short' });
          break;
        default:
          date = recordDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = { income: 0, expense: 0, timestamp: recordDate.getTime() };
      }
      if (record.type === 'income') {
        groupedByDate[date].income += record.amount;
      } else if (record.type === 'expense') {
        groupedByDate[date].expense += record.amount;
      }
    });

    // Sort by timestamp and limit data points based on time filter
    const sortedData = Object.entries(groupedByDate)
      .map(([date, data]) => ({ date, income: data.income, expense: data.expense }))
      .sort((a, b) => {
        const timestampA = groupedByDate[a.date].timestamp;
        const timestampB = groupedByDate[b.date].timestamp;
        return timestampA - timestampB;
      });

    // Limit data points for better readability
    switch (activeTimeFilter) {
      case 'day':
        return sortedData.slice(-24); // Last 24 hours
      case 'week':
        return sortedData.slice(-7); // Last 7 days
      case 'month':
        return sortedData.slice(-31); // Last 31 days
      case 'quarter':
        return sortedData.slice(-12); // Last 12 weeks
      case 'year':
        return sortedData.slice(-12); // Last 12 months
      default:
        return sortedData.slice(-10);
    }
  })();

  const accountData = accounts.map(acc => ({
    name: acc.name,
    balance: acc.balance,
    color: acc.color,
  })).sort((a, b) => b.balance - a.balance);

  const cumulativeFlow = useMemo(() => {
    let running = 0;
    return recordsFlow.map((item) => {
      running += item.income - item.expense;
      return { ...item, net: item.income - item.expense, cumulative: running };
    });
  }, [recordsFlow]);

  const budgetRadarData = budgetData
    .slice(0, 6)
    .map((item) => ({
      stream: item.name,
      usage: Number.isFinite(item.percentage) ? Math.min(Math.max(item.percentage, 0), 160) : 0,
      target: 100,
    }));

  const savingsOverview = savings.map((s) => {
    const account = accounts.find((a) => a.id === s.accountId);
    const percentage = s.target > 0 ? Math.min((s.current / s.target) * 100, 100) : 0;
    return {
      id: s.id,
      name: account?.name || 'Unknown',
      current: s.current,
      target: s.target,
      remaining: Math.max(s.target - s.current, 0),
      percentage,
      color: account?.color || '#6B7280',
    };
  });

  const accountDistribution = accountData.map((item) => ({
    ...item,
    percentage: totalBalance > 0 ? (item.balance / totalBalance) * 100 : 0,
  }));

  const topExpenseStream = expenseByStream[0];
  const topIncomeStream = incomeByStream[0];

  const tabMeta: Array<{ id: AnalysisTab; label: string; icon: React.ReactNode; activeClass: string }> = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} />, activeClass: 'bg-primary text-white' },
    { id: 'accounts', label: 'Accounts', icon: <Wallet size={14} />, activeClass: 'bg-amber-600 text-white' },
    { id: 'income', label: 'Income', icon: <TrendingUp size={14} />, activeClass: 'bg-emerald-600 text-white' },
    { id: 'expense', label: 'Expense', icon: <TrendingDown size={14} />, activeClass: 'bg-destructive text-white' },
    { id: 'budget', label: 'Budget', icon: <Target size={14} />, activeClass: 'bg-orange-500 text-white' },
    { id: 'savings', label: 'Savings', icon: <PiggyBank size={14} />, activeClass: 'bg-fuchsia-600 text-white' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <TabPanel tabKey="overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard label="Balance" value={formatCurrency(totalBalance)} icon={<DollarSign size={16} className="text-amber-600" />} tone="balance" />
              <MetricCard label="Income" value={formatCurrency(totalIncome)} icon={<TrendingUp size={16} className="text-emerald-600" />} tone="income" />
              <MetricCard label="Expenses" value={formatCurrency(totalExpenses)} icon={<TrendingDown size={16} className="text-destructive" />} tone="expense" />
              <MetricCard
                label="Net flow"
                value={`${netFlow >= 0 ? '+' : ''}${formatCurrency(netFlow)}`}
                icon={<Activity size={16} className={netFlow >= 0 ? 'text-primary' : 'text-destructive'} />}
                tone={netFlow >= 0 ? 'primary' : 'expense'}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Savings rate" value={`${savingsRate.toFixed(1)}%`} icon={<Target size={16} className="text-primary" />} tone="primary" />
              <MetricCard label="Avg transaction" value={formatCurrency(avgTransaction)} icon={<BarChart3 size={16} className="text-muted-foreground" />} />
              <MetricCard label="Records" value={String(filteredRecords.length)} icon={<Activity size={16} className="text-muted-foreground" />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5">
              <ChartCard
                title="Cashflow trend"
                subtitle="Net per period and cumulative balance movement"
                className="xl:col-span-8"
                heightClass="h-[260px] sm:h-[320px] lg:h-[360px]"
              >
                {recordsFlow.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cumulativeFlow}>
                      <CartesianGrid {...chartGrid} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} width={56} />
                      <Tooltip {...chartTooltip} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="net" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Net" opacity={0.85} />
                      <Line type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2.5} dot={false} name="Cumulative" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No transaction data for this period" />
                )}
              </ChartCard>

              <div className="xl:col-span-4 space-y-3">
                <ChartCard title="Highlights" subtitle="Top movers this period" heightClass="h-auto min-h-0">
                  <div className="space-y-2.5 px-3 pb-3">
                    <InsightTile
                      label="Top expense"
                      title={topExpenseStream?.name || 'No expense yet'}
                      value={topExpenseStream ? formatCurrency(topExpenseStream.value) : '-'}
                      valueClassName="text-destructive"
                    />
                    <InsightTile
                      label="Top income"
                      title={topIncomeStream?.name || 'No income yet'}
                      value={topIncomeStream ? formatCurrency(topIncomeStream.value) : '-'}
                      valueClassName="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </ChartCard>
              </div>
            </div>
          </TabPanel>
        );

      case 'expense':
        return (
          <TabPanel tabKey="expense">
            <MetricCard
              className="max-w-md"
              label="Total expenses"
              value={formatCurrency(totalExpenses)}
              icon={<TrendingDown size={16} className="text-destructive" />}
              tone="expense"
            />
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5">
              <ChartCard title="Expense breakdown" subtitle="Share by stream" className="xl:col-span-7">
                {expenseByStream.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseByStream} cx="50%" cy="50%" innerRadius="58%" outerRadius="82%" paddingAngle={3} dataKey="value">
                        {expenseByStream.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip {...chartTooltip} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No expense data for this period" />
                )}
              </ChartCard>
              <ChartCard title="Top streams" subtitle="Ranked by spend" className="xl:col-span-5" heightClass="h-auto min-h-[240px]">
                <div className="space-y-2 px-3 pb-3 max-h-[300px] overflow-y-auto">
                  {expenseByStream.slice(0, 8).map((item) => (
                    <div key={item.name} className="rounded-xl p-2.5 border border-border/50 bg-muted/20">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium truncate pr-2">{item.name}</span>
                        <span className="font-bold tabular-nums shrink-0">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
            <ChartCard title="Expense flow" subtitle="Spending over time">
              {recordsFlow.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recordsFlow}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={56} />
                    <Tooltip {...chartTooltip} />
                    <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="#EF444422" strokeWidth={2} name="Expense" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No expense flow for this period" />
              )}
            </ChartCard>
          </TabPanel>
        );

      case 'income':
        return (
          <TabPanel tabKey="income">
            <MetricCard
              className="max-w-md"
              label="Total income"
              value={formatCurrency(totalIncome)}
              icon={<TrendingUp size={16} className="text-emerald-600" />}
              tone="income"
            />
            <ChartCard title="Income sources" subtitle="Earnings by stream">
              {incomeByStream.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeByStream.slice(0, 8)}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={52} />
                    <YAxis tick={{ fontSize: 11 }} width={56} />
                    <Tooltip {...chartTooltip} />
                    <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} name="Income" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No income data for this period" />
              )}
            </ChartCard>
            {incomeByStream.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {incomeByStream.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                    <span className="font-medium text-sm truncate pr-2">{item.name}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums shrink-0">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <ChartCard title="Income flow" subtitle="Earnings over time">
              {recordsFlow.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recordsFlow}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={56} />
                    <Tooltip {...chartTooltip} />
                    <Area type="monotone" dataKey="income" stroke="#10B981" fill="#10B98122" strokeWidth={2} name="Income" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No income flow for this period" />
              )}
            </ChartCard>
          </TabPanel>
        );

      case 'budget':
        return (
          <TabPanel tabKey="budget">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5">
              <ChartCard title="Budget performance" subtitle="Spent vs limit" className="xl:col-span-7">
                {budgetData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                      <CartesianGrid {...chartGrid} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11 }} width={56} />
                      <Tooltip {...chartTooltip} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="spent" fill="#EF4444" radius={[6, 6, 0, 0]} name="Spent" />
                      <Bar dataKey="limit" fill="#10B981" radius={[6, 6, 0, 0]} name="Limit" opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No budget data available" />
                )}
              </ChartCard>
              <ChartCard title="Budget health" subtitle="Usage vs target" className="xl:col-span-5">
                {budgetRadarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={budgetRadarData}>
                      <PolarGrid stroke={chartGridStroke} />
                      <PolarAngleAxis dataKey="stream" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 160]} tick={false} />
                      <Radar name="Usage %" dataKey="usage" stroke="#F97316" fill="#F97316" fillOpacity={0.35} />
                      <Radar name="Target %" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.12} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No budget data available" />
                )}
              </ChartCard>
            </div>
            {budgetData.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {budgetData.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border p-3.5"
                    style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}35` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{item.name}</span>
                      <span className={`text-xs font-bold ${item.percentage > 100 ? 'text-destructive' : 'text-primary'}`}>
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(item.spent)} of {formatCurrency(item.limit)}
                    </p>
                    <div className="mt-2.5 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.percentage > 100 ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabPanel>
        );

      case 'savings':
        return (
          <TabPanel tabKey="savings">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5">
              <ChartCard title="Goal completion" subtitle="Progress by account" className="xl:col-span-5">
                {savingsOverview.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="28%"
                      outerRadius="95%"
                      data={savingsOverview.slice(0, 5).map((s) => ({
                        name: s.name,
                        value: s.percentage,
                        fill: s.color,
                      }))}
                    >
                      <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'hsl(var(--muted))' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `${v.toFixed(1)}%`} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No savings goals available" />
                )}
              </ChartCard>
              <div className="xl:col-span-7 grid gap-3 sm:grid-cols-2">
                {savingsOverview.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border p-4"
                    style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}35` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <span className="text-xs font-bold text-primary">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatCurrency(item.current)} / {formatCurrency(item.target)}
                    </p>
                    <div className="mt-3 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">Remaining {formatCurrency(item.remaining)}</p>
                  </div>
                ))}
              </div>
            </div>
            {savings.length === 0 && <EmptyChart message="No savings goals available" />}
          </TabPanel>
        );

      case 'accounts':
        return (
          <TabPanel tabKey="accounts">
            <MetricCard
              className="max-w-md"
              label="Total balance"
              value={formatCurrency(totalBalance)}
              icon={<Wallet size={16} className="text-amber-600" />}
              tone="balance"
            />
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5">
              <ChartCard title="Distribution" subtitle="Balance share" className="xl:col-span-5">
                {accountDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={accountDistribution} dataKey="balance" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>
                        {accountDistribution.map((entry, index) => (
                          <Cell key={`acc-cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip {...chartTooltip} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No account data available" />
                )}
              </ChartCard>
              <ChartCard title="Balance ranking" subtitle="Accounts by value" className="xl:col-span-7">
                {accountDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={accountDistribution} margin={{ left: 4, right: 12 }}>
                      <CartesianGrid {...chartGrid} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" width={72} tick={{ fontSize: 10 }} />
                      <Tooltip {...chartTooltip} />
                      <Bar dataKey="balance" radius={[0, 8, 8, 0]}>
                        {accountDistribution.map((entry, index) => (
                          <Cell key={`acc-bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No account data available" />
                )}
              </ChartCard>
            </div>
            {accountDistribution.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {accountDistribution.map((account) => (
                  <div key={account.name} className="rounded-2xl border border-border/50 bg-muted/20 p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm truncate pr-2">{account.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{account.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {formatCurrency(account.balance)}
                    </p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(account.percentage, 100)}%`, backgroundColor: account.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabPanel>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-64 max-w-7xl mx-auto w-full">
      <SimpleModeHint page="analysis" />

      {simpleMode ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Income" value={formatCurrency(totalIncome)} icon={<TrendingUp size={16} className="text-emerald-600" />} tone="income" />
          <MetricCard label="Expenses" value={formatCurrency(totalExpenses)} icon={<TrendingDown size={16} className="text-destructive" />} tone="expense" />
          <MetricCard
            label="Net flow"
            value={`${netFlow >= 0 ? '+' : ''}${formatCurrency(netFlow)}`}
            icon={<Activity size={16} className={netFlow >= 0 ? 'text-primary' : 'text-destructive'} />}
            tone={netFlow >= 0 ? 'primary' : 'expense'}
          />
          <MetricCard label="Balance" value={formatCurrency(totalBalance)} icon={<DollarSign size={16} className="text-amber-600" />} tone="balance" />
        </div>
      ) : (
        <>
      <AnalysisHero
        periodLabel={PERIOD_LABELS[activeTimeFilter]}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netFlow={netFlow}
        savingsRate={savingsRate}
        recordCount={filteredRecords.length}
        formatCurrency={formatCurrency}
      />

      <AnalysisTabs tabs={tabMeta} activeId={activeTab} onChange={(id) => setActiveTab(id as AnalysisTab)} />

      {showInlineFilter && (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-2 sm:p-3">
          <TimeFilter
            value={activeTimeFilter}
            onChange={handleTimeChange}
            currentDate={activeDate}
            onNavigateDate={onNavigateDate}
          />
        </div>
      )}

      {renderTabContent()}
        </>
      )}
    </div>
  );
};
