import React from 'react';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
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
