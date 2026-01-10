import React from 'react';
import { User, Mail, Calendar, LogOut, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* User Info Card */}
      <div className="bg-primary rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.username}</h2>
            <p className="text-white/80">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Streak Section */}
        <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-400/30">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/30 p-2 rounded-lg">
              <Flame size={20} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Current Streak</p>
              <p className="text-2xl font-bold">7 days</p>
              <p className="text-xs mt-1">Keep tracking your finances!</p>
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

      {/* Footer */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Theria Finance App
          </p>
          <p className="text-xs text-muted-foreground">
            Manage your finances with ease
          </p>
          <p className="text-xs text-muted-foreground">
            © 2024 All rights reserved
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        onClick={logout}
        variant="destructive"
        className="w-full shadow-sm"
      >
        <LogOut size={20} className="mr-2" />
        Logout
      </Button>
    </div>
  );
};
