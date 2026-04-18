import React from 'react';
import { Flame, Trophy, Target, Calendar, TrendingUp, Award } from 'lucide-react';

export const StreakScreen: React.FC = () => {
  const currentStreak = 7;
  const longestStreak = 15;
  const totalDays = 42;
  const monthlyGoal = 20;
  const monthlyProgress = 12;

  const getStreakColor = (day: number) => {
    if (day <= currentStreak) return 'bg-orange-500';
    return 'bg-muted';
  };

  return (
    <div className="space-y-4">
      {/* Header with Current Streak */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Flame size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">{currentStreak}</h1>
          <p className="text-xl font-medium opacity-90">Day Streak</p>
          <p className="text-sm opacity-75 mt-2">Keep it going! You're on fire 🔥</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="text-yellow-500" size={24} />
            <h3 className="font-semibold text-foreground">Longest</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
          <p className="text-sm text-muted-foreground">days</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="text-blue-500" size={24} />
            <h3 className="font-semibold text-foreground">Total Days</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalDays}</p>
          <p className="text-sm text-muted-foreground">tracked</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Target className="text-green-500" size={24} />
            <h3 className="font-semibold text-foreground">Monthly Goal</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{monthlyProgress}/{monthlyGoal}</p>
          <p className="text-sm text-muted-foreground">days</p>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-purple-500" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Monthly Progress</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round((monthlyProgress / monthlyGoal) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(monthlyProgress / monthlyGoal) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Award className="text-orange-500" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                getStreakColor(i + 1)
              }`}
              title={`Day ${i + 1}`}
            >
              {i + 1 <= currentStreak && (
                <Flame size={12} className="text-white" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded" />
            <span className="text-muted-foreground">Active days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted rounded" />
            <span className="text-muted-foreground">Inactive days</span>
          </div>
        </div>
      </div>

      {/* Motivational Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
            Keep the Streak Alive!
          </h3>
          <p className="text-orange-700 dark:text-orange-300 mb-4">
            You're doing amazing! Consistency is key to achieving your financial goals.
          </p>
          <div className="flex justify-center gap-2">
            {['🔥', '💪', '🎯', '⭐', '🚀'].map((emoji, i) => (
              <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
