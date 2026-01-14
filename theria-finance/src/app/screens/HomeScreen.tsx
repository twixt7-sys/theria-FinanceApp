import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Newspaper,
  BarChart3,
  Flame
} from 'lucide-react';import { useData } from '../contexts/DataContext';

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
          <div className={`relative rounded-2xl p-6 shadow-xl overflow-hidden border ${
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
            <div className="absolute -top-4 -right-4 w-48 h-48 opacity-4 transform rotate-12">
              <BarChart3 size={192} className={theme === 'dark' ? 'text-emerald-300' : 'text-emerald-100'} />
            </div>
            
            <div className="relative z-10 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-700'}`}>Welcome back,</p>
                  <h1 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-emerald-900'}`}>{user?.username || 'User'}</h1>
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-emerald-100' : 'text-emerald-600'}`}>Total Balance</p>
                  <h2 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-emerald-900'}`}>{formatCurrency(totalBalance)}</h2>
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

          {/* Accounts grouped by category */}
          <div className="space-y-4">
            {groupedAccounts.map(group => (
              <div key={group.category.name} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.category.color || '#6B7280' }} />
                  <h3 className="text-sm font-semibold text-foreground">{group.category.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 transition-all cursor-pointer group min-h-[200px] overflow-hidden hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
                      style={{ 
                        background: `linear-gradient(135deg, ${account.color}dd, ${account.color}99)`,
                        boxShadow: `0 10px 30px ${account.color}33, 0 20px 40px ${account.color}22, inset 0 1px 0 rgba(255,255,255,0.1)`
                      }}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white/20"></div>
                        <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-white/15"></div>
                        <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full border-2 border-white/10"></div>
                      </div>
                      
                      <div className="absolute -top-8 right-2 w-32 h-32 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
                        <IconComponent
                          name={account.iconName}
                          size={128}
                          style={{ color: 'white', transform: 'scaleX(-1)' }}
                        />
                      </div>
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                              <IconComponent
                                name={account.iconName}
                                size={18}
                                style={{ color: 'white' }}
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg truncate">{account.name}</h3>
                              {account.bankName && (
                                <p className="text-white/80 text-sm">{account.bankName}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              {account.cardType && (
                                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                                  {account.cardType.charAt(0).toUpperCase() + account.cardType.slice(1)}
                                </span>
                              )}
                              {account.isSavings && (
                                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                                  Savings
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center space-y-3">
                          {account.accountNumber && (
                            <div className="text-white/90 font-mono text-sm tracking-wider">
                              •••• •••• •••• {account.accountNumber.slice(-4)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white/70 text-xs mb-1">Balance</p>
                            <p className="text-white font-bold text-xl">{formatCurrency(account.balance)}</p>
                          </div>
                          
                          <div className="text-right">
                            {categories.find(c => c.id === account.categoryId) && (
                              <p className="text-white/60 text-xs">
                                {categories.find(c => c.id === account.categoryId)?.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
      {activeTab === 'analysis' && (
          <AnalysisScreen showInlineFilter={showAnalysisFilter} />
      )}

    </div>
  );
};