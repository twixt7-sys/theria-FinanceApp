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
import { IconComponent } from '../components/IconComponent';
import { AnalysisScreen } from './AnalysisScreen';

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
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { accounts, records, streams, budgets, savings, categories } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'newsfeed' | 'analysis'>('dashboard');
  const [showAnalysisFilter, setShowAnalysisFilter] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const thisMonthRecords = records.filter(r => {
    const date = new Date(r.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalIncome = thisMonthRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = thisMonthRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

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

          {/* Balance Card */}
          <div className="relative bg-blue-600 rounded-2xl p-6 text-white shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 space-y-6">
              <div>
                <p className="text-white/80 text-sm mb-2">Total Balance</p>
                <h2 className="text-4xl font-bold">{formatCurrency(totalBalance)}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => onNavigate?.('records')}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-md cursor-pointer hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/25 p-1.5 rounded-lg">
                      <TrendingUp size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm text-white/90 font-medium">Income</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
                  <p className="text-xs text-white/70 mt-1">This month</p>
                </div>
                
                <div 
                  onClick={() => onNavigate?.('records')}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-md cursor-pointer hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/25 p-1.5 rounded-lg">
                      <TrendingDown size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm text-white/90 font-medium">Expenses</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-white/70 mt-1">This month</p>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {group.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex flex-col bg-card backdrop-blur-sm border border-border rounded-xl p-4 hover:shadow-lg transition-all shadow-sm min-h-[140px]"
                      style={{ boxShadow: `0 8px 20px ${account.color}22` }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-3"
                        style={{ backgroundColor: account.color }}
                      >
                        <IconComponent
                          name={account.iconName}
                          className="text-white"
                          style={{ color: 'white' }}
                          size={22}
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <p className="text-sm font-semibold text-foreground truncate mb-2">{account.name}</p>
                        <p className="text-lg font-bold">{formatCurrency(account.balance)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'newsfeed' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="text-primary" size={18} />
              <h3 className="text-lg font-semibold">Financial Feed</h3>
            </div>
            <span className="text-xs text-muted-foreground">Updated just now</span>
          </div>

          {/* Create Post Card */}
          <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <button className="w-full text-left px-4 py-3 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-colors text-muted-foreground">
                  Share your financial milestone...
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <Heart size={16} />
                  <span>Milestone</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <MessageCircle size={16} />
                  <span>Insight</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {newsfeed.map((post) => (
              <div
                key={post.id}
                className={`bg-card ${post.color} border border-border rounded-2xl p-5 hover:shadow-lg transition-all shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">{post.title}</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{post.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-medium">{formatDate(post.timestamp)}</span>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp size={16} />
                      <span className="text-xs font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle size={16} />
                      <span className="text-xs font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
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