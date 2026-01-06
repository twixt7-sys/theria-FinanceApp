import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Wallet, BarChart3 } from 'lucide-react';
import type { TimeFilterValue } from '../components/TimeFilter';
import { TimeFilter } from '../components/TimeFilter';
import { useData } from '../contexts/DataContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalysisScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  timeFilter,
  onTimeFilterChange,
  currentDate,
  onNavigateDate,
  showInlineFilter = true,
}) => {
  const { records, streams, accounts, budgets, savings } = useData();
  const [localTimeFilter, setLocalTimeFilter] = useState<TimeFilterValue>('month');

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
        default:
          return true;
      }
    });
  };

  const filteredRecords = getFilteredRecords();

  // 1. User Overview
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const savingsProgress = savings.reduce((sum, s) => sum + (s.current / s.target) * 100, 0) / (savings.length || 1);

  // 2. Expense Analysis
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

  // 3. Income Analysis
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

  // 4. Budget Analysis
  const budgetData = budgets.map(budget => {
    const stream = streams.find(s => s.id === budget.streamId);
    return {
      name: stream?.name || 'Unknown',
      spent: budget.spent,
      limit: budget.limit,
      remaining: budget.limit - budget.spent,
      percentage: (budget.spent / budget.limit) * 100,
    };
  });

  // 5. Records Flow (Timeline)
  const recordsFlow = (() => {
    const groupedByDate: { [key: string]: { income: number; expense: number } } = {};
    
    filteredRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!groupedByDate[date]) {
        groupedByDate[date] = { income: 0, expense: 0 };
      }
      if (record.type === 'income') {
        groupedByDate[date].income += record.amount;
      } else if (record.type === 'expense') {
        groupedByDate[date].expense += record.amount;
      }
    });

    return Object.entries(groupedByDate)
      .map(([date, data]) => ({ date, ...data }))
      .slice(-10);
  })();

  // 6. Account Distribution
  const accountData = accounts.map(acc => ({
    name: acc.name,
    balance: acc.balance,
    color: acc.color,
  })).sort((a, b) => b.balance - a.balance);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Financial Analysis
        </h1>
        <p className="text-muted-foreground mt-1">Comprehensive insights into your finances</p>
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

      {/* 1. User Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="text-primary" size={24} />
          Overview
        </h2>
        
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-primary" size={20} />
              <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
          </div>

          <div className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-primary" size={20} />
              <span className="text-sm font-medium text-muted-foreground">Income</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="bg-destructive/10 backdrop-blur-sm border border-destructive/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="text-destructive" size={20} />
              <span className="text-sm font-medium text-muted-foreground">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className={`${netFlow >= 0 ? 'bg-primary/10 border-primary/30' : 'bg-destructive/10 border-destructive/30'} backdrop-blur-sm border rounded-2xl p-5`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className={netFlow >= 0 ? 'text-primary' : 'text-destructive'} size={20} />
              <span className="text-sm font-medium text-muted-foreground">Net Flow</span>
            </div>
            <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Expense Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingDown className="text-destructive" size={24} />
          Expense Breakdown
        </h2>
        
        <div className="bg-card border border-border rounded-2xl p-6">
          {expenseByStream.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
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

              <div className="mt-4 grid grid-cols-2 gap-3">
                {expenseByStream.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No expense data for this period</p>
          )}
        </div>
      </section>

      {/* 3. Income Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="text-primary" size={24} />
          Income Sources
        </h2>
        
        <div className="bg-card border border-border rounded-2xl p-6">
          {incomeByStream.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incomeByStream}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {incomeByStream.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-bold text-primary">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No income data for this period</p>
          )}
        </div>
      </section>

      {/* 4. Budget Performance */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="text-secondary" size={24} />
          Budget Performance
        </h2>
        
        <div className="bg-card border border-border rounded-2xl p-6">
          {budgetData.length > 0 ? (
            <>
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

              <div className="mt-4 space-y-2">
                {budgetData.map((item) => (
                  <div key={item.name} className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className={`text-sm font-bold ${item.percentage > 100 ? 'text-destructive' : 'text-primary'}`}>
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Spent: {formatCurrency(item.spent)}</span>
                      <span>•</span>
                      <span>Limit: {formatCurrency(item.limit)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No budget data available</p>
          )}
        </div>
      </section>

      {/* 5. Records Flow */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="text-accent" size={24} />
          Transaction Flow
        </h2>
        
        <div className="bg-card border border-border rounded-2xl p-6">
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
            <p className="text-center text-muted-foreground py-8">No transaction data for this period</p>
          )}
        </div>
      </section>

      {/* 6. Account Distribution */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="text-primary" size={24} />
          Account Distribution
        </h2>
        
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountData.map((account) => {
              const percentage = (account.balance / totalBalance) * 100;
              return (
                <div key={account.name} className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{account.name}</span>
                    <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(account.balance)}</p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
