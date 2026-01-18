import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { IconComponent } from '../components/IconComponent';
import { AnalysisScreen } from './AnalysisScreen';
import type { TimeFilterValue } from '../components/TimeFilter';

interface Post {
  id: string;
  type: 'milestone' | 'achievement' | 'insight' | 'activity';
  title: string;
  description: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  color: string;
}

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  timeFilter = 'month',
  onTimeFilterChange,
  currentDate = new Date(),
  onNavigateDate,
}) => {
  const { accounts, records, streams, budgets, savings, categories } = useData();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'newsfeed' | 'analysis'>('dashboard');
  const [showAnalysisFilter, setShowAnalysisFilter] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const getFilteredRecords = () => {
    const now = currentDate;
    return records.filter(r => {
      const recordDate = new Date(r.date);
      switch (timeFilter) {
        case 'day':
          return recordDate.toDateString() === now.toDateString();
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return recordDate >= weekStart && recordDate <= weekEnd;
        }
        case 'month':
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        case 'quarter': {
          const quarter = Math.floor(now.getMonth() / 3);
          const recordQuarter = Math.floor(recordDate.getMonth() / 3);
          return recordQuarter === quarter && recordDate.getFullYear() === now.getFullYear();
        }
        case 'year':
          return recordDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredRecords = getFilteredRecords();

  const totalIncome = filteredRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = filteredRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleTimeChange = (value: TimeFilterValue) => {
    onTimeFilterChange?.(value);
  };

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    onNavigateDate?.(direction);
  };

  const recentRecords = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Generate newsfeed posts from various activities
  const generateNewsfeed = (): Post[] => {
    const posts: Post[] = [];

    // Budget milestones
    budgets.forEach(budget => {
      const percentage = (budget.spent / budget.limit) * 100;
      if (percentage >= 50 && percentage <= 60) {
        posts.push({
          id: `budget-${budget.id}`,
          type: 'milestone',
          title: '🎯 Budget Milestone',
          description: `You've used ${percentage.toFixed(0)}% of your budget. Keep it up!`,
          timestamp: new Date().toISOString(),
          likes: Math.floor(Math.random() * 20) + 5,
          comments: Math.floor(Math.random() * 5),
          color: 'bg-primary/10',
        });
      }
    });

    // Savings achievements
    savings.forEach(saving => {
      const percentage = (saving.current / saving.target) * 100;
      if (percentage >= 75) {
        posts.push({
          id: `savings-${saving.id}`,
          type: 'achievement',
          title: '🏆 Savings Achievement',
          description: `Amazing! You're ${percentage.toFixed(0)}% to your savings goal!`,
          timestamp: new Date().toISOString(),
          likes: Math.floor(Math.random() * 30) + 10,
          comments: Math.floor(Math.random() * 8),
          color: 'bg-secondary/10',
        });
      }
    });

    // Financial insights
    if (totalIncome > totalExpenses) {
      posts.push({
        id: 'insight-positive',
        type: 'insight',
        title: '💰 Positive Cash Flow',
        description: `This month you earned $${(totalIncome - totalExpenses).toFixed(2)} more than you spent. Great job!`,
        timestamp: new Date().toISOString(),
        likes: Math.floor(Math.random() * 25) + 8,
        comments: Math.floor(Math.random() * 6),
        color: 'bg-primary/10',
      });
    }

    // Recent large transactions
    const largeTransactions = records.filter(r => r.amount > 500).slice(0, 2);
    largeTransactions.forEach(record => {
      const stream = streams.find(s => s.id === record.streamId);
      posts.push({
        id: `transaction-${record.id}`,
        type: 'activity',
        title: record.type === 'income' ? '💵 Large Income' : '💳 Large Expense',
        description: `${stream?.name}: $${record.amount.toFixed(2)} - ${record.note || 'No description'}`,
        timestamp: record.date,
        likes: Math.floor(Math.random() * 15) + 3,
        comments: Math.floor(Math.random() * 4),
        color: record.type === 'income' ? 'bg-primary/10' : 'bg-destructive/10',
      });
    });

    // Sort by timestamp
    return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const newsfeed = generateNewsfeed();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const accountCategories = categories.filter(cat => cat.scope === 'account');
  const uncategorizedAccounts = accounts.filter(acc => !accountCategories.find(cat => cat.id === acc.categoryId));
  const groupedAccounts = [
    ...accountCategories.map(category => ({
      category,
      accounts: accounts.filter(acc => acc.categoryId === category.id),
    })),
    ...(uncategorizedAccounts.length
      ? [{ category: { name: 'Other Accounts', color: '#6B7280' } as any, accounts: uncategorizedAccounts }]
      : []),
  ].filter(group => group.accounts.length > 0);

  return (  
    <div className="space-y-6">
      {/* Top toggle */}
      <div className="flex w-full rounded-xl bg-card border border-border shadow-sm p-1">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'analysis'
              ? 'bg-primary text-white shadow'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
            activeTab === 'dashboard'
              ? 'bg-primary text-white shadow'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('newsfeed')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
            activeTab === 'newsfeed'
              ? 'bg-primary text-white shadow'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Newsfeed
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">

          {/* Enhanced Balance Card */}
          <div className={`relative rounded-2xl p-5 shadow-xl overflow-hidden border ${
            theme === 'dark' 
              ? 'bg-emerald-950 text-white border-emerald-900' 
              : 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-900 border-emerald-200'
          }`}>
            {/* Subtle background elements */}
            <div className="absolute inset-0">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${
                theme === 'dark' ? 'bg-emerald-600/8' : 'bg-emerald-400/10'
              }`}></div>
              <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-xl ${
                theme === 'dark' ? 'bg-emerald-600/4' : 'bg-emerald-300/6'
              }`}></div>
            </div>
            
            {/* Subtle analysis icon background */}
            <div className="absolute -top-3 -right-3 w-44 h-44 opacity-4 transform rotate-12">
              <BarChart3 size={176} className={theme === 'dark' ? 'text-emerald-300' : 'text-emerald-100'} />
            </div>
            
            <div className="relative z-10 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-700'}`}>Welcome back,</p>
                  <h1 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-emerald-900'}`}>{user?.username || 'User'}</h1>
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-emerald-100' : 'text-emerald-600'}`}>Total Balance</p>
                  <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-emerald-900'}`}>{formatCurrency(totalBalance)}</h2>
                </div>
                <div className={`rounded-xl p-3 border ${
                  theme === 'dark' 
                    ? 'bg-emerald-600/15 border-emerald-600/25' 
                    : 'bg-white/80 border-emerald-300 shadow-sm'
                }`}>
                  <BarChart3 size={20} className={theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'} />
                </div>
              </div>
              
              {/* Financial metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => onNavigate?.('records')}
                  className={`rounded-xl p-4 border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-emerald-900/40 border-emerald-800 hover:bg-emerald-900/60'
                      : 'bg-white/70 border-emerald-200 hover:bg-white/90 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                      <TrendingUp size={16} className="text-emerald-400" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-emerald-100' : 'text-emerald-700'}`}>Income</span>
                  </div>
                  <p className={`text-xl font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-emerald-900'}`}>{formatCurrency(totalIncome)}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}>
                    {timeFilter === 'day' ? 'Today' : 
                     timeFilter === 'week' ? 'This week' : 
                     timeFilter === 'month' ? 'This month' : 
                     timeFilter === 'quarter' ? 'This quarter' : 
                     timeFilter === 'year' ? 'This year' : 'This period'}
                  </p>
                </div>
                
                <div 
                  onClick={() => onNavigate?.('records')}
                  className={`rounded-xl p-4 border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-emerald-900/40 border-emerald-800 hover:bg-emerald-900/60'
                      : 'bg-white/70 border-emerald-200 hover:bg-white/90 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-red-500/20 p-1.5 rounded-lg">
                      <TrendingDown size={16} className="text-red-500" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-emerald-100' : 'text-emerald-700'}`}>Expenses</span>
                  </div>
                  <p className={`text-xl font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-red-600'}`}>{formatCurrency(totalExpenses)}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}>
                    {timeFilter === 'day' ? 'Today' : 
                     timeFilter === 'week' ? 'This week' : 
                     timeFilter === 'month' ? 'This month' : 
                     timeFilter === 'quarter' ? 'This quarter' : 
                     timeFilter === 'year' ? 'This year' : 'This period'}
                  </p>
                </div>
              </div>
              
              {/* Net flow indicator */}
              <div className={`rounded-xl p-4 border ${
                theme === 'dark'
                  ? 'bg-emerald-900/25 border-emerald-800'
                  : 'bg-white/60 border-emerald-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                      Net Flow {timeFilter === 'day' ? 'Today' : 
                       timeFilter === 'week' ? 'This Week' : 
                       timeFilter === 'month' ? 'This Month' : 
                       timeFilter === 'quarter' ? 'This Quarter' : 
                       timeFilter === 'year' ? 'This Year' : 'This Period'}
                    </p>
                    <p className={`text-lg font-semibold ${totalIncome - totalExpenses >= 0 ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : (theme === 'dark' ? 'text-red-400' : 'text-red-600')}`}>
                      {totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${totalIncome - totalExpenses >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {totalIncome - totalExpenses >= 0 ? (
                      <TrendingUp size={16} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={16} className="text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Useful Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Recent Transactions Card */}
            <div className={`rounded-2xl p-6 shadow-lg border ${
              theme === 'dark' 
                ? 'bg-card text-foreground border-border' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-foreground' : 'text-gray-900'}`}>Recent Transactions</h3>
                <button 
                  onClick={() => onNavigate?.('records')}
                  className={`text-sm ${theme === 'dark' ? 'text-primary hover:text-primary/80' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentRecords.slice(0, 4).map((record) => {
                  const stream = streams.find(s => s.id === record.streamId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          record.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <IconComponent
                            name={stream?.iconName || 'Wallet'}
                            size={16}
                            style={{ color: record.type === 'income' ? '#10B981' : '#EF4444' }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{stream?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className={`font-semibold ${
                        record.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                      </p>
                    </div>
                  );
                })}
                {recentRecords.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No recent transactions</p>
                )}
              </div>
            </div>

            {/* Top Spending Categories Card */}
            <div className={`rounded-2xl p-6 shadow-lg border ${
              theme === 'dark' 
                ? 'bg-card text-foreground border-border' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-foreground' : 'text-gray-900'}`}>Top Categories</h3>
                <button 
                  onClick={() => onNavigate?.('analysis')}
                  className={`text-sm ${theme === 'dark' ? 'text-primary hover:text-primary/80' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Analysis
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(() => {
                  const categorySpending = categories
                    .filter(cat => cat.scope === 'expense')
                    .map(category => {
                      const categoryRecords = filteredRecords.filter(r => 
                        r.type === 'expense' && streams.find(s => s.id === r.streamId)?.categoryId === category.id
                      );
                      const total = categoryRecords.reduce((sum, r) => sum + r.amount, 0);
                      return { category, total };
                    })
                    .filter(item => item.total > 0)
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 4);
                  
                  return categorySpending.map((item, index) => (
                    <div key={item.category.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm`}
                             style={{ backgroundColor: item.category.color }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {filteredRecords.filter(r => 
                              r.type === 'expense' && streams.find(s => s.id === r.streamId)?.categoryId === item.category.id
                            ).length} transactions
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600">{formatCurrency(item.total)}</p>
                    </div>
                  ));
                })()}
                {categories.filter(cat => cat.scope === 'expense').length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No expense categories</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
      {activeTab === 'analysis' && (
          <AnalysisScreen showInlineFilter={showAnalysisFilter} />
      )}
    </div>
  );
};