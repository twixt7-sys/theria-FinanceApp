import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Wallet, BarChart3, Sparkles, Activity, CalendarDays } from 'lucide-react';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { TimeFilter } from '../../../shared/components/TimeFilter';
import { useData } from '../../../core/state/DataContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar } from 'recharts';

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
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');

  const activeTimeFilter = timeFilter ?? localTimeFilter;
  const handleTimeChange = onTimeFilterChange ?? setLocalTimeFilter;
  const activeDate = currentDate ?? new Date();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <DollarSign size={14} className="text-primary" />
                </div>
                <p className="text-lg font-bold">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Income</span>
                  <TrendingUp size={14} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Expenses</span>
                  <TrendingDown size={14} className="text-destructive" />
                </div>
                <p className="text-lg font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className={`rounded-2xl border p-3.5 shadow-sm ${netFlow >= 0 ? 'border-primary/30 bg-primary/10' : 'border-destructive/30 bg-destructive/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Net Flow</span>
                  <Activity size={14} className={netFlow >= 0 ? 'text-primary' : 'text-destructive'} />
                </div>
                <p className={`text-lg font-bold ${netFlow >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Savings Rate</p>
                <p className="text-xl font-bold text-primary">{savingsRate.toFixed(1)}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Average Transaction</p>
                <p className="text-xl font-bold">{formatCurrency(avgTransaction)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Records in Period</p>
                <p className="text-xl font-bold">{filteredRecords.length}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-3">Cashflow Trend</h3>
                {recordsFlow.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={cumulativeFlow}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="net" fill="#6366F1" radius={[6, 6, 0, 0]} name="Net per period" />
                      <Line type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2.5} dot={false} name="Cumulative flow" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-6">No transaction data for this period</p>
                )}
              </div>

              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-3">Highlights</h3>
                <div className="space-y-2.5">
                  <div className="rounded-xl p-3 border border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Top Expense Stream</p>
                    <p className="font-semibold">{topExpenseStream?.name || 'No expense yet'}</p>
                    <p className="text-sm text-destructive">{topExpenseStream ? formatCurrency(topExpenseStream.value) : '-'}</p>
                  </div>
                  <div className="rounded-xl p-3 border border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Top Income Stream</p>
                    <p className="font-semibold">{topIncomeStream?.name || 'No income yet'}</p>
                    <p className="text-sm text-emerald-600">{topIncomeStream ? formatCurrency(topIncomeStream.value) : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'expense':
        return (
          <div className="space-y-4">
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-1">Expense Breakdown</h3>
                <p className="text-xs text-muted-foreground mb-3">Where your money is being spent in this period.</p>
                {expenseByStream.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseByStream}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseByStream.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-6">No expense data for this period</p>
                )}
              </div>
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-3">Top Expense Streams</h3>
                <div className="space-y-2">
                  {expenseByStream.slice(0, 6).map((item) => (
                    <div key={item.name} className="rounded-xl p-2.5 border border-border bg-muted/30">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-bold">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-bold mb-3">Expense Flow</h3>
              {recordsFlow.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={recordsFlow}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="#EF444433" strokeWidth={2.5} name="Expense" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-6">No expense data for this period</p>
              )}
            </div>
          </div>
        );

      case 'income':
        return (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-bold mb-1">Income Sources</h3>
              <p className="text-xs text-muted-foreground mb-3">Your strongest earning streams this period.</p>
              {incomeByStream.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={incomeByStream.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-1.5">
                    {incomeByStream.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/20">
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="font-bold text-primary text-sm">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-6">No income data for this period</p>
              )}
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-bold mb-3">Income Flow</h3>
              {recordsFlow.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={recordsFlow}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="income" stroke="#10B981" fill="#10B98133" strokeWidth={2.5} name="Income" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-6">No income data for this period</p>
              )}
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-4">
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-3">Budget Performance</h3>
                {budgetData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="spent" fill="#EF4444" radius={[8, 8, 0, 0]} name="Spent" />
                      <Bar dataKey="limit" fill="#10B981" radius={[8, 8, 0, 0]} name="Limit" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-6">No budget data available</p>
                )}
              </div>
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-3">Budget Health Radar</h3>
                {budgetRadarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={budgetRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="stream" />
                      <PolarRadiusAxis domain={[0, 160]} tick={false} />
                      <Radar name="Usage %" dataKey="usage" stroke="#F97316" fill="#F97316" fillOpacity={0.3} />
                      <Radar name="Target %" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-6">No budget data available</p>
                )}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              {budgetData.length > 0 ? (
                <>
                  <div className="mt-3 space-y-1.5">
                    {budgetData.map((item) => (
                      <div
                        key={item.name}
                        className="p-2.5 rounded-xl border border-border shadow-sm"
                        style={{ backgroundColor: `${item.color}12`, borderColor: `${item.color}30` }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className={`text-xs font-bold ${item.percentage > 100 ? 'text-destructive' : 'text-primary'}`}>
                            {item.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>Spent: {formatCurrency(item.spent)}</span>
                          <span>•</span>
                          <span>Limit: {formatCurrency(item.limit)}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={item.percentage > 100 ? 'h-full bg-destructive' : 'h-full bg-primary'}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-6">No budget data available</p>
              )}
            </div>
          </div>
        );

      case 'savings':
        return (
          <div className="space-y-4">
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-3">Savings Completion</h3>
                {savingsOverview.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart
                      innerRadius="25%"
                      outerRadius="95%"
                      data={savingsOverview.slice(0, 5).map((s) => ({
                        name: s.name,
                        value: s.percentage,
                        fill: s.color,
                      }))}
                    >
                      <RadialBar dataKey="value" cornerRadius={8} background />
                      <Legend />
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-6">No savings goals available</p>
                )}
              </div>
              <div className="lg:col-span-3 grid gap-3">
                {savingsOverview.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-2xl p-4 shadow-sm"
                    style={{ backgroundColor: `${item.color}12`, borderColor: `${item.color}30` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <span className="text-xs font-bold text-primary">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-xs">{formatCurrency(item.current)} / {formatCurrency(item.target)}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Remaining: {formatCurrency(item.remaining)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {savings.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No savings goals available</p>
            )}
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-4">
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-3">Account Distribution</h3>
                {accountDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={accountDistribution} dataKey="balance" nameKey="name" innerRadius={70} outerRadius={105}>
                        {accountDistribution.map((entry, index) => (
                          <Cell key={`acc-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-6">No account data available</p>
                )}
              </div>
              <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-bold mb-3">Balance Ranking</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart layout="vertical" data={accountDistribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={90} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="balance" radius={[0, 8, 8, 0]}>
                      {accountDistribution.map((entry, index) => (
                        <Cell key={`acc-bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accountDistribution.map((account) => (
                  <div key={account.name} className="p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm">{account.name}</span>
                      <span className="text-xs text-muted-foreground">{account.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-lg font-bold text-amber-500">{formatCurrency(account.balance)}</p>
                    <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${Math.min(account.percentage, 100)}%`, backgroundColor: account.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-64">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-card to-secondary/10 p-4 shadow-sm">
        <div className="absolute -top-10 -right-6 w-28 h-28 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Financial Insights</p>
              <h2 className="text-lg font-bold flex items-center gap-1.5">
                Smart Analysis
                <Sparkles size={14} className="text-primary" />
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current period</p>
              <p className="text-sm font-semibold flex items-center gap-1 justify-end">
                <CalendarDays size={13} />
                {activeTimeFilter}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-card/80 border border-border p-2.5">
              <p className="text-[11px] text-muted-foreground">Income</p>
              <p className="text-sm font-bold text-emerald-600 truncate">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="rounded-xl bg-card/80 border border-border p-2.5">
              <p className="text-[11px] text-muted-foreground">Expense</p>
              <p className="text-sm font-bold text-destructive truncate">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="rounded-xl bg-card/80 border border-border p-2.5">
              <p className="text-[11px] text-muted-foreground">Net</p>
              <p className={`text-sm font-bold truncate ${netFlow >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {tabMeta.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === tab.id
                ? `${tab.activeClass} border-transparent shadow-sm`
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Time Filter */}
      {showInlineFilter && (
        <TimeFilter
          value={activeTimeFilter}
          onChange={handleTimeChange}
          currentDate={activeDate}
          onNavigateDate={onNavigateDate}
        />
      )}

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};
