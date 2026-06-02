import React from 'react';
import { User, Mail, Calendar, LogOut, Flame } from 'lucide-react';
import { useAuth } from '../../../core/state/AuthContext';
import { Button } from '../../../shared/components/ui/button';
import { Separator } from '../../../shared/components/ui/separator';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-3 pb-6 max-w-4xl mx-auto">
      {/* User Info Card */}
      <div className="bg-primary rounded-xl p-4 text-white">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.username}</h2>
            <p className="text-xs text-white/85">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Streak Section */}
        <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-3.5 border border-orange-400/30">
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-500/30 p-1.5 rounded-lg">
              <Flame size={18} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">Current Streak</p>
              <p className="text-lg font-bold">7 days</p>
              <p className="text-xs mt-1">Keep tracking your finances!</p>
            </div>
          </div>
        </div>

      {/* Account Details */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
        <h3 className="font-bold text-sm">Account Details</h3>
        <Separator />
        
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <User className="text-muted-foreground" size={18} />
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-sm font-medium">{user?.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Mail className="text-muted-foreground" size={18} />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Calendar className="text-muted-foreground" size={18} />
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">
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
      <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
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
