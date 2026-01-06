import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Heart, MessageCircle, Share2, ThumbsUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { IconComponent } from '../components/IconComponent';

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

export const HomeScreen: React.FC = () => {
  const { accounts, records, streams, budgets, savings } = useData();
  const { user } = useAuth();

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

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="relative bg-blue-600 rounded-2xl p-6 text-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-2">Total Balance</p>
          <h2 className="text-4xl font-bold mb-6">{formatCurrency(totalBalance)}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/25 p-1.5 rounded-lg">
                  <TrendingUp size={16} strokeWidth={2.5} />
                </div>
                <span className="text-sm text-white/90 font-medium">Income</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-white/70 mt-1">This month</p>
            </div>
            
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-md">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {accounts.slice(0, 3).map((account) => (
          <div key={account.id} className="bg-card backdrop-blur-sm border border-border rounded-xl p-4 hover:shadow-lg transition-all shadow-md">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-sm"
              style={{ backgroundColor: account.color }}
            >
              <IconComponent name={account.iconName} style={{ color: 'white' }} size={20} />
            </div>
            <p className="text-xs text-muted-foreground mb-1 truncate font-medium">{account.name}</p>
            <p className="font-bold truncate">{formatCurrency(account.balance)}</p>
          </div>
        ))}
      </div>

      {/* Newsfeed 
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Your Financial Feed</h3>
          <span className="text-sm text-primary font-medium">Updated just now</span>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {newsfeed.map((post) => (
            <div
              key={post.id}
              className={`${post.color} backdrop-blur-sm border border-border rounded-2xl p-5 hover:shadow-lg transition-all`}
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

          {/* Recent Transactions Feed
          <div className="space-y-3 mt-6">
            <h4 className="font-bold text-foreground px-1">Recent Activity</h4>
            {recentRecords.map((record) => {
              const stream = streams.find(s => s.id === record.streamId);
              const isIncome = record.type === 'income';
              
              return (
                <div
                  key={record.id}
                  className={`${
                    isIncome
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-destructive/10 border-destructive/30'
                  } backdrop-blur-sm border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${stream?.color || '#6B7280'}40` }}
                  >
                    <IconComponent
                      name={stream?.iconName || 'Circle'}
                      style={{ color: stream?.color || '#6B7280' }}
                      size={20}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-foreground">{stream?.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {record.note || 'No description'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-lg ${isIncome ? 'text-primary' : 'text-destructive'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(record.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatDate(record.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      */}
    </div>
  );
};