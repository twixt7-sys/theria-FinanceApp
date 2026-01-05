import React from 'react';
import { User, Mail, Calendar, LogOut, Moon, Sun, Download, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleExport = () => {
    // Export demo data
    const data = {
      accounts: localStorage.getItem('theria-accounts'),
      streams: localStorage.getItem('theria-streams'),
      categories: localStorage.getItem('theria-categories'),
      records: localStorage.getItem('theria-records'),
      budgets: localStorage.getItem('theria-budgets'),
      savings: localStorage.getItem('theria-savings'),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theria-backup-${new Date().toISOString()}.json`;
    a.click();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem('theria-accounts');
      localStorage.removeItem('theria-streams');
      localStorage.removeItem('theria-categories');
      localStorage.removeItem('theria-records');
      localStorage.removeItem('theria-budgets');
      localStorage.removeItem('theria-savings');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* User Info Card */}
      <div className="bg-primary rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.username}</h2>
            <p className="text-white/80">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg">Account Details</h3>
        <Separator />
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="text-muted-foreground" size={20} />
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground" size={20} />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="text-muted-foreground" size={20} />
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg">Settings</h3>
        <Separator />

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <div className="text-left">
              <p className="font-medium">Appearance</p>
              <p className="text-sm text-muted-foreground">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-muted rounded-lg text-sm">
            {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
          </div>
        </button>
      </div>

      {/* Data Management */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg">Data Management</h3>
        <Separator />

        <div className="space-y-3">
          <Button
            onClick={handleExport}
            variant="outline"
            className="w-full justify-start"
          >
            <Download size={20} className="mr-3" />
            Export Data
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <Trash2 size={20} className="mr-3" />
            Reset All Data
          </Button>
        </div>
      </div>

      {/* Demo Mode Banner */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4">
        <p className="text-sm text-center">
          🎯 <strong>Demo Mode</strong> • Data is stored locally in your browser
        </p>
      </div>

      {/* Logout Button */}
      <Button
        onClick={logout}
        variant="destructive"
        className="w-full"
      >
        <LogOut size={20} className="mr-2" />
        Logout
      </Button>
    </div>
  );
};
