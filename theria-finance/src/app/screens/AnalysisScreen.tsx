import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Wallet, BarChart3 } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NavFilterBar } from '../components/NavFilterBar';

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

  // Filter records based on time period
  const getFilteredRecords = () => {
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
  };

  const filteredRecords = getFilteredRecords();

  // Data calculations
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netFlow = totalIncome - totalExpenses;

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Top Left: Total Balance */}
              <div className="relative bg-blue-600 rounded-2xl p-4 text-white shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <DollarSign size={18} strokeWidth={2.5} />
                    <span className="text-xs font-medium text-white/90">Total Balance</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
                </div>
              </div>
              
              {/* Top Right: Net Flow */}
              <div className={`relative ${netFlow >= 0 ? 'bg-emerald-600' : 'bg-red-600'} rounded-2xl p-4 text-white shadow-xl overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <BarChart3 size={18} strokeWidth={2.5} />
                    <span className="text-xs font-medium text-white/90">Net Flow</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
                  </p>
                </div>
              </div>
              
              {/* Bottom Left: Income */}
              <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="text-primary" size={18} />
                  <span className="text-xs font-medium text-muted-foreground">Income</span>
                </div>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
              </div>
              
              {/* Bottom Right: Expenses */}
              <div className="bg-destructive/10 backdrop-blur-sm border border-destructive/30 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingDown className="text-destructive" size={18} />
                  <span className="text-xs font-medium text-muted-foreground">Expenses</span>
                </div>
                <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-bold mb-3">Transaction Flow</h3>
              {recordsFlow.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recordsFlow}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} name="Expense" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-6">No transaction data for this period</p>
              )}
            </div>
          </div>
        );

      case 'expense':
        return (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-bold mb-3">Expense Breakdown</h3>
              {expenseByStream.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={expenseByStream}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseByStream.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {expenseByStream.slice(0, 4).map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-medium">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-6">No expense data for this period</p>
              )}
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-bold mb-3">Expense Flow</h3>
              {recordsFlow.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={recordsFlow}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} name="Expense" />
                  </LineChart>
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
              <h3 className="text-base font-bold mb-3">Income Sources</h3>
              {incomeByStream.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={incomeByStream}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={recordsFlow}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} name="Income" />
                  </LineChart>
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
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-bold mb-3">Budget Performance</h3>
              {budgetData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={230}>
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
            <div className="grid gap-4">
              {savings.map((savingsItem) => {
                const account = accounts.find(a => a.id === savingsItem.accountId);
                const percentage = Math.min((savingsItem.current / savingsItem.target) * 100, 100);
                return (
                  <div
                    key={savingsItem.id}
                    className="bg-card border border-border rounded-2xl p-4 shadow-sm"
                    style={{ backgroundColor: `${account?.color || '#6B7280'}12`, borderColor: `${account?.color || '#6B7280'}30` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm">{account?.name}</h3>
                      <span className="text-xs font-bold text-primary">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-xs">{formatCurrency(savingsItem.current)} / {formatCurrency(savingsItem.target)}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {savings.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No savings goals available</p>
              )}
            </div>
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-base font-bold mb-3">Account Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accountData.map((account) => {
                  const percentage = (account.balance / totalBalance) * 100;
                  return (
                    <div key={account.name} className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm">{account.name}</span>
                        <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <p className="text-lg font-bold text-amber-500">{formatCurrency(account.balance)}</p>
                      <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-700"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-card border border-border p-0.5 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex-1 justify-center ${
              activeTab === 'overview' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <BarChart3 size={14} />
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex-1 justify-center ${
              activeTab === 'accounts' ? 'bg-amber-700 text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Wallet size={14} />
          </button>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex-1 justify-center ${
              activeTab === 'income' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <TrendingUp size={14} />
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex-1 justify-center ${
              activeTab === 'expense' ? 'bg-destructive text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <TrendingDown size={14} />
          </button>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex-1 justify-center ${
              activeTab === 'budget' ? 'bg-orange-300 text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Target size={14} />
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex-1 justify-center ${
              activeTab === 'savings' ? 'bg-pink-500 text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <PiggyBank size={14} />
          </button>
        </div>
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
