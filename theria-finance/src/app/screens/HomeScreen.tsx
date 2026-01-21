import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [showNavToggle, setShowNavToggle] = useState(false);
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
    <div className="space-y-4 pb-32">
      {/* Top toggle */}
      <AnimatePresence initial={false}>
        {showNavToggle && (
          <motion.div
            key="nav-toggle"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex w-full rounded-xl bg-card border border-border shadow-sm p-0.5">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'analysis'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('newsfeed')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'newsfeed'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Newsfeed
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'dashboard' && (
        <div className="space-y-4">

          {/* Simple Blue Balance Card */}
          <div 
            className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 text-white overflow-hidden transition-all"
            style={{ 
              background: 'linear-gradient(135deg, #2563ebdd, #1e3a8a99)'
            }}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-white/20"></div>
              <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full border-2 border-white/15"></div>
              <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border-2 border-white/10"></div>
            </div>
            
            {/* Background icon */}
            <div className="absolute -top-6 right-2 w-24 h-24 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
              <BarChart3 size={96} style={{ color: 'white', transform: 'scaleX(-1)' }} />
            </div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 mb-0.5 text-sm">Total Balance</p>
                  <h2 className="text-2xl font-bold mb-0.5">{formatCurrency(totalBalance)}</h2>
                  <p className="text-white/70 text-sm">Dashboard Overview</p>
                </div>
                <button 
                  onClick={() => setShowNavToggle(!showNavToggle)}
                  className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    showNavToggle 
                      ? 'bg-white/20 hover:bg-white/30' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title="Toggle Navigation"
                >
                  <MoreHorizontal size={20} className="text-white" />
                </button>
              </div>
              
              <div className="pt-2 border-t border-white/20 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-white/80 text-sm">Income</p>
                  <p className="text-sm font-semibold text-green-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-white/80 text-sm">Expenses</p>
                  <p className="text-sm font-semibold text-red-400">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-white/80 text-sm">Net Flow</p>
                  <p className={`text-sm font-semibold ${totalIncome - totalExpenses >= 0 ? 'text-white' : 'text-white/70'}`}>
                    {totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Useful Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Recent Transactions Card */}
            <div className={`rounded-2xl p-4 shadow-lg border ${
              theme === 'dark' 
                ? 'bg-card text-foreground border-border' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-foreground' : 'text-gray-900'}`}>Recent Transactions</h3>
                <button 
                  onClick={() => onNavigate?.('records')}
                  className={`text-sm ${theme === 'dark' ? 'text-primary hover:text-primary/80' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {recentRecords.slice(0, 4).map((record) => {
                  const stream = streams.find(s => s.id === record.streamId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          record.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <IconComponent
                            name={stream?.iconName || 'Wallet'}
                            size={14}
                            style={{ color: record.type === 'income' ? '#10B981' : '#EF4444' }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-xs">{stream?.name || 'Unknown'}</p>
                          <p className="text-[11px] text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className={`font-semibold text-sm ${
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
            <div className={`rounded-2xl p-4 shadow-lg border ${
              theme === 'dark' 
                ? 'bg-card text-foreground border-border' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-foreground' : 'text-gray-900'}`}>Top Categories</h3>
                <button 
                  onClick={() => onNavigate?.('analysis')}
                  className={`text-sm ${theme === 'dark' ? 'text-primary hover:text-primary/80' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Analysis
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
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
                    <div key={item.category.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-semibold text-xs`}
                             style={{ backgroundColor: item.category.color }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-xs">{item.category.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {filteredRecords.filter(r => 
                              r.type === 'expense' && streams.find(s => s.id === r.streamId)?.categoryId === item.category.id
                            ).length} transactions
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600 text-sm">{formatCurrency(item.total)}</p>
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